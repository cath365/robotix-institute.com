import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { createApiResponse, createErrorResponse, getPaginationParams, createPaginatedResponse, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const achievementSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(5, 'Description is required'),
  icon: z.string().min(1, 'Icon is required'),
  category: z.enum(['coding', 'robotics', 'competition', 'community']),
  points: z.number().int().min(1).max(1000).default(10),
  criteria: z.record(z.unknown()).optional().default({}),
});

// Get all achievements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    const category = searchParams.get('category');
    const user = getUserFromRequest(request);

    const where: Record<string, unknown> = {};
    if (category) where.category = category;

    const [achievements, total] = await Promise.all([
      prisma.achievement.findMany({
        where,
        orderBy: { points: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.achievement.count({ where }),
    ]);

    // If user is logged in, include their earned status
    let achievementsWithStatus = achievements;
    if (user) {
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId: user.userId },
        select: { achievementId: true, earnedAt: true },
      });

      const earnedMap = new Map(
        userAchievements.map(ua => [ua.achievementId, ua.earnedAt])
      );

      achievementsWithStatus = achievements.map(ach => ({
        ...ach,
        criteria: JSON.parse(ach.criteria),
        earned: earnedMap.has(ach.id),
        earnedAt: earnedMap.get(ach.id) || null,
      }));
    } else {
      achievementsWithStatus = achievements.map(ach => ({
        ...ach,
        criteria: JSON.parse(ach.criteria),
        earned: false,
        earnedAt: null,
      }));
    }

    return NextResponse.json(createPaginatedResponse(achievementsWithStatus, total, pagination));
  } catch (error) {
    console.error('Get achievements error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Create achievement (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const roleCheck = await requireRole(user, ['ADMIN']);
    if (roleCheck) return roleCheck;

    const body = await request.json();
    const validation = achievementSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const { name, description, icon, category, points, criteria } = validation.data;

    const achievement = await prisma.achievement.create({
      data: {
        name,
        description,
        icon,
        category,
        points,
        criteria: JSON.stringify(criteria),
      },
    });

    return NextResponse.json(createApiResponse({
      ...achievement,
      criteria: JSON.parse(achievement.criteria),
    }), { status: 201 });
  } catch (error) {
    console.error('Create achievement error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
