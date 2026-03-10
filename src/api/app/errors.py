"""Application error types."""

from typing import Any


class ApiError(Exception):
    """Structured API error used by endpoint/business logic."""

    def __init__(
        self,
        *,
        status_code: int,
        code: str,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(message)
