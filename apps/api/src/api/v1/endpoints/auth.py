"""Auth endpoints for register/login/token lifecycle."""

import ipaddress
import secrets
import uuid
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, Request, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from api.deps import get_current_user, get_request_id
from db import get_db_session
from errors import ApiError
from models.user import User, UserSession, VerificationToken
from schemas.auth import (
    AuthResponseData,
    AuthUser,
    LoginRequest,
    LogoutRequest,
    LogoutResponseData,
    MeResponseData,
    RefreshRequest,
    RefreshResponseData,
    RegisterRequest,
    TokenPair,
    VerifyEmailRequest,
    VerifyEmailResponseData,
)
from schemas.common import Envelope
from security import (
    TokenDecodeError,
    decode_refresh_token,
    hash_password,
    hash_refresh_token,
    hash_token,
    issue_access_token,
    issue_refresh_token,
    verify_password,
)
from services.email import send_verification_email

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_payload(user: User) -> AuthUser:
    return AuthUser(
        id=user.id,
        email=user.email,
        username=user.username,
        status=user.status,
        locale=user.locale,
    )


def _success(data: object, request_id: str | None) -> dict[str, object]:
    return {
        "data": data,
        "meta": {"request_id": request_id},
        "error": None,
    }


def _client_ip(request: Request) -> str | None:
    if request.client is None:
        return None
    host = request.client.host
    try:
        ipaddress.ip_address(host)
    except ValueError:
        return None
    return host


def _duplicate_field_from_integrity_error(exc: IntegrityError) -> str | None:
    orig = getattr(exc, "orig", None)
    diag = getattr(orig, "diag", None)
    constraint_name = str(getattr(diag, "constraint_name", "")).lower()
    detail = str(orig).lower()

    if "email" in constraint_name or "email" in detail:
        return "email"
    if "username" in constraint_name or "username" in detail:
        return "username"
    return None


def _create_session_and_tokens(db: Session, user: User, request: Request) -> TokenPair:
    now = datetime.now(UTC)

    session = UserSession(
        user_id=user.id,
        refresh_token_hash="pending",
        expires_at=now,
        ip=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    db.add(session)
    db.flush()

    refresh_token, refresh_expires_at = issue_refresh_token(user.id, session.id)
    session.refresh_token_hash = hash_refresh_token(refresh_token)
    session.expires_at = refresh_expires_at

    access_token, access_expires_in = issue_access_token(user.id)
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=access_expires_in,
    )


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=Envelope[AuthResponseData],
)
def register(
    payload: RegisterRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db_session)],
    request_id: Annotated[str | None, Depends(get_request_id)],
) -> dict[str, object]:
    existing_email = db.scalar(select(User).where(User.email == payload.email))
    if existing_email is not None:
        raise ApiError(
            status_code=409,
            code="VALIDATION_ERROR",
            message="Email is already registered.",
            details={"field": "email"},
        )

    existing_username = db.scalar(select(User).where(User.username == payload.username))
    if existing_username is not None:
        raise ApiError(
            status_code=409,
            code="VALIDATION_ERROR",
            message="Username is already taken.",
            details={"field": "username"},
        )

    now = datetime.now(UTC)
    user = User(
        email=payload.email,
        username=payload.username,
        password_hash=hash_password(payload.password),
        status="active",
        locale=payload.locale,
        terms_accepted_at=now,
        privacy_accepted_at=now,
        marketing_consent=payload.marketing_consent,
        marketing_consent_at=now if payload.marketing_consent else None,
        last_login_at=now,
    )
    db.add(user)
    db.flush()

    # Generate verification token
    raw_token = secrets.token_urlsafe(32)
    verification_token = VerificationToken(
        user_id=user.id,
        token_hash=hash_token(raw_token),
        purpose="email_verification",
        expires_at=now + timedelta(hours=24),
    )
    db.add(verification_token)

    try:
        tokens = _create_session_and_tokens(db, user, request)
        db.commit()
        background_tasks.add_task(send_verification_email, user.email, raw_token, user.locale)
    except IntegrityError as exc:
        db.rollback()
        orig = getattr(exc, "orig", None)
        sqlstate = str(getattr(orig, "sqlstate", "") or getattr(orig, "pgcode", ""))
        if sqlstate != "23505":
            raise

        duplicate_field = _duplicate_field_from_integrity_error(exc)
        if duplicate_field == "email":
            message = "Email is already registered."
        elif duplicate_field == "username":
            message = "Username is already taken."
        else:
            message = "Email or username is already in use."

        raise ApiError(
            status_code=409,
            code="VALIDATION_ERROR",
            message=message,
            details={"field": duplicate_field or "identifier"},
        ) from None

    response_data = AuthResponseData(
        user=_user_payload(user),
        tokens=tokens,
    ).model_dump()
    return _success(response_data, request_id)


@router.post("/login", response_model=Envelope[AuthResponseData])
def login(
    payload: LoginRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db_session)],
    request_id: Annotated[str | None, Depends(get_request_id)],
) -> dict[str, object]:
    user = db.scalar(
        select(User).where(
            or_(
                User.email == payload.identifier.lower(),
                User.username == payload.identifier,
            )
        )
    )

    if user is None or not verify_password(payload.password, user.password_hash):
        raise ApiError(
            status_code=401,
            code="AUTH_INVALID_CREDENTIALS",
            message="Invalid credentials.",
        )
    if user.status != "active":
        raise ApiError(
            status_code=403,
            code="AUTH_FORBIDDEN",
            message="User account is not active.",
        )

    user.last_login_at = datetime.now(UTC)
    tokens = _create_session_and_tokens(db, user, request)
    db.commit()

    response_data = AuthResponseData(
        user=_user_payload(user),
        tokens=tokens,
    ).model_dump()
    return _success(response_data, request_id)


@router.post("/refresh", response_model=Envelope[RefreshResponseData])
def refresh(
    payload: RefreshRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db_session)],
    request_id: Annotated[str | None, Depends(get_request_id)],
) -> dict[str, object]:
    try:
        claims = decode_refresh_token(payload.refresh_token)
        session_id = uuid.UUID(str(claims.get("sid")))
        user_id = uuid.UUID(str(claims.get("sub")))
    except (TokenDecodeError, ValueError):
        raise ApiError(
            status_code=401,
            code="AUTH_TOKEN_EXPIRED",
            message="Invalid or expired refresh token.",
        ) from None

    session = db.get(UserSession, session_id)
    now = datetime.now(UTC)
    if session is None or session.user_id != user_id:
        raise ApiError(
            status_code=401,
            code="AUTH_FORBIDDEN",
            message="Refresh session not found.",
        )
    expires_at = session.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    if session.revoked_at is not None or expires_at <= now:
        raise ApiError(
            status_code=401,
            code="AUTH_TOKEN_EXPIRED",
            message="Refresh token expired.",
        )
    if session.refresh_token_hash != hash_refresh_token(payload.refresh_token):
        raise ApiError(
            status_code=401,
            code="AUTH_FORBIDDEN",
            message="Refresh token mismatch.",
        )

    user = db.get(User, user_id)
    if user is None or user.status != "active":
        raise ApiError(
            status_code=403,
            code="AUTH_FORBIDDEN",
            message="User account is not active.",
        )

    session.revoked_at = now
    tokens = _create_session_and_tokens(db, user, request)
    db.commit()

    response_data = RefreshResponseData(tokens=tokens).model_dump()
    return _success(response_data, request_id)


@router.post("/logout", response_model=Envelope[LogoutResponseData])
def logout(
    payload: LogoutRequest,
    db: Annotated[Session, Depends(get_db_session)],
    request_id: Annotated[str | None, Depends(get_request_id)],
) -> dict[str, object]:
    try:
        claims = decode_refresh_token(payload.refresh_token)
        session_id = uuid.UUID(str(claims.get("sid")))
    except (TokenDecodeError, ValueError):
        response_data = LogoutResponseData(logged_out=True).model_dump()
        return _success(response_data, request_id)

    session = db.get(UserSession, session_id)
    if session is not None and session.revoked_at is None:
        session.revoked_at = datetime.now(UTC)
        db.commit()

    response_data = LogoutResponseData(logged_out=True).model_dump()
    return _success(response_data, request_id)


@router.get("/me", response_model=Envelope[MeResponseData])
def me(
    current_user: Annotated[User, Depends(get_current_user)],
    request_id: Annotated[str | None, Depends(get_request_id)],
) -> dict[str, object]:
    response_data = MeResponseData(user=_user_payload(current_user)).model_dump()
    return _success(response_data, request_id)


@router.post("/verify-email", response_model=Envelope[VerifyEmailResponseData])
def verify_email(
    payload: VerifyEmailRequest,
    db: Annotated[Session, Depends(get_db_session)],
    request_id: Annotated[str | None, Depends(get_request_id)],
) -> dict[str, object]:
    """Verify user email using a token."""
    token_hash = hash_token(payload.token)
    now = datetime.now(UTC)

    # Find the token
    token_record = db.scalar(
        select(VerificationToken).where(
            VerificationToken.token_hash == token_hash,
            VerificationToken.purpose == "email_verification",
            VerificationToken.expires_at > now,
        )
    )

    if not token_record:
        raise ApiError(
            status_code=400,
            code="AUTH_INVALID_TOKEN",
            message="Invalid or expired verification token.",
        )

    user = db.get(User, token_record.user_id)
    if not user:
        raise ApiError(
            status_code=404,
            code="USER_NOT_FOUND",
            message="User not found.",
        )

    # Mark as confirmed
    user.email_confirmed_at = now
    
    # Clean up token
    db.delete(token_record)
    db.commit()

    response_data = VerifyEmailResponseData().model_dump()
    return _success(response_data, request_id)


@router.post("/resend-verification", response_model=Envelope[dict[str, str]])
def resend_verification(
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
    request_id: Annotated[str | None, Depends(get_request_id)],
) -> dict[str, object]:
    """Resend email verification token."""
    if current_user.email_confirmed_at is not None:
        raise ApiError(
            status_code=400,
            code="AUTH_ALREADY_VERIFIED",
            message="Email is already verified.",
        )

    now = datetime.now(UTC)

    # Invalidate existing tokens
    db.execute(
        VerificationToken.__table__.delete().where(
            VerificationToken.user_id == current_user.id,
            VerificationToken.purpose == "email_verification",
        )
    )

    # Generate new token
    raw_token = secrets.token_urlsafe(32)
    verification_token = VerificationToken(
        user_id=current_user.id,
        token_hash=hash_token(raw_token),
        purpose="email_verification",
        expires_at=now + timedelta(hours=24),
    )
    db.add(verification_token)
    db.commit()

    background_tasks.add_task(send_verification_email, current_user.email, raw_token, current_user.locale)
    
    return _success({"status": "success", "message": "Verification email resent."}, request_id)
