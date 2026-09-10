import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter, validateInput } from '@/lib/api-utils';
import { getPasswordResetRecord, isPasswordResetRecordValid } from '@/lib/password-reset';
import prisma from '@/lib/prisma';

const schema = z
  .object({
    token: z.string().min(20, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimiter(`reset-password:${ip}`, 10, 60_000)) {
    return NextResponse.json(createErrorResponse('Too many attempts. Please try again later.'), {
      status: 429,
    });
  }

  try {
    const body = await request.json();
    const validation = validateInput(schema, body);
    if (!validation.success) {
      return NextResponse.json(createErrorResponse('Validation failed', validation.errors), {
        status: 400,
      });
    }

    const { token, password } = validation.data!;
    const record = await getPasswordResetRecord(token);

    if (!record || !isPasswordResetRecordValid(record)) {
      return NextResponse.json(
        createErrorResponse('This reset link is invalid or has expired.'),
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.user.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.updateMany({
        where: {
          userId: record.user.id,
          usedAt: null,
          id: { not: record.id },
        },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json(
      createApiResponse({ ok: true }, 'Your password has been reset successfully.'),
      { status: 200 }
    );
  } catch (error) {
    console.error('reset-password error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
