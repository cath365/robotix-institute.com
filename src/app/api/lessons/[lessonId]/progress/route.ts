import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import {
  createApiResponse, createErrorResponse, rateLimiter, validateInput,
} from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { awardPoints } from '@/lib/gamification';
import { ensureCourseCertificate } from '@/lib/certificates';

interface Params {
  params: { lessonId: string };
}

const bodySchema = z.object({
  completed: z.literal(true),
  watchSeconds: z.number().int().min(0).max(24 * 3600).optional(),
});

/** POST marks a lesson complete for the enrollee; awards points once. */
export async function POST(request: NextRequest, { params }: Params) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimiter(`lesson:${params.lessonId}:${user.userId}:${ip}`, 15, 60_000)) {
    return NextResponse.json(createErrorResponse('Slow down'), { status: 429 });
  }

  try {
    const json = await request.json();
    const val = validateInput(bodySchema, json);
    if (!val.success) {
      return NextResponse.json(createErrorResponse('Validation failed', val.errors), { status: 400 });
    }
    const { watchSeconds } = val.data!;

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
      select: {
        id: true,
        moduleId: true,
        module: { select: { courseId: true } },
      },
    });
    if (!lesson) {
      return NextResponse.json(createErrorResponse('Lesson not found'), { status: 404 });
    }

    const courseId = lesson.module.courseId;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.userId, courseId } },
    });
    if (!enrollment) {
      return NextResponse.json(
        createErrorResponse('You must enrol in this course first'),
        { status: 403 }
      );
    }

    const prior = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: user.userId, lessonId: lesson.id } },
    });

    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.userId, lessonId: lesson.id } },
      create: {
        userId: user.userId,
        lessonId: lesson.id,
        completed: true,
        watchTime: watchSeconds ?? 0,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        ...(typeof watchSeconds === 'number'
          ? { watchTime: { increment: watchSeconds } }
          : {}),
        completedAt: new Date(),
      },
    });

    if (!prior?.completed) {
      await awardPoints(user.userId, 10, 'lesson_complete', {
        lessonId: lesson.id,
        courseId,
      });
    }

    const courseLessonCount = await prisma.lesson.count({
      where: { module: { courseId } },
    });

    const doneCount = await prisma.lessonProgress.count({
      where: {
        userId: user.userId,
        completed: true,
        lesson: { module: { courseId } },
      },
    });

    const nextProgress =
      courseLessonCount === 0 ? 0 : Math.min(1, doneCount / courseLessonCount);

    const updatedEnrollment = await prisma.enrollment.update({
      where: { userId_courseId: { userId: user.userId, courseId } },
      data: {
        progress: nextProgress,
        completed: doneCount >= courseLessonCount && courseLessonCount > 0,
      },
    });

    const certificate = updatedEnrollment.completed
      ? await ensureCourseCertificate(user.userId, courseId)
      : null;

    return NextResponse.json(
      createApiResponse({
        lessonId: lesson.id,
        completed: true,
        courseProgressApprox: Math.round(nextProgress * 100),
        certificate: certificate
          ? {
              certCode: certificate.certCode,
              title: certificate.title,
              issueDate: certificate.issueDate,
            }
          : null,
      })
    );
  } catch (e) {
    console.error('lesson progress', e);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
