import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { createApiResponse, createErrorResponse, sanitizeInput, validateInput } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const eventSchema = z
  .object({
    title: z.string().min(2, 'Event title is required').max(120, 'Event title is too long'),
    description: z.string().max(1000, 'Description is too long').optional().default(''),
    location: z.string().max(160, 'Location is too long').optional().default(''),
    startsAt: z.string().datetime('Start date must be valid'),
    endsAt: z.string().datetime('End date must be valid'),
  })
  .refine((event) => new Date(event.endsAt).getTime() > new Date(event.startsAt).getTime(), {
    message: 'End time must be after start time',
    path: ['endsAt'],
  });

function selectEvent() {
  return {
    id: true,
    title: true,
    description: true,
    location: true,
    startsAt: true,
    endsAt: true,
    createdAt: true,
    createdBy: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
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
    const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date();
    const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 60);

    const events = await prisma.teamCalendarEvent.findMany({
      where: {
        startsAt: {
          gte: Number.isNaN(from.getTime()) ? new Date() : from,
          lte: Number.isNaN(to.getTime()) ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 60) : to,
        },
      },
      orderBy: { startsAt: 'asc' },
      take: 80,
      select: selectEvent(),
    });

    return NextResponse.json(createApiResponse(events));
  } catch (error) {
    console.error('team events GET error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authUser = getUserFromRequest(request);
  const denied = await requireRole(authUser, ['ADMIN', 'ACCOUNTANT', 'INSTRUCTOR']);
  if (denied) return denied;

  try {
    const body = await request.json();
    const validation = validateInput(eventSchema, body);
    if (!validation.success) {
      return NextResponse.json(createErrorResponse('Validation failed', validation.errors), { status: 400 });
    }

    const payload = validation.data!;
    const event = await prisma.teamCalendarEvent.create({
      data: {
        title: sanitizeInput(payload.title),
        description: sanitizeInput(payload.description || ''),
        location: sanitizeInput(payload.location || ''),
        startsAt: new Date(payload.startsAt),
        endsAt: new Date(payload.endsAt),
        createdById: authUser!.userId,
      },
      select: selectEvent(),
    });

    return NextResponse.json(createApiResponse(event, 'Calendar event created'), { status: 201 });
  } catch (error) {
    console.error('team events POST error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
