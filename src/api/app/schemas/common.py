"""Common response envelope schemas."""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class ResponseMeta(BaseModel):
    """Metadata included in every response."""

    request_id: str | None = None


class ResponseError(BaseModel):
    """Structured API error payload."""

    code: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)


class Envelope(BaseModel, Generic[T]):
    """Top-level response envelope for success and error responses."""

    data: T | None
    meta: ResponseMeta = Field(default_factory=ResponseMeta)
    error: ResponseError | None = None
