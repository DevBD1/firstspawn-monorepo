import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createTestApp, type TestContext } from "./helpers.js";

describe("auth concurrency", () => {
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

  const registerUser = async () => {
    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "race@example.com",
        username: "race_user",
        password: "StrongPass123!",
        locale: "en",
        terms_accepted: true,
        privacy_accepted: true,
        marketing_consent: false,
      },
    });

    return response.json().data;
  };

  it("allows only one successful refresh for the same token", async () => {
    const authData = await registerUser();
    const refreshToken = authData.tokens.refresh_token;

    const [first, second] = await Promise.all([
      getContext().app.inject({
        method: "POST",
        url: "/api/v1/auth/refresh",
        payload: { refresh_token: refreshToken },
      }),
      getContext().app.inject({
        method: "POST",
        url: "/api/v1/auth/refresh",
        payload: { refresh_token: refreshToken },
      }),
    ]);

    const statuses = [first.statusCode, second.statusCode].sort();
    expect(statuses).toEqual([200, 401]);
  });

  it("handles refresh racing logout for the same token", async () => {
    const authData = await registerUser();
    const refreshToken = authData.tokens.refresh_token;

    const [refresh, logout] = await Promise.all([
      getContext().app.inject({
        method: "POST",
        url: "/api/v1/auth/refresh",
        payload: { refresh_token: refreshToken },
      }),
      getContext().app.inject({
        method: "POST",
        url: "/api/v1/auth/logout",
        payload: { refresh_token: refreshToken },
      }),
    ]);

    expect([200, 401]).toContain(refresh.statusCode);
    expect(logout.statusCode).toBe(200);
  });
});
