import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const path = await prisma.learningPath.findUnique({
      where: { slug: params.slug },
      include: {
        steps: { orderBy: { order: 'asc' } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!path) {
      return NextResponse.json(createErrorResponse('Learning path not found'), { status: 404 });
    }

    // Check if current user is enrolled
    const user = getUserFromRequest(request);
    let enrollment = null;
    if (user) {
      enrollment = await prisma.pathEnrollment.findUnique({
        where: { userId_learningPathId: { userId: user.userId, learningPathId: path.id } },
      });
    }

    return NextResponse.json(createApiResponse({ ...path, enrollment }));
  } catch (error) {
    console.error('Learning path detail error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
