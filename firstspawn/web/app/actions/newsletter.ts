'use server';

import { Resend } from 'resend';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { ConfirmationEmail } from '@/components/emails/ConfirmationEmail';
import { render } from '@react-email/render';
import { getPostHogClient } from '@/lib/posthog-server';

const JWT_SECRET = process.env.JWT_SECRET;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

const subscribeSchema = z.object({
  email: z.string().email(),
});

interface NewsletterActionResult {
  success: boolean;
  message: string;
}

const getResendClient = (): Resend | null => {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
};

const safeCapture = (
  distinctId: string,
  event: string,
  properties: Record<string, string>
): void => {
  try {
    const posthog = getPostHogClient();
    posthog.capture({ distinctId, event, properties });
  } catch (error) {
    console.warn('PostHog unavailable in newsletter action:', error);
  }
};

export async function subscribeToNewsletter(email: string): Promise<NewsletterActionResult> {
  try {
    // 1. Validate Input
    const result = subscribeSchema.safeParse({ email });
    if (!result.success) {
      return { success: false, message: 'Invalid email format' };
    }

    if (!JWT_SECRET) {
      console.error('Missing JWT_SECRET');
      return { success: false, message: 'Server configuration error' };
    }

    const resend = getResendClient();
    if (!resend) {
      safeCapture(email, 'newsletter_subscription_failed', {
        email_domain: email.split('@')[1] || 'unknown',
        error_type: 'email_provider_unavailable',
        error_message: 'RESEND_API_KEY is missing',
      });
      return {
        success: false,
        message: 'Newsletter is temporarily unavailable. Please try again later.',
      };
    }

    // 2. Generate Confirmation Token
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    const confirmationLink = `${SITE_URL}/api/newsletter/confirm?token=${token}`;

    // 3. Render Email HTML
    const emailHtml = await render(
        ConfirmationEmail({ confirmationLink })
    );

    // 4. Send Email via Resend
    const { error } = await resend.emails.send({
      from: 'FirstSpawn <noreply@firstspawn.com>', // User needs to verify domain or use onboard
      to: email,
      subject: 'Confirm your subscription',
      html: emailHtml,
    });

    if (error) {
      console.error('Resend Error:', error);
      safeCapture(email, 'newsletter_subscription_failed', {
        email_domain: email.split('@')[1] || 'unknown',
        error_type: 'email_send_failed',
        error_message: error.message || 'Unknown error',
      });
      return {
        success: false,
        message: 'Failed to send confirmation email',
      };
    }

    // Track successful subscription initiation
    safeCapture(email, 'newsletter_subscription_completed', {
      email_domain: email.split('@')[1] || 'unknown',
      subscription_stage: 'confirmation_email_sent',
    });

    return { success: true, message: 'Confirmation email sent' };

  } catch (error) {
    console.error('Subscription Error:', error);
    safeCapture(email, 'newsletter_subscription_failed', {
      email_domain: email.split('@')[1] || 'unknown',
      error_type: 'unexpected_error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
    return { success: false, message: 'An unexpected error occurred' };
  }
}
