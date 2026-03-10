"""Security helpers for password hashing and JWT handling."""

import base64
import hashlib
import hmac
import json
import secrets
import time
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from app.config import settings


class TokenDecodeError(Exception):
    """Raised when a token cannot be decoded or validated."""


def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")


def _b64url_decode(raw: str) -> bytes:
    padding = "=" * ((4 - len(raw) % 4) % 4)
    return base64.urlsafe_b64decode(raw + padding)


def _json_compact(payload: dict[str, Any]) -> bytes:
    return json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")


def _encode_jwt(payload: dict[str, Any]) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_part = _b64url_encode(_json_compact(header))
    payload_part = _b64url_encode(_json_compact(payload))
    signing_input = f"{header_part}.{payload_part}".encode()
    signature = hmac.new(
        settings.API_JWT_SECRET.encode("utf-8"),
        signing_input,
        hashlib.sha256,
    ).digest()
    signature_part = _b64url_encode(signature)
    return f"{header_part}.{payload_part}.{signature_part}"


def _decode_jwt(token: str) -> dict[str, Any]:
    parts = token.split(".")
    if len(parts) != 3:
        raise TokenDecodeError("Malformed token.")

    header_part, payload_part, signature_part = parts
    signing_input = f"{header_part}.{payload_part}".encode()
    expected_signature = hmac.new(
        settings.API_JWT_SECRET.encode("utf-8"),
        signing_input,
        hashlib.sha256,
    ).digest()

    provided_signature = _b64url_decode(signature_part)
    if not hmac.compare_digest(expected_signature, provided_signature):
        raise TokenDecodeError("Invalid token signature.")

    payload_bytes = _b64url_decode(payload_part)
    payload = json.loads(payload_bytes.decode("utf-8"))
    if not isinstance(payload, dict):
        raise TokenDecodeError("Invalid payload.")

    exp = payload.get("exp")
    if not isinstance(exp, int):
        raise TokenDecodeError("Missing expiration.")
    if exp <= int(time.time()):
        raise TokenDecodeError("Token expired.")

    return payload


def hash_password(password: str) -> str:
    """Hash password with scrypt."""

    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters.")

    n, r, p = 2**14, 8, 1
    salt = secrets.token_bytes(16)
    derived = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=n,
        r=r,
        p=p,
        dklen=64,
    )
    return (
        "scrypt"
        f"${n}"
        f"${r}"
        f"${p}"
        f"${_b64url_encode(salt)}"
        f"${_b64url_encode(derived)}"
    )


def verify_password(password: str, encoded_hash: str | None) -> bool:
    """Verify password against stored scrypt hash."""

    if not encoded_hash:
        return False
    try:
        algorithm, n_raw, r_raw, p_raw, salt_raw, digest_raw = encoded_hash.split("$")
        if algorithm != "scrypt":
            return False
        n, r, p = int(n_raw), int(r_raw), int(p_raw)
        salt = _b64url_decode(salt_raw)
        expected = _b64url_decode(digest_raw)
    except (ValueError, TypeError):
        return False

    actual = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=n,
        r=r,
        p=p,
        dklen=len(expected),
    )
    return hmac.compare_digest(actual, expected)


def hash_refresh_token(token: str) -> str:
    """Hash refresh token for storage."""

    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def issue_access_token(user_id: uuid.UUID) -> tuple[str, int]:
    """Create a signed access token."""

    now = datetime.now(UTC)
    ttl_seconds = settings.API_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    exp = int((now + timedelta(seconds=ttl_seconds)).timestamp())
    payload = {
        "iss": settings.API_JWT_ISSUER,
        "sub": str(user_id),
        "typ": "access",
        "iat": int(now.timestamp()),
        "exp": exp,
    }
    return _encode_jwt(payload), ttl_seconds


def issue_refresh_token(user_id: uuid.UUID, session_id: uuid.UUID) -> tuple[str, datetime]:
    """Create a signed refresh token."""

    now = datetime.now(UTC)
    expires_at = now + timedelta(days=settings.API_REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "iss": settings.API_JWT_ISSUER,
        "sub": str(user_id),
        "sid": str(session_id),
        "typ": "refresh",
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    return _encode_jwt(payload), expires_at


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate access token."""

    payload = _decode_jwt(token)
    if payload.get("typ") != "access":
        raise TokenDecodeError("Unexpected token type.")
    return payload


def decode_refresh_token(token: str) -> dict[str, Any]:
    """Decode and validate refresh token."""

    payload = _decode_jwt(token)
    if payload.get("typ") != "refresh":
        raise TokenDecodeError("Unexpected token type.")
    return payload
