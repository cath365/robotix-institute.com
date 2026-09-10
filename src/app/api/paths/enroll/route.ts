import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

// Enroll in a learning path
export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }

    const { learningPathId } = await request.json();
    if (!learningPathId) {
      return NextResponse.json(createErrorResponse('Learning path ID is required'), { status: 400 });
    }

    const path = await prisma.learningPath.findUnique({ where: { id: learningPathId } });
    if (!path || !path.published) {
      return NextResponse.json(createErrorResponse('Learning path not found'), { status: 404 });
    }

    const existing = await prisma.pathEnrollment.findUnique({
      where: { userId_learningPathId: { userId: user.userId, learningPathId } },
    });
    if (existing) {
      return NextResponse.json(createErrorResponse('Already enrolled'), { status: 409 });
    }

    const enrollment = await prisma.pathEnrollment.create({
      data: { userId: user.userId, learningPathId },
      include: { learningPath: true },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.userId,
        type: 'course',
        title: 'Path Enrolled!',
        message: `You've started the "${path.title}" learning path. Good luck!`,
        link: `/paths/${path.slug}`,
      },
    });

    return NextResponse.json(createApiResponse(enrollment, 'Enrolled successfully'), { status: 201 });
  } catch (error) {
    console.error('Path enrollment error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

// Update progress in a path
export async function PATCH(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }

    const { learningPathId, currentStep, completed } = await request.json();

    const enrollment = await prisma.pathEnrollment.findUnique({
      where: { userId_learningPathId: { userId: user.userId, learningPathId } },
    });
    if (!enrollment) {
      return NextResponse.json(createErrorResponse('Not enrolled'), { status: 404 });
    }

    const updated = await prisma.pathEnrollment.update({
      where: { id: enrollment.id },
      data: {
        currentStep: currentStep ?? enrollment.currentStep,
        completed: completed ?? enrollment.completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json(createApiResponse(updated, 'Progress updated'));
  } catch (error) {
    console.error('Path progress error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
