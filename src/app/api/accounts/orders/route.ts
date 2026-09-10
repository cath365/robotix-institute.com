import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { createApiResponse, createErrorResponse, getPaginationParams, sanitizeInput, validateInput } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const paymentUpdateSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID', 'WAIVED', 'REFUNDED']).optional(),
  amountPaid: z.number().min(0).optional(),
  paymentMethod: z.string().max(80).optional().default(''),
  paymentReference: z.string().max(120).optional().default(''),
  accountsNotes: z.string().max(1500).optional().default(''),
});

const orderSelect = {
  id: true,
  total: true,
  status: true,
  paymentStatus: true,
  paymentMethod: true,
  amountPaid: true,
  paymentReference: true,
  accountsNotes: true,
  paidAt: true,
  address: true,
  phone: true,
  createdAt: true,
  user: {
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  items: {
    include: {
      product: {
        select: {
          name: true,
          slug: true,
          thumbnail: true,
        },
      },
    },
  },
} as const;

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const denied = await requireRole(user, ['ADMIN', 'ACCOUNTANT']);
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    const paymentStatus = searchParams.get('paymentStatus');
    const where = paymentStatus ? { paymentStatus } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: Math.min(pagination.limit, 50),
        select: orderSelect,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json(
      createApiResponse({
        orders,
        total,
        totalDue: orders.reduce((sum, order) => sum + Math.max(0, order.total - order.amountPaid), 0),
        totalPaid: orders.reduce((sum, order) => sum + order.amountPaid, 0),
      })
    );
  } catch (error) {
    console.error('accounts orders GET error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const denied = await requireRole(user, ['ADMIN', 'ACCOUNTANT']);
    if (denied) return denied;

    const body = await request.json();
    const validation = validateInput(paymentUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json(createErrorResponse('Validation failed', validation.errors), { status: 400 });
    }

    const payload = validation.data!;
    const updateData: {
      status?: string;
      paymentStatus?: string;
      amountPaid?: number;
      paymentMethod?: string;
      paymentReference?: string;
      accountsNotes?: string;
      paidAt?: Date | null;
    } = {};

    if (payload.status) updateData.status = payload.status;
    if (payload.paymentStatus) {
      updateData.paymentStatus = payload.paymentStatus;
      updateData.paidAt = payload.paymentStatus === 'PAID' ? new Date() : null;
    }
    if (payload.amountPaid !== undefined) updateData.amountPaid = payload.amountPaid;
    if (payload.paymentMethod !== undefined) updateData.paymentMethod = sanitizeInput(payload.paymentMethod);
    if (payload.paymentReference !== undefined) updateData.paymentReference = sanitizeInput(payload.paymentReference);
    if (payload.accountsNotes !== undefined) updateData.accountsNotes = sanitizeInput(payload.accountsNotes);

    const order = await prisma.order.update({
      where: { id: payload.orderId },
      data: updateData,
      select: orderSelect,
    });

    return NextResponse.json(createApiResponse(order, 'Payment details updated'));
  } catch (error) {
    console.error('accounts orders PATCH error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
