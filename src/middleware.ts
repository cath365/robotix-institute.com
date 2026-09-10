import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/admin',
  '/analytics',
  '/dashboard',
  '/notifications',
];

const ADMIN_ONLY_PREFIXES = ['/admin'];

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(self), interest-cohort=()',
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

function applySecurityHeaders(res: NextResponse) {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(k, v);
  }
  return res;
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function getTokenPayload(token?: string) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    return JSON.parse(decodeBase64Url(parts[1])) as { role?: string; exp?: number };
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (pathname === '/admin/login') {
    return applySecurityHeaders(NextResponse.next());
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isAdminOnly = ADMIN_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (!isProtected && !isAdminOnly) {
    return applySecurityHeaders(NextResponse.next());
  }

  const token = req.cookies.get('token')?.value;
  const user = getTokenPayload(token);
  const isExpired = !!user?.exp && user.exp * 1000 <= Date.now();

  if (!user || isExpired) {
    const url = req.nextUrl.clone();
    url.pathname = isAdminOnly ? '/admin/login' : '/login';
    url.searchParams.set('next', pathname);
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  if (isAdminOnly && user.role !== 'ADMIN') {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|patterns/|api/auth/login|api/auth/register|api/auth/firebase-session|api/auth/forgot-password).*)',
  ],
};
