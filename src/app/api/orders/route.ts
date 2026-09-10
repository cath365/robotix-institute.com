import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { orderSchema } from '@/lib/validations';
import { createApiResponse, createErrorResponse, getPaginationParams, createPaginatedResponse, validateInput, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

// Get user's orders
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { userId: user.userId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
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
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json(createPaginatedResponse(orders, total, pagination));
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Create a new order (checkout)
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter(ip, 10, 60000)) {
      return NextResponse.json(
        createErrorResponse('Too many requests'),
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = validateInput(orderSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.errors),
        { status: 400 }
      );
    }

    const { items, address, phone } = validation.data!;

    // Validate products and check stock
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        createErrorResponse('Some products are not available'),
        { status: 400 }
      );
    }

    // Check stock availability
    const productMap = new Map(products.map(p => [p.id, p]));
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          createErrorResponse(`Insufficient stock for ${product?.name || 'product'}`),
          { status: 400 }
        );
      }
    }

    // Calculate total
    let total = 0;
    const orderItems = items.map(item => {
      const product = productMap.get(item.productId)!;
      const price = product.salePrice || product.price;
      total += price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
      };
    });

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: user.userId,
          total,
          address,
          phone,
          status: 'pending',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  thumbnail: true,
                },
              },
            },
          },
        },
      });

      // Update stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    return NextResponse.json(
      createApiResponse(order, 'Order placed successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
