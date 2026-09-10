import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import {
  createApiResponse,
  createErrorResponse,
  createPaginatedResponse,
  getPaginationParams,
  rateLimiter,
  sanitizeInput,
  validateInput,
} from '@/lib/api-utils';
import { sendOpsNotification } from '@/lib/mailer';
import prisma from '@/lib/prisma';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required').max(80, 'Name is too long'),
  email: z.string().email('A valid email address is required'),
  subject: z.string().max(120, 'Subject is too long').optional().default(''),
  message: z.string().min(10, 'Message is too short').max(4000, 'Message is too long'),
});

const followUpSchema = z.object({
  id: z.string().min(1, 'Message ID is required'),
  status: z.enum(['NEW', 'CONTACTED', 'BOOKED', 'CLOSED']).optional(),
  adminNotes: z.string().max(1500, 'Admin notes are too long').optional(),
  assignedToId: z.string().optional().nullable(),
});

const contactSelect = {
  id: true,
  name: true,
  email: true,
  subject: true,
  message: true,
  status: true,
  adminNotes: true,
  assignedToId: true,
  source: true,
  createdAt: true,
  updatedAt: true,
  assignedTo: {
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
    if (!user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }

    const denied = await requireRole(user, ['ADMIN']);
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);

    const status = searchParams.get('status');
    const where = status ? { status } : {};

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        select: contactSelect,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return NextResponse.json(createPaginatedResponse(messages, total, pagination));
  } catch (error) {
    console.error('contact GET error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }

    const denied = await requireRole(user, ['ADMIN']);
    if (denied) return denied;

    const body = await request.json();
    const validation = validateInput(followUpSchema, body);
    if (!validation.success) {
      return NextResponse.json(createErrorResponse('Validation failed', validation.errors), { status: 400 });
    }

    const payload = validation.data!;
    const updateData: {
      status?: 'NEW' | 'CONTACTED' | 'BOOKED' | 'CLOSED';
      adminNotes?: string;
      assignedToId?: string | null;
    } = {};

    if (payload.status) updateData.status = payload.status;
    if (typeof payload.adminNotes === 'string') updateData.adminNotes = sanitizeInput(payload.adminNotes);
    if (payload.assignedToId !== undefined) {
      if (payload.assignedToId) {
        const staff = await prisma.user.findFirst({
          where: {
            id: payload.assignedToId,
            isActive: true,
            role: { in: ['ADMIN', 'ACCOUNTANT', 'INSTRUCTOR'] },
          },
          select: { id: true },
        });
        if (!staff) {
          return NextResponse.json(createErrorResponse('Assigned staff member was not found'), { status: 400 });
        }
        updateData.assignedToId = payload.assignedToId;
      } else {
        updateData.assignedToId = null;
      }
    }

    const message = await prisma.contactMessage.update({
      where: { id: payload.id },
      data: updateData,
      select: contactSelect,
    });

    return NextResponse.json(createApiResponse(message, 'Contact follow-up updated'));
  } catch (error) {
    console.error('contact PATCH error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimiter(`contact:${ip}`, 8, 60_000)) {
    return NextResponse.json(
      createErrorResponse('Too many messages sent. Please try again shortly.'),
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validation = validateInput(contactSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.errors),
        { status: 400 }
      );
    }

    const payload = validation.data!;
    const message = await prisma.contactMessage.create({
      data: {
        name: sanitizeInput(payload.name),
        email: sanitizeInput(payload.email).toLowerCase(),
        subject: sanitizeInput(payload.subject || ''),
        message: sanitizeInput(payload.message),
      },
    });

    try {
      await sendOpsNotification({
        subject: `New contact message from ${message.name}`,
        preheader: 'Robotix contact inbox',
        replyTo: message.email,
        text: `Name: ${message.name}\nEmail: ${message.email}\nSubject: ${message.subject || 'General enquiry'}\n\n${message.message}`,
        html: `
          <h2 style="margin-bottom:12px;">New contact message</h2>
          <p><strong>Name:</strong> ${message.name}</p>
          <p><strong>Email:</strong> ${message.email}</p>
          <p><strong>Subject:</strong> ${message.subject || 'General enquiry'}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap;">${message.message}</p>
        `,
      });
    } catch (error) {
      console.error('contact notification email error:', error);
    }

    return NextResponse.json(
      createApiResponse(
        { id: message.id, createdAt: message.createdAt },
        "Thanks. Your message has been delivered to Robotix Institute."
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error('contact POST error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
