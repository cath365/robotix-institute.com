import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiResponse, rateLimiter, validateInput } from '@/lib/api-utils';
import {
  buildResetPasswordUrl,
  createPasswordResetToken,
  getPasswordResetExpiryHours,
} from '@/lib/password-reset';
import { sendPasswordResetEmail } from '@/lib/mailer';
import prisma from '@/lib/prisma';

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimiter(ip, 5, 60_000)) {
    return NextResponse.json(
      createApiResponse({ ok: true }, 'If an account exists, a reset link has been sent.'),
      { status: 200 }
    );
  }

  try {
    const body = await request.json();
    const validation = validateInput(schema, body);
    if (!validation.success) {
      // Same response either way to prevent enumeration
      return NextResponse.json(
        createApiResponse({ ok: true }, 'If an account exists, a reset link has been sent.'),
        { status: 200 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: validation.data!.email },
      select: { id: true, firstName: true, isActive: true },
    });

    if (user && user.isActive) {
      const { token } = await createPasswordResetToken(user.id);
      const resetUrl = buildResetPasswordUrl(token);

      try {
        await sendPasswordResetEmail({
          to: validation.data!.email,
          firstName: user.firstName || 'Robotix user',
          resetUrl,
          expiresInHours: getPasswordResetExpiryHours(),
        });
      } catch (mailError) {
        console.error('forgot-password email delivery error:', mailError);
      }
    }
  } catch (e) {
    console.error('forgot-password error:', e);
  }

  return NextResponse.json(
    createApiResponse({ ok: true }, 'If an account exists, a reset link has been sent.'),
    { status: 200 }
  );
}
