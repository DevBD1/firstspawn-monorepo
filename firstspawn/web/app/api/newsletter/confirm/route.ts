import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { getPostHogClient } from '@/lib/posthog-server';

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

    // 2. Add to Resend
    // 'audienceId' is optional in newer Resend SDKs (contacts are global).
    // If you have a legacy audience or specific segment, set RESEND_AUDIENCE_ID.
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    const payload: any = {
        email: email,
        unsubscribed: false,
    };
    
    if (audienceId) {
        payload.audienceId = audienceId;
    }

    const { data, error } = await resend.contacts.create(payload);

    if (error) {
        console.error("Resend Contact Error:", JSON.stringify(error, null, 2));
        // We log it but might still want to redirect to success or show error? 
        // For now, if it fails, we show error json to help debugging since user is stuck.
        return NextResponse.json({ error: 'Failed to add contact', details: error }, { status: 500 });
    }

    console.log("Resend Contact Created:", JSON.stringify(data, null, 2));

    // Track email confirmation and identify user
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: email,
      event: 'newsletter_email_confirmed',
      properties: {
        email_domain: email.split('@')[1] || 'unknown',
        subscription_stage: 'email_confirmed',
      },
    });

    // Identify the user with their email as the distinct ID
    posthog.identify({
      distinctId: email,
      properties: {
        email: email,
        newsletter_subscriber: true,
        subscription_confirmed_at: new Date().toISOString(),
      },
    });

    // 3. Redirect to success page
    return NextResponse.redirect(`${APP_URL}?confirmed=true`);

  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
}
