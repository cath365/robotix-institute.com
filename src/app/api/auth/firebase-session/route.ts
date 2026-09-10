import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getFirebaseAdminAuth, getFirebaseRole } from '@/lib/firebase-admin';
import { generateToken } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter, validateInput } from '@/lib/api-utils';

const sessionSchema = z.object({
  idToken: z.string().min(100),
  adminOnly: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimiter(`firebase-session:${ip}`, 15, 60_000)) {
    return NextResponse.json(createErrorResponse('Too many login attempts. Please try again shortly.'), { status: 429 });
  }
  try {
    const validation = validateInput(sessionSchema, await request.json());
    if (!validation.success) return NextResponse.json(createErrorResponse('Invalid Firebase session request.'), { status: 400 });

    // Signature verification works with the Firebase project ID alone.
    // Revocation checks need Admin credentials, so app sessions expire in one hour.
    const decoded = await getFirebaseAdminAuth().verifyIdToken(validation.data!.idToken);
    const email = decoded.email?.trim().toLowerCase();
    if (!email) return NextResponse.json(createErrorResponse('A verified email address is required.'), { status: 403 });
    const displayParts = String(decoded.name || '').trim().split(/\s+/).filter(Boolean);
    const firstName = String(decoded.firstName || displayParts[0] || email.split('@')[0]);
    const lastName = String(decoded.lastName || displayParts.slice(1).join(' ') || 'Student');
    const role = getFirebaseRole(email, decoded.role);
    if (validation.data!.adminOnly && role !== 'ADMIN') {
      return NextResponse.json(createErrorResponse('This account does not have administrator access.'), { status: 403 });
    }
    const user = { id: decoded.uid, email, firstName, lastName, role, avatar: decoded.picture || undefined };
    const token = generateToken({ userId: user.id, email, role, firstName, lastName }, '1h');
    const response = NextResponse.json(createApiResponse({ user, token }, 'Firebase login successful'));
    response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 3600, path: '/' });
    return response;
  } catch (error) {
    console.error('Firebase session error:', error);
    return NextResponse.json(createErrorResponse('Firebase session verification failed.'), { status: 401 });
  }
}
