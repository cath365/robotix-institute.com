import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter, sanitizeInput, validateInput } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const staffRoles = ['ADMIN', 'ACCOUNTANT', 'INSTRUCTOR'] as const;

const requestSchema = z.object({
  title: z.string().min(2, 'Request title is required').max(120),
  details: z.string().min(5, 'Request details are required').max(1500),
  priority: z.enum(['LOW', 'NORMAL', 'URGENT']).optional().default('NORMAL'),
});

const requestUpdateSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  status: z.enum(['OPEN', 'REVIEWING', 'APPROVED', 'DONE', 'REJECTED']),
  response: z.string().max(1200).optional().default(''),
});

const requestSelect = {
  id: true,
  title: true,
  details: true,
  priority: true,
  status: true,
  response: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  },
} as const;

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const denied = await requireRole(user, [...staffRoles]);
    if (denied) return denied;

    const requests = await prisma.teamRequest.findMany({
      where: user!.role === 'ADMIN' ? {} : { userId: user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 80,
      select: requestSelect,
    });

    return NextResponse.json(createApiResponse(requests));
  } catch (error) {
    console.error('team requests GET error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  const denied = await requireRole(user, [...staffRoles]);
  if (denied) return denied;

  const ip = request.headers.get('x-forwarded-for') || user?.userId || 'unknown';
  if (!rateLimiter(`team-request:${ip}`, 12, 60_000)) {
    return NextResponse.json(createErrorResponse('Too many requests. Please wait a minute.'), { status: 429 });
  }

  try {
    const body = await request.json();
    const validation = validateInput(requestSchema, body);
    if (!validation.success) {
      return NextResponse.json(createErrorResponse('Validation failed', validation.errors), { status: 400 });
    }

    const payload = validation.data!;
    const teamRequest = await prisma.teamRequest.create({
      data: {
        userId: user!.userId,
        title: sanitizeInput(payload.title),
        details: sanitizeInput(payload.details),
        priority: payload.priority,
      },
      select: requestSelect,
    });

    return NextResponse.json(createApiResponse(teamRequest, 'Request sent to admin'), { status: 201 });
  } catch (error) {
    console.error('team requests POST error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const denied = await requireRole(user, ['ADMIN']);
    if (denied) return denied;

    const body = await request.json();
    const validation = validateInput(requestUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json(createErrorResponse('Validation failed', validation.errors), { status: 400 });
    }

    const payload = validation.data!;
    const teamRequest = await prisma.teamRequest.update({
      where: { id: payload.requestId },
      data: {
        status: payload.status,
        response: sanitizeInput(payload.response || ''),
      },
      select: requestSelect,
    });

    return NextResponse.json(createApiResponse(teamRequest, 'Request updated'));
  } catch (error) {
    console.error('team requests PATCH error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
