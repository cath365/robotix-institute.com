import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, createErrorResponse, getPaginationParams, createPaginatedResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Get leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    const gameId = searchParams.get('gameId');
    const period = searchParams.get('period') || 'all'; // all, weekly, monthly

    // Build date filter
    let dateFilter: Date | undefined;
    if (period === 'weekly') {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'monthly') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const where: Record<string, unknown> = {};
    if (gameId) where.gameId = gameId;
    if (dateFilter) where.createdAt = { gte: dateFilter };

    // Get top scores grouped by user
    const scores = await prisma.gameScore.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
          },
        },
      },
      orderBy: { score: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    });

    const total = await prisma.gameScore.count({ where });

    // Add rank to each score
    const rankedScores = scores.map((score, index) => ({
      ...score,
      rank: pagination.skip + index + 1,
    }));

    return NextResponse.json(createPaginatedResponse(rankedScores, total, pagination));
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
