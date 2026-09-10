import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { userId: user.userId };
    if (unreadOnly) where.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: user.userId, read: false } }),
    ]);

    return NextResponse.json(
      createApiResponse({
        notifications,
        unreadCount,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

// Mark notifications as read
export async function PATCH(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: user.userId, read: false },
        data: { read: true },
      });
    } else if (notificationIds?.length) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: user.userId,
        },
        data: { read: true },
      });
    }

    return NextResponse.json(createApiResponse(null, 'Notifications updated'));
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
