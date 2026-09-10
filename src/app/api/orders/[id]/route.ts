import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

interface Params {
  params: { id: string };
}

const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
});

// Get order details
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        createErrorResponse('Order not found'),
        { status: 404 }
      );
    }

    // Check ownership or admin
    const isAdmin = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true },
    }).then(u => u?.role === 'ADMIN');

    if (order.userId !== user.userId && !isAdmin) {
      return NextResponse.json(
        createErrorResponse('Forbidden'),
        { status: 403 }
      );
    }

    return NextResponse.json(createApiResponse(order));
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Update order status (Admin only)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const roleCheck = await requireRole(user, ['ADMIN']);
    if (roleCheck) return roleCheck;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json(
        createErrorResponse('Order not found'),
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = statusUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const { status } = validation.data;

    // If cancelling, restore stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: params.id },
      });

      await Promise.all(
        orderItems.map(item =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        )
      );
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                thumbnail: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(createApiResponse(updated));
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
