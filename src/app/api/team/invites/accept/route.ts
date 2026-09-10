import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateToken, hashPassword } from '@/lib/auth';
import { createApiResponse, createErrorResponse, sanitizeInput, validateInput } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const acceptSchema = z.object({
  token: z.string().min(20, 'Invite token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateInput(acceptSchema, body);
    if (!validation.success) {
      return NextResponse.json(createErrorResponse('Validation failed', validation.errors), { status: 400 });
    }

    const { token, password } = validation.data!;
    const invite = await prisma.teamInvite.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
      return NextResponse.json(createErrorResponse('This invite is invalid or has expired'), { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: invite.email }, select: { id: true } });
    if (existing) {
      return NextResponse.json(createErrorResponse('A user already exists with this email'), { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: invite.email,
          password: hashedPassword,
          firstName: sanitizeInput(invite.firstName),
          lastName: sanitizeInput(invite.lastName),
          role: invite.role,
          isActive: true,
          emailVerified: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      await tx.teamInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });

      return created;
    });

    const authToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const response = NextResponse.json(
      createApiResponse({ user, token: authToken }, 'Invite accepted'),
      { status: 201 }
    );
    response.cookies.set('token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('team invite accept error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
