import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import rateLimiter from './lib/rateLimit';
import { getClientIP } from './lib/security';

const GLOBAL_API_LIMIT = 120;
const GLOBAL_API_WINDOW_MS = 60_000;

const WEBHOOK_PREFIXES = ['/api/stripe', '/api/inngest'];

export default clerkMiddleware((_auth, req) => {
  const path = req.nextUrl.pathname;

  if (
    process.env.NODE_ENV === 'production' &&
    req.headers.get('x-forwarded-proto') === 'http'
  ) {
    const host = req.headers.get('host');
    if (host) {
      const httpsUrl = new URL(req.url);
      httpsUrl.protocol = 'https:';
      httpsUrl.host = host;
      return NextResponse.redirect(httpsUrl, 308);
    }
  }

  if (path.startsWith('/api/') && !WEBHOOK_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    const ip = getClientIP(req);
    const result = rateLimiter.checkLimit(
      `global-api:${ip}`,
      GLOBAL_API_LIMIT,
      GLOBAL_API_WINDOW_MS
    );

    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.max(1, Math.ceil((result.resetAt.getTime() - Date.now()) / 1000))
            ),
          },
        }
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
