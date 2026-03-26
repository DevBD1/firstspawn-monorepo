from __future__ import annotations

import os
import uuid
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from db import get_db_session
from main import app
from models.user import User, UserSession


def _with_search_path(database_url: str, schema: str) -> str:
    url = make_url(database_url)
    query = dict(url.query)
    current_options = str(query.get("options", "")).strip()
    search_path_option = f"-csearch_path={schema},public"
    query["options"] = (
        f"{current_options} {search_path_option}".strip() if current_options else search_path_option
    )
    return url.set(query=query).render_as_string(hide_password=False)


@pytest.fixture()
def db_session_factory() -> Generator[sessionmaker[Session], None, None]:
    base_url = os.getenv("API_TEST_DATABASE_URL") or os.getenv("API_DATABASE_URL")
    if not base_url:
        pytest.skip(
            "API_DATABASE_URL or API_TEST_DATABASE_URL is required for DB integration tests."
        )

    schema = f"test_auth_{uuid.uuid4().hex}"
    admin_engine = create_engine(base_url, pool_pre_ping=True)

    try:
        with admin_engine.begin() as connection:
            citext_exists = connection.execute(
                text("SELECT 1 FROM pg_extension WHERE extname = 'citext'")
            ).scalar_one_or_none()
            if citext_exists is None:
                try:
                    connection.execute(text("CREATE EXTENSION citext"))
                except SQLAlchemyError as exc:
                    pytest.skip(f"citext extension is required and could not be created: {exc}")
            connection.execute(text(f'CREATE SCHEMA "{schema}"'))
    except SQLAlchemyError as exc:
        pytest.skip(f"PostgreSQL is unavailable for DB integration tests: {exc}")

    test_url = _with_search_path(base_url, schema)
    engine = create_engine(test_url, pool_pre_ping=True)
    User.__table__.create(bind=engine)
    UserSession.__table__.create(bind=engine)
    session_factory = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    try:
        yield session_factory
    finally:
        engine.dispose()
        with admin_engine.begin() as connection:
            connection.execute(text(f'DROP SCHEMA IF EXISTS "{schema}" CASCADE'))
        admin_engine.dispose()


@pytest.fixture()
def client(db_session_factory: sessionmaker[Session]) -> Generator[TestClient, None, None]:
    def override_get_db_session() -> Generator[Session, None, None]:
        session = db_session_factory()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db_session] = override_get_db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
