from __future__ import annotations

from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError

from app.db import get_db_session
from app.main import app


class _UniqueViolation(Exception):
    def __init__(self, message: str, sqlstate: str = "23505") -> None:
        super().__init__(message)
        self.sqlstate = sqlstate


class _DuplicateOnFlushSession:
    def __init__(self) -> None:
        self.rollback_called = False
        self._flush_calls = 0

    def scalar(self, _query: object) -> None:
        return None

    def add(self, _obj: object) -> None:
        return None

    def flush(self) -> None:
        self._flush_calls += 1
        if self._flush_calls == 1:
            raise IntegrityError(
                statement="INSERT INTO users (...) VALUES (...)",
                params={},
                orig=_UniqueViolation(
                    'duplicate key value violates unique constraint "users_email_key"'
                ),
            )

    def commit(self) -> None:
        return None

    def rollback(self) -> None:
        self.rollback_called = True


def test_validation_error_response_is_json_serializable() -> None:
    class _NoOpSession:
        def close(self) -> None:
            return None

    def override_get_db_session() -> Generator[_NoOpSession, None, None]:
        yield _NoOpSession()

    app.dependency_overrides[get_db_session] = override_get_db_session
    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "bad-email",
                "username": "valid_user",
                "password": "StrongPass123!",
                "locale": "en",
            },
        )
    app.dependency_overrides.clear()

    assert response.status_code == 422
    payload = response.json()
    assert payload["error"]["code"] == "VALIDATION_ERROR"
    assert isinstance(payload["error"]["details"]["errors"], list)


def test_register_duplicate_race_returns_validation_error() -> None:
    session = _DuplicateOnFlushSession()

    def override_get_db_session() -> Generator[_DuplicateOnFlushSession, None, None]:
        yield session

    app.dependency_overrides[get_db_session] = override_get_db_session
    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "duplicate@example.com",
                "username": "duplicate_user",
                "password": "StrongPass123!",
                "locale": "en",
            },
        )
    app.dependency_overrides.clear()

    assert response.status_code == 409
    payload = response.json()
    assert payload["error"]["code"] == "VALIDATION_ERROR"
    assert payload["error"]["details"]["field"] == "email"
    assert session.rollback_called is True
