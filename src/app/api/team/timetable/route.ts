import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { createApiResponse, createErrorResponse, sanitizeInput, validateInput } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const timetableSchema = z
  .object({
    assignedToId: z.string().min(1, 'Assigned team member is required'),
    duty: z.string().min(2, 'Duty is required').max(160),
    location: z.string().min(2, 'Location is required').max(160),
    startsAt: z.string().datetime('Start date must be valid'),
    endsAt: z.string().datetime('End date must be valid'),
    description: z.string().max(1000).optional().default(''),
  })
  .refine((entry) => new Date(entry.endsAt).getTime() > new Date(entry.startsAt).getTime(), {
    message: 'End time must be after start time',
    path: ['endsAt'],
  });

const timetableSelect = {
  id: true,
  title: true,
  duty: true,
  location: true,
  description: true,
  startsAt: true,
  endsAt: true,
  assignedToId: true,
  assignedTo: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  },
  createdBy: {
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  },
} as const;

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const denied = await requireRole(user, ['ADMIN', 'ACCOUNTANT', 'INSTRUCTOR']);
    if (denied) return denied;

    const entries = await prisma.teamCalendarEvent.findMany({
      where: {
        assignedToId: { not: null },
        startsAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) },
      },
      orderBy: { startsAt: 'asc' },
      take: 120,
      select: timetableSelect,
    });

    return NextResponse.json(createApiResponse(entries));
  } catch (error) {
    console.error('team timetable GET error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const denied = await requireRole(user, ['ADMIN']);
    if (denied) return denied;

    const body = await request.json();
    const validation = validateInput(timetableSchema, body);
    if (!validation.success) {
      return NextResponse.json(createErrorResponse('Validation failed', validation.errors), { status: 400 });
    }

    const payload = validation.data!;
    const assignedTo = await prisma.user.findFirst({
      where: {
        id: payload.assignedToId,
        isActive: true,
        role: { in: ['ADMIN', 'ACCOUNTANT', 'INSTRUCTOR'] },
      },
      select: { id: true },
    });
    if (!assignedTo) {
      return NextResponse.json(createErrorResponse('Assigned team member was not found'), { status: 400 });
    }

    const entry = await prisma.teamCalendarEvent.create({
      data: {
        title: sanitizeInput(payload.duty),
        duty: sanitizeInput(payload.duty),
        location: sanitizeInput(payload.location),
        description: sanitizeInput(payload.description || ''),
        startsAt: new Date(payload.startsAt),
        endsAt: new Date(payload.endsAt),
        assignedToId: payload.assignedToId,
        createdById: user!.userId,
      },
      select: timetableSelect,
    });

    return NextResponse.json(createApiResponse(entry, 'Timetable entry created'), { status: 201 });
  } catch (error) {
    console.error('team timetable POST error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
