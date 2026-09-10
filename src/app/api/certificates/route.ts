import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { createApiResponse, createErrorResponse, getPaginationParams, createPaginatedResponse } from '@/lib/api-utils';
import { generateCertCode } from '@/lib/utils';
import prisma from '@/lib/prisma';

// Get user's certificates
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
    const courseId = searchParams.get('courseId');

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where: {
          userId: user.userId,
          ...(courseId ? { courseId } : {}),
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { issueDate: 'desc' },
      }),
      prisma.certificate.count({
        where: {
          userId: user.userId,
          ...(courseId ? { courseId } : {}),
        },
      }),
    ]);

    return NextResponse.json(createPaginatedResponse(certificates, total, pagination));
  } catch (error) {
    console.error('Get certificates error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Issue a certificate (admin/instructor only)
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }
    const denied = await requireRole(user, ['ADMIN', 'INSTRUCTOR']);
    if (denied) return denied;

    const body = await request.json();
    const { userId, courseId, title } = body;

    if (!userId || !courseId || !title) {
      return NextResponse.json(
        createErrorResponse('User ID, course ID, and title are required'),
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) {
      return NextResponse.json(createErrorResponse('Course not found'), { status: 404 });
    }

    // Check if certificate already exists
    const existing = await prisma.certificate.findFirst({
      where: { userId, courseId },
    });

    if (existing) {
      return NextResponse.json(
        createErrorResponse('Certificate already issued'),
        { status: 409 }
      );
    }

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        title,
        certCode: generateCertCode(),
      },
    });

    return NextResponse.json(
      createApiResponse(certificate, 'Certificate issued successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Issue certificate error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
