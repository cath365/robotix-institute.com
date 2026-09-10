import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter, sanitizeInput, validateInput } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const messageSchema = z.object({
  body: z.string().min(1, 'Message is required').max(1200, 'Message is too long'),
});

function selectMessage() {
  return {
    id: true,
    body: true,
    createdAt: true,
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
      },
    },
  } as const;
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const denied = await requireRole(user, ['ADMIN', 'ACCOUNTANT', 'INSTRUCTOR']);
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 30)));

    const messages = await prisma.teamChatMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: selectMessage(),
    });

    return NextResponse.json(createApiResponse(messages.reverse()));
  } catch (error) {
    console.error('team messages GET error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authUser = getUserFromRequest(request);
  const denied = await requireRole(authUser, ['ADMIN', 'ACCOUNTANT', 'INSTRUCTOR']);
  if (denied) return denied;

  const ip = request.headers.get('x-forwarded-for') || authUser?.userId || 'unknown';
  if (!rateLimiter(`team-message:${ip}`, 20, 60_000)) {
    return NextResponse.json(createErrorResponse('Too many messages. Please slow down.'), { status: 429 });
  }

  try {
    const body = await request.json();
    const validation = validateInput(messageSchema, body);
    if (!validation.success) {
      return NextResponse.json(createErrorResponse('Validation failed', validation.errors), { status: 400 });
    }

    const message = await prisma.teamChatMessage.create({
      data: {
        userId: authUser!.userId,
        body: sanitizeInput(validation.data!.body),
      },
      select: selectMessage(),
    });

    return NextResponse.json(createApiResponse(message, 'Message posted'), { status: 201 });
  } catch (error) {
    console.error('team messages POST error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
