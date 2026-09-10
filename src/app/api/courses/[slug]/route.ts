import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import { getUserFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface Params {
  params: { slug: string };
}

// Get course by slug with full details
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = params;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
          },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                duration: true,
                type: true,
                order: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        createErrorResponse('Course not found'),
        { status: 404 }
      );
    }

    const jwt = getUserFromRequest(request);

    if (!course.published) {
      let allow = false;
      if (jwt) {
        const u = await prisma.user.findUnique({
          where: { id: jwt.userId },
          select: { role: true },
        });
        allow = u?.role === 'ADMIN' || u?.role === 'INSTRUCTOR';
      }
      if (!allow) {
        return NextResponse.json(
          createErrorResponse('Course not found'),
          { status: 404 }
        );
      }
    }

    const totalDuration = course.modules.reduce((acc, module) => {
      return acc + module.lessons.reduce((lessonAcc, lesson) => lessonAcc + lesson.duration, 0);
    }, 0);

    const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);

    let viewerEnrollment: { progress: number; completed: boolean } | null = null;
    let completedLessonIds: string[] = [];
    let viewerCertificate:
      | { certCode: string; title: string; issueDate: Date }
      | null = null;

    if (jwt) {
      const en = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: jwt.userId, courseId: course.id } },
        select: { progress: true, completed: true },
      });

      if (en) {
        viewerEnrollment = { progress: en.progress, completed: en.completed };

        const progressRows = await prisma.lessonProgress.findMany({
          where: {
            userId: jwt.userId,
            completed: true,
            lesson: { module: { courseId: course.id } },
          },
          select: { lessonId: true },
        });
        completedLessonIds = progressRows.map((r) => r.lessonId);

        const certificate = await prisma.certificate.findFirst({
          where: {
            userId: jwt.userId,
            courseId: course.id,
          },
          select: {
            certCode: true,
            title: true,
            issueDate: true,
          },
        });
        if (certificate) {
          viewerCertificate = certificate;
        }
      }
    }

    return NextResponse.json(
      createApiResponse({
        ...course,
        totalDuration,
        totalLessons,
        enrolledCount: course._count.enrollments,
        viewerEnrollment,
        completedLessonIds,
        viewerCertificate,
      })
    );
  } catch (error) {
    console.error('Get course error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
