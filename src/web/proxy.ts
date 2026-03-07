import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./lib/i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

// --- RATE LIMIT CONFIGURATION (Merged from middleware.ts) ---
// Simple in-memory store for rate limiting (per-instance)
const rateLimit = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_GENERAL = 200; 
const MAX_REQUESTS_SENSITIVE = 10;
const SENSITIVE_PATHS = ['/newsletter', '/api/subscribe'];

function getLocale(request: NextRequest): string | undefined {
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    // @ts-ignore locales are readonly
    const locales: string[] = i18n.locales;
    // @ts-ignore
    let languages = new Negotiator({ headers: negotiatorHeaders }).languages(
        locales
    );

    const locale = matchLocale(languages, locales, i18n.defaultLocale);

    return locale;
}

export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const ip = (request as any).ip || '127.0.0.1';
    
    // 1. RATE LIMITING LOGIC
    // -------------------------------------------------------------------------
    const now = Date.now();
    let limitInfo = rateLimit.get(ip);
    
    if (!limitInfo || (now - limitInfo.lastReset > RATE_LIMIT_WINDOW)) {
        limitInfo = { count: 0, lastReset: now };
        rateLimit.set(ip, limitInfo);
    }

    limitInfo.count++;

    const isSensitive = SENSITIVE_PATHS.some(p => pathname.startsWith(p));
    const limit = isSensitive ? MAX_REQUESTS_SENSITIVE : MAX_REQUESTS_GENERAL;

    if (limitInfo.count > limit) {
        return new NextResponse(
            JSON.stringify({ 
                error: 'Too many requests', 
                message: 'You have exceeded the rate limit. Please try again later.' 
            }),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // 2. ROUTING & I18N LOGIC
    // -------------------------------------------------------------------------
    let response: NextResponse;

    // Skip i18n redirects for API, Assets, Admin, or existing locales
    const shouldSkipI18n = 
        pathname.startsWith('/api') || 
        pathname.startsWith('/admin') ||
        i18n.locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);

    if (shouldSkipI18n) {
        response = NextResponse.next();
    } else {
        // Redirect if there is no locale
        const locale = getLocale(request);
        response = NextResponse.redirect(
            new URL(
                `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
                request.url
            ),
            308
        );
    }

    // 3. SECURITY HEADERS
    // -------------------------------------------------------------------------
    response.headers.set('X-Frame-Options', 'DENY');
    
    if (pathname.startsWith('/admin')) {
        response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    );

    return response;
}

export const config = {
    // Matcher: match everything EXCEPT static files and images.
    // Matcher: match everything EXCEPT static files, images, and SEO files.
    // We removed 'api' from exclusion to protect it with rate limiting.
    matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|llms.txt|sitemap.xml).*)"],
};
