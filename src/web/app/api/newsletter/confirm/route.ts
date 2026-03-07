import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { getPostHogClient } from '@/lib/posthog-server';

const JWT_SECRET = process.env.JWT_SECRET;

interface ResendContactPayload {
  email: string;
  unsubscribed: boolean;
  audienceId?: string;
}

const getResendClient = (): Resend | null => {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
};

const getBaseUrl = (request: NextRequest): string => {
  return (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, '');
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
    console.warn('PostHog unavailable in newsletter confirm route:', error);
  }
};

const safeIdentify = (email: string): void => {
  try {
    const posthog = getPostHogClient();
    posthog.identify({
      distinctId: email,
      properties: {
        email: email,
        newsletter_subscriber: true,
        subscription_confirmed_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.warn('PostHog identify unavailable in newsletter confirm route:', error);
  }
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  if (!JWT_SECRET) {
    console.error('Missing JWT_SECRET');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    // 1. Verify Token
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    const email = decoded.email;
    const baseUrl = getBaseUrl(request);

    // 2. Add to Resend
    // 'audienceId' is optional in newer Resend SDKs (contacts are global).
    // If you have a legacy audience or specific segment, set RESEND_AUDIENCE_ID.
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    let contactSyncStatus: 'synced' | 'degraded' = 'synced';

    const resend = getResendClient();
    if (resend) {
      const payload: ResendContactPayload = {
        email: email,
        unsubscribed: false,
      };

      if (audienceId) {
        payload.audienceId = audienceId;
      }

      const { error } = await resend.contacts.create(payload);

      if (error) {
        contactSyncStatus = 'degraded';
        console.error('Resend Contact Error:', JSON.stringify(error, null, 2));
      }
    } else {
      contactSyncStatus = 'degraded';
      console.warn('RESEND_API_KEY missing, skipping newsletter contact sync.');
    }

    // Track email confirmation and identify user
    safeCapture(email, 'newsletter_email_confirmed', {
      email_domain: email.split('@')[1] || 'unknown',
      subscription_stage: 'email_confirmed',
      contact_sync_status: contactSyncStatus,
    });
    safeIdentify(email);

    // 3. Redirect to success page
    const redirectUrl = new URL(`${baseUrl}/`);
    redirectUrl.searchParams.set('confirmed', 'true');
    if (contactSyncStatus === 'degraded') {
      redirectUrl.searchParams.set('contact_sync', 'degraded');
    }
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
}
