"""API dependency functions."""

import uuid
from typing import Annotated

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db import get_db_session
from app.errors import ApiError
from app.models.user import User
from app.security import TokenDecodeError, decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def get_request_id(request: Request) -> str | None:
    """Read request ID set by middleware."""

    return getattr(request.state, "request_id", None)


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
    ],
    db: Annotated[Session, Depends(get_db_session)],
) -> User:
    """Resolve current user from access token."""

    if credentials is None:
        raise ApiError(
            status_code=401,
            code="AUTH_FORBIDDEN",
            message="Authentication required.",
        )

    try:
        claims = decode_access_token(credentials.credentials)
        user_id = uuid.UUID(str(claims.get("sub")))
    except (TokenDecodeError, ValueError):
        raise ApiError(
            status_code=401,
            code="AUTH_TOKEN_EXPIRED",
            message="Invalid or expired access token.",
        ) from None

    user = db.get(User, user_id)
    if user is None:
        raise ApiError(
            status_code=401,
            code="AUTH_FORBIDDEN",
            message="Authenticated user not found.",
        )
    if user.status != "active":
        raise ApiError(
            status_code=403,
            code="AUTH_FORBIDDEN",
            message="User account is not active.",
        )

    return user
