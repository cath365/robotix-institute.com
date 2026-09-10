import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const awardSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  achievementId: z.string().min(1, 'Achievement ID is required'),
});

// Award achievement to a user (Admin or system)
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    // Only admins can manually award achievements
    const roleCheck = await requireRole(user, ['ADMIN']);
    if (roleCheck) return roleCheck;

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter(ip, 30, 60000)) {
      return NextResponse.json(
        createErrorResponse('Too many requests'),
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = awardSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const { userId, achievementId } = validation.data;

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        createErrorResponse('User not found'),
        { status: 404 }
      );
    }

    // Check if achievement exists
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      return NextResponse.json(
        createErrorResponse('Achievement not found'),
        { status: 404 }
      );
    }

    // Check if already awarded
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        createErrorResponse('Achievement already awarded to this user'),
        { status: 409 }
      );
    }

    // Award achievement
    const userAchievement = await prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
      },
      include: {
        achievement: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(createApiResponse({
      message: 'Achievement awarded successfully',
      userAchievement,
    }), { status: 201 });
  } catch (error) {
    console.error('Award achievement error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
