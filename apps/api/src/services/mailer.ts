import nodemailer from "nodemailer";

import type { AppConfig } from "../lib/config.js";

export interface Mailer {
  sendVerificationEmail(emailTo: string, rawToken: string, locale?: string): Promise<void>;
  sendAccountRestoreEmail(
    emailTo: string,
    rawToken: string,
    purgeAfter: Date,
    locale?: string
  ): Promise<void>;
}

class NoopMailer implements Mailer {
  public async sendVerificationEmail(): Promise<void> {
    return;
  }

  public async sendAccountRestoreEmail(): Promise<void> {
    return;
  }
}

class SmtpMailer implements Mailer {
  public constructor(private readonly config: AppConfig) {}

  private async sendSafe(
    payload: Parameters<ReturnType<typeof nodemailer.createTransport>["sendMail"]>[0]
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: this.config.MAIL_SERVER,
      port: this.config.MAIL_PORT,
      secure: this.config.MAIL_SSL_TLS,
      auth: this.config.MAIL_PASSWORD
        ? {
            user: this.config.MAIL_USERNAME,
            pass: this.config.MAIL_PASSWORD,
          }
        : undefined,
    });

    try {
      await transporter.sendMail(payload);
    } catch (error) {
      console.error("[mailer] email send failed; continuing without hard failure", error);
    }
  }

  public async sendVerificationEmail(
    emailTo: string,
    rawToken: string,
    locale = "en"
  ): Promise<void> {
    const link = `${this.config.FRONTEND_URL}/${locale}/activation?token=${rawToken}`;

    await this.sendSafe({
      from: this.config.MAIL_FROM,
      to: emailTo,
      subject: "FirstSpawn - Please verify your email",
      html: `
        <html>
          <body style="font-family: monospace; color: #333; line-height: 1.6;">
            <h2>Welcome to FirstSpawn!</h2>
            <p>Please confirm your email address by clicking the link below:</p>
            <p>
              <a href="${link}" style="background-color: #22d3ee; color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold; border: 2px solid #000;">
                Verify Email
              </a>
            </p>
            <p>Or paste this link into your browser: <br/>${link}</p>
            <hr/>
            <p style="font-size: 12px; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
          </body>
        </html>
      `,
    });
  }

  public async sendAccountRestoreEmail(
    emailTo: string,
    rawToken: string,
    purgeAfter: Date,
    locale = "en"
  ): Promise<void> {
    const restoreLink = `${this.config.FRONTEND_URL}/${locale}/restore-account?token=${rawToken}`;
    const expediteLink = `${restoreLink}&action=immediate-delete`;
    const purgeAfterIso = purgeAfter.toISOString();

    await this.sendSafe({
      from: this.config.MAIL_FROM,
      to: emailTo,
      subject: "FirstSpawn - Restore your account or request immediate deletion",
      html: `
        <html>
          <body style="font-family: monospace; color: #333; line-height: 1.6;">
            <h2>Your account is pending deletion</h2>
            <p>You can restore your account before purge deadline:</p>
            <p><strong>${purgeAfterIso}</strong></p>
            <p>
              <a href="${restoreLink}" style="background-color: #22d3ee; color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold; border: 2px solid #000;">
                Restore Account
              </a>
            </p>
            <p>If you did not request this login and want deletion to happen faster, use:</p>
            <p>
              <a href="${expediteLink}" style="background-color: #fca5a5; color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold; border: 2px solid #000;">
                Request Immediate Deletion (24h)
              </a>
            </p>
            <hr/>
            <p style="font-size: 12px; color: #666;">If you ignore this email, the account will be purged after the deadline.</p>
          </body>
        </html>
      `,
    });
  }
}

export const createMailer = (config: AppConfig): Mailer => {
  if (!config.MAIL_SERVER || !config.MAIL_FROM || !config.MAIL_PASSWORD) {
    return new NoopMailer();
  }

  return new SmtpMailer(config);
};
