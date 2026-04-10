import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createTestApp, type TestContext } from "./helpers.js";

describe("auth integration", () => {
  let context: TestContext | undefined;
  const getContext = (): TestContext => {
    if (!context) {
      throw new Error("Test context is not initialized.");
    }

    return context;
  };

  beforeEach(async () => {
    context = await createTestApp();
  });

  afterEach(async () => {
    if (context) {
      await context.close();
      context = undefined;
    }
  });

  const registerUser = async (overrides: Record<string, unknown> = {}) => {
    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "tester@example.com",
        username: "tester_01",
        password: "StrongPass123!",
        locale: "en",
        terms_accepted: true,
        privacy_accepted: true,
        marketing_consent: false,
        ...overrides,
      },
    });

    expect(response.statusCode).toBe(201);
    const payload = response.json();
    expect(payload.error).toBeNull();
    return payload.data;
  };

  it("supports register and me flow", async () => {
    const authData = await registerUser();

    const meResponse = await getContext().app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      headers: {
        authorization: `Bearer ${authData.tokens.access_token}`,
      },
    });

    expect(meResponse.statusCode).toBe(200);
    const mePayload = meResponse.json();
    expect(mePayload.error).toBeNull();
    expect(mePayload.data.user.email).toBe("tester@example.com");
    expect(mePayload.meta.request_id).toBeTruthy();
    expect(meResponse.headers["x-request-id"]).toBeTruthy();
  });

  it("supports login with email and username", async () => {
    await registerUser({
      email: "login@example.com",
      username: "login_user",
      password: "StrongPass123!",
    });

    const loginEmail = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        identifier: "login@example.com",
        password: "StrongPass123!",
      },
    });
    expect(loginEmail.statusCode).toBe(200);
    expect(loginEmail.json().error).toBeNull();

    const loginUsername = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        identifier: "login_user",
        password: "StrongPass123!",
      },
    });
    expect(loginUsername.statusCode).toBe(200);
    expect(loginUsername.json().error).toBeNull();
  });

  it("rotates refresh tokens and rejects the old token", async () => {
    const authData = await registerUser({
      email: "refresh@example.com",
      username: "refresh_user",
    });

    const oldRefresh = authData.tokens.refresh_token;
    const refreshResponse = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      payload: {
        refresh_token: oldRefresh,
      },
    });

    expect(refreshResponse.statusCode).toBe(200);
    expect(refreshResponse.json().error).toBeNull();

    const secondRefresh = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      payload: {
        refresh_token: oldRefresh,
      },
    });

    expect(secondRefresh.statusCode).toBe(401);
    expect(["AUTH_TOKEN_EXPIRED", "AUTH_FORBIDDEN"]).toContain(secondRefresh.json().error.code);
  });

  it("revokes the refresh session on logout", async () => {
    const authData = await registerUser({
      email: "logout@example.com",
      username: "logout_user",
    });

    const refreshToken = authData.tokens.refresh_token;
    const logoutResponse = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/logout",
      payload: {
        refresh_token: refreshToken,
      },
    });

    expect(logoutResponse.statusCode).toBe(200);
    expect(logoutResponse.json().data.logged_out).toBe(true);

    const refreshAfterLogout = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      payload: {
        refresh_token: refreshToken,
      },
    });

    expect(refreshAfterLogout.statusCode).toBe(401);
  });

  it("returns a duplicate email validation error", async () => {
    await registerUser({
      email: "duplicate@example.com",
      username: "dup_user_1",
    });

    const duplicate = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "duplicate@example.com",
        username: "dup_user_2",
        password: "StrongPass123!",
        locale: "en",
        terms_accepted: true,
        privacy_accepted: true,
        marketing_consent: false,
      },
    });

    expect(duplicate.statusCode).toBe(409);
    expect(duplicate.json().error.code).toBe("VALIDATION_ERROR");
    expect(duplicate.json().error.details.field).toBe("email");
  });

  it("requires restore flow for deleted accounts and restores via email token", async () => {
    const authData = await registerUser({
      email: "restore@example.com",
      username: "restore_user",
    });

    const deleteRequest = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/delete/request",
      headers: {
        authorization: `Bearer ${authData.tokens.access_token}`,
      },
      payload: {
        reason: "test-delete",
      },
    });
    expect(deleteRequest.statusCode).toBe(200);

    const deletedLogin = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        identifier: "restore@example.com",
        password: "StrongPass123!",
      },
    });

    expect(deletedLogin.statusCode).toBe(403);
    expect(deletedLogin.json().error.code).toBe("AUTH_RESTORE_REQUIRED");
    expect(getContext().mailer.restoreEmails.length).toBe(1);

    const restoreToken = getContext().mailer.restoreEmails[0]?.rawToken;
    expect(restoreToken).toBeTruthy();

    const restore = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/restore/confirm",
      payload: {
        token: restoreToken,
      },
    });

    expect(restore.statusCode).toBe(200);
    expect(restore.json().data.restored).toBe(true);

    const restoredLogin = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        identifier: "restore@example.com",
        password: "StrongPass123!",
      },
    });
    expect(restoredLogin.statusCode).toBe(200);
  });

  it("supports expedite delete request from restore token", async () => {
    const authData = await registerUser({
      email: "expedite@example.com",
      username: "expedite_user",
    });

    await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/delete/request",
      headers: {
        authorization: `Bearer ${authData.tokens.access_token}`,
      },
      payload: {
        reason: "expedite-test",
      },
    });

    await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        identifier: "expedite@example.com",
        password: "StrongPass123!",
      },
    });

    const restoreToken = getContext().mailer.restoreEmails[0]?.rawToken;
    expect(restoreToken).toBeTruthy();

    const expedite = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/restore/expedite-delete",
      payload: {
        token: restoreToken,
      },
    });

    expect(expedite.statusCode).toBe(200);
    expect(expedite.json().data.expedited).toBe(true);
    expect(expedite.json().data.remaining_days).toBeLessThanOrEqual(1);
  });
});
