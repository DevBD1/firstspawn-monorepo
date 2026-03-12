from fastapi.testclient import TestClient


def _register_user(
    client: TestClient,
    *,
    email: str = "tester@example.com",
    username: str = "tester_01",
    password: str = "StrongPass123!",
) -> dict:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "username": username,
            "password": password,
            "locale": "en",
            "terms_accepted": True,
            "privacy_accepted": True,
            "marketing_consent": False,
        },
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["error"] is None
    return payload["data"]


def test_register_and_me_flow(client: TestClient) -> None:
    auth_data = _register_user(client)
    access_token = auth_data["tokens"]["access_token"]

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_response.status_code == 200
    me_payload = me_response.json()
    assert me_payload["error"] is None
    assert me_payload["data"]["user"]["email"] == "tester@example.com"
    assert me_payload["meta"]["request_id"] is not None


def test_login_with_email_and_username(client: TestClient) -> None:
    _register_user(
        client,
        email="login@example.com",
        username="login_user",
        password="StrongPass123!",
    )

    login_email = client.post(
        "/api/v1/auth/login",
        json={"identifier": "login@example.com", "password": "StrongPass123!"},
    )
    assert login_email.status_code == 200
    assert login_email.json()["error"] is None

    login_username = client.post(
        "/api/v1/auth/login",
        json={"identifier": "login_user", "password": "StrongPass123!"},
    )
    assert login_username.status_code == 200
    assert login_username.json()["error"] is None


def test_refresh_rotates_session_and_rejects_old_token(client: TestClient) -> None:
    auth_data = _register_user(
        client,
        email="refresh@example.com",
        username="refresh_user",
    )
    old_refresh = auth_data["tokens"]["refresh_token"]

    refresh_response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh},
    )
    assert refresh_response.status_code == 200
    refreshed_payload = refresh_response.json()
    assert refreshed_payload["error"] is None

    second_refresh_with_old = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh},
    )
    assert second_refresh_with_old.status_code == 401
    assert second_refresh_with_old.json()["error"]["code"] in {
        "AUTH_TOKEN_EXPIRED",
        "AUTH_FORBIDDEN",
    }


def test_logout_revokes_refresh_session(client: TestClient) -> None:
    auth_data = _register_user(
        client,
        email="logout@example.com",
        username="logout_user",
    )
    refresh_token = auth_data["tokens"]["refresh_token"]

    logout_response = client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": refresh_token},
    )
    assert logout_response.status_code == 200
    assert logout_response.json()["data"]["logged_out"] is True

    refresh_after_logout = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_after_logout.status_code == 401
    assert refresh_after_logout.json()["error"]["code"] in {
        "AUTH_TOKEN_EXPIRED",
        "AUTH_FORBIDDEN",
    }


def test_register_duplicate_email_returns_validation_error(client: TestClient) -> None:
    _register_user(
        client,
        email="duplicate@example.com",
        username="dup_user_1",
    )

    duplicate = client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "username": "dup_user_2",
            "password": "StrongPass123!",
            "locale": "en",
            "terms_accepted": True,
            "privacy_accepted": True,
            "marketing_consent": False,
        },
    )
    assert duplicate.status_code == 409
    duplicate_payload = duplicate.json()
    assert duplicate_payload["error"]["code"] == "VALIDATION_ERROR"
    assert duplicate_payload["error"]["details"]["field"] == "email"
