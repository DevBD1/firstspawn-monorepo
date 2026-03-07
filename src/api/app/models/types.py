"""Custom PostgreSQL types for SQLAlchemy."""

from sqlalchemy import Text
from sqlalchemy.dialects.postgresql.base import ischema_names
from sqlalchemy.types import UserDefinedType


class CIText(UserDefinedType):
    """Case-insensitive text type using PostgreSQL citext extension."""

    def get_col_spec(self, **kw):
        return "CITEXT"

    def bind_processor(self, dialect):
        return None

    def result_processor(self, dialect, coltype):
        return None


# Register with SQLAlchemy
ischema_names["citext"] = CIText
