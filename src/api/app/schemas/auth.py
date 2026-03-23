"""Auth request/response schemas."""

import re
from datetime import datetime
import uuid

from pydantic import BaseModel, Field, field_validator

_USERNAME_RE = re.compile(r"^[a-zA-Z0-9_]{3,32}$")
_LOCALE_VALUES = {"en", "tr", "de", "ru", "es", "fr"}


class RegisterRequest(BaseModel):
    """Register payload."""

    email: str
    username: str
    password: str = Field(min_length=8, max_length=128)
    locale: str = "en"
    terms_accepted: bool
    privacy_accepted: bool
    marketing_consent: bool = False

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized:
            raise ValueError("Invalid email format.")
        return normalized

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        trimmed = value.strip()
        if not _USERNAME_RE.match(trimmed):
            raise ValueError(
                "Username must be 3-32 chars and contain only letters, numbers, underscores."
            )
        return trimmed

    @field_validator("locale")
    @classmethod
    def validate_locale(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in _LOCALE_VALUES:
            raise ValueError("Unsupported locale.")
        return normalized

    @field_validator("terms_accepted")
    @classmethod
    def validate_terms_accepted(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Terms must be accepted.")
        return value

    @field_validator("privacy_accepted")
    @classmethod
    def validate_privacy_accepted(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Privacy policy must be accepted.")
        return value


class LoginRequest(BaseModel):
    """Login payload."""

    identifier: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("identifier")
    @classmethod
    def validate_identifier(cls, value: str) -> str:
        return value.strip()


class RefreshRequest(BaseModel):
    """Refresh token payload."""

    refresh_token: str = Field(min_length=20)


class LogoutRequest(BaseModel):
    """Logout payload."""

    refresh_token: str = Field(min_length=20)


class VerifyEmailRequest(BaseModel):
    """Email verification payload."""

    token: str = Field(min_length=32)


class AuthUser(BaseModel):
    """User shape exposed by auth endpoints."""

    id: uuid.UUID
    email: str
    email_confirmed_at: datetime | None = None
    username: str
    status: str
    locale: str


class TokenPair(BaseModel):
    """Access/refresh token pair returned by auth endpoints."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class AuthResponseData(BaseModel):
    """Auth success response data."""

    user: AuthUser
    tokens: TokenPair


class RefreshResponseData(BaseModel):
    """Refresh success response data."""

    tokens: TokenPair


class LogoutResponseData(BaseModel):
    """Logout success response data."""

    logged_out: bool = True


class MeResponseData(BaseModel):
    """Current user response data."""

    user: AuthUser


class VerifyEmailResponseData(BaseModel):
    """Email verification success response data."""

    status: str = "success"
    message: str = "Email verified successfully."
