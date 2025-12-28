'use server';

import { Resend } from 'resend';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { ConfirmationEmail } from '@/components/emails/ConfirmationEmail';
import { render } from '@react-email/render';
import { getPostHogClient } from '@/lib/posthog-server';

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

const subscribeSchema = z.object({
  email: z.string().email(),
});

export async function subscribeToNewsletter(email: string) {
  try {
    // 1. Validate Input
    const result = subscribeSchema.safeParse({ email });
    if (!result.success) {
      return { success: false, message: 'Invalid email format' };
    }

    if (!JWT_SECRET || !APP_URL) {
      console.error('Missing env vars');
      return { success: false, message: 'Server configuration error' };
    }

    // 2. Generate Confirmation Token
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    const confirmationLink = `${APP_URL}/api/newsletter/confirm?token=${token}`;

    // 3. Render Email HTML
    const emailHtml = await render(
        ConfirmationEmail({ confirmationLink })
    );

    // 4. Send Email via Resend
    const { data, error } = await resend.emails.send({
      from: 'FirstSpawn <noreply@firstspawn.com>', // User needs to verify domain or use onboard
      to: email,
      subject: 'Confirm your subscription',
      html: emailHtml,
    });

    if (error) {
      console.error('Resend Error:', error);
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: email,
        event: 'newsletter_subscription_failed',
        properties: {
          email_domain: email.split('@')[1] || 'unknown',
          error_type: 'email_send_failed',
          error_message: error.message || 'Unknown error',
        },
      });
      return { success: false, message: 'Failed to send confirmation email' };
    }

    // Track successful subscription initiation
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: email,
      event: 'newsletter_subscription_completed',
      properties: {
        email_domain: email.split('@')[1] || 'unknown',
        subscription_stage: 'confirmation_email_sent',
      },
    });

    return { success: true, message: 'Confirmation email sent' };

  } catch (error) {
    console.error('Subscription Error:', error);
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: email,
      event: 'newsletter_subscription_failed',
      properties: {
        email_domain: email.split('@')[1] || 'unknown',
        error_type: 'unexpected_error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    return { success: false, message: 'An unexpected error occurred' };
  }
}
