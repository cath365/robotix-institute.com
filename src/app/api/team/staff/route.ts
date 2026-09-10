import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const denied = await requireRole(user, ['ADMIN', 'ACCOUNTANT', 'INSTRUCTOR']);
    if (denied) return denied;

    const staff = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ['ADMIN', 'ACCOUNTANT', 'INSTRUCTOR'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
      },
      orderBy: [{ role: 'asc' }, { firstName: 'asc' }],
    });

    return NextResponse.json(createApiResponse(staff));
  } catch (error) {
    console.error('team staff GET error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
