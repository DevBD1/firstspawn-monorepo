import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

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

    // 2. Add to Resend Audience
    // 'aud_...' is optional if you have a specific audience, otherwise it adds to default
    // We'll use the default contact creation which goes to the default audience
    const { error } = await resend.contacts.create({
      email: email,
      unsubscribed: false,
    });

    if (error) {
        console.error("Resend Contact Error", error);
        // Even if it fails (e.g. already exists), we typically want to show success to the user
        // But logging it is good
    }

    // 3. Redirect to success page
    return NextResponse.redirect(`${APP_URL}?confirmed=true`);

  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
}
