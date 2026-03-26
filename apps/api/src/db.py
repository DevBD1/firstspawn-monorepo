"""Database engine/session setup."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from config import settings

engine = create_engine(
    settings.API_DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


def get_db_session() -> Generator[Session, None, None]:
    """Yield a SQLAlchemy database session for request scope."""

    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
