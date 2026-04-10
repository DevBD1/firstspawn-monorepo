import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createTestApp, type TestContext } from "./helpers.js";

describe("error handling", () => {
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

  it("returns validation errors in the standard envelope", async () => {
    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "bad-email",
        username: "valid_user",
        password: "StrongPass123!",
        locale: "en",
        terms_accepted: true,
        privacy_accepted: true,
        marketing_consent: false,
      },
    });

    expect(response.statusCode).toBe(422);
    const payload = response.json();
    expect(payload.error.code).toBe("VALIDATION_ERROR");
    expect(Array.isArray(payload.error.details.errors)).toBe(true);
    expect(payload.meta.request_id).toBeTruthy();
  });
});
