import { afterEach, describe, expect, it } from "vitest";

import { getConfig, resetConfigForTests } from "../src/lib/config.js";

const originalMailStartTls = process.env.MAIL_STARTTLS;
const originalMailSslTls = process.env.MAIL_SSL_TLS;

describe("config", () => {
  afterEach(() => {
    if (originalMailStartTls === undefined) {
      delete process.env.MAIL_STARTTLS;
    } else {
      process.env.MAIL_STARTTLS = originalMailStartTls;
    }

    if (originalMailSslTls === undefined) {
      delete process.env.MAIL_SSL_TLS;
    } else {
      process.env.MAIL_SSL_TLS = originalMailSslTls;
    }

    resetConfigForTests();
  });

  it("parses string boolean mail settings", () => {
    process.env.MAIL_STARTTLS = "True";
    process.env.MAIL_SSL_TLS = "False";
    resetConfigForTests();

    const config = getConfig();

    expect(config.MAIL_STARTTLS).toBe(true);
    expect(config.MAIL_SSL_TLS).toBe(false);
  });
});
