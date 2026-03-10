import uuid

from app.security import (
    decode_access_token,
    decode_refresh_token,
    hash_password,
    hash_refresh_token,
    issue_access_token,
    issue_refresh_token,
    verify_password,
)


def test_password_hash_roundtrip() -> None:
    password = "StrongPassword123!"
    encoded = hash_password(password)
    assert verify_password(password, encoded) is True
    assert verify_password("wrong-password", encoded) is False


def test_access_token_issue_and_decode() -> None:
    user_id = uuid.uuid4()
    token, expires_in = issue_access_token(user_id)
    claims = decode_access_token(token)
    assert claims["sub"] == str(user_id)
    assert claims["typ"] == "access"
    assert expires_in > 0


def test_refresh_token_issue_and_decode() -> None:
    user_id = uuid.uuid4()
    session_id = uuid.uuid4()
    token, _expires_at = issue_refresh_token(user_id, session_id)
    claims = decode_refresh_token(token)
    assert claims["sub"] == str(user_id)
    assert claims["sid"] == str(session_id)
    assert hash_refresh_token(token) != token
