import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { createApiResponse, createErrorResponse, getPaginationParams, createPaginatedResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

// Get all users (admin only)
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
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const isActive = searchParams.get('active');

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (isActive === 'true') where.isActive = true;
    if (isActive === 'false') where.isActive = false;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              enrollments: true,
              orders: true,
              codeProjects: true,
            },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json(createPaginatedResponse(users, total, pagination));
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Update user (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const adminUser = getUserFromRequest(request);
    if (!adminUser) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }
    const denied = await requireRole(adminUser, ['ADMIN']);
    if (denied) return denied;

    const body = await request.json();
    const { userId, role, isActive } = body;

    if (!userId) {
      return NextResponse.json(
        createErrorResponse('User ID is required'),
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (role && ['STUDENT', 'INSTRUCTOR', 'ACCOUNTANT', 'ADMIN'].includes(role)) {
      updateData.role = role;
    }
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json(
      createApiResponse(user, 'User updated successfully')
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
