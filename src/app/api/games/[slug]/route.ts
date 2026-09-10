import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

interface Params {
  params: { slug: string };
}

const scoreSubmitSchema = z.object({
  score: z.number().int().min(0),
  level: z.number().int().min(1),
  time: z.number().int().optional(), // seconds to complete
});

// Get game by slug with leaderboard
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const includeLeaderboard = searchParams.get('leaderboard') !== 'false';

    const game = await prisma.game.findUnique({
      where: { slug },
      include: {
        levels: {
          orderBy: { levelNum: 'asc' },
        },
      },
    });

    if (!game) {
      return NextResponse.json(
        createErrorResponse('Game not found'),
        { status: 404 }
      );
    }

    // Parse level configs
    const levelsWithConfig = game.levels.map(level => ({
      ...level,
      config: JSON.parse(level.config),
    }));

    let topScores: unknown[] = [];
    if (includeLeaderboard) {
      topScores = await prisma.gameScore.findMany({
        where: { gameId: game.id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { score: 'desc' },
        take: 10,
      });
    }

    // Get unique players count
    const uniquePlayers = await prisma.gameScore.groupBy({
      by: ['userId'],
      where: { gameId: game.id },
    });

    return NextResponse.json(createApiResponse({
      ...game,
      levels: levelsWithConfig,
      topScores,
      totalPlayers: uniquePlayers.length,
    }));
  } catch (error) {
    console.error('Get game error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Submit a score
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter(ip, 60, 60000)) { // 60 score submissions per minute
      return NextResponse.json(
        createErrorResponse('Too many requests'),
        { status: 429 }
      );
    }

    const { slug } = params;
    const body = await request.json();
    
    const validation = scoreSubmitSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const { score, level, time } = validation.data;

    const game = await prisma.game.findUnique({
      where: { slug },
    });

    if (!game) {
      return NextResponse.json(
        createErrorResponse('Game not found'),
        { status: 404 }
      );
    }

    // Check if score exceeds max
    if (score > game.maxScore) {
      return NextResponse.json(
        createErrorResponse('Invalid score'),
        { status: 400 }
      );
    }

    // Create score record
    const gameScore = await prisma.gameScore.create({
      data: {
        userId: user.userId,
        gameId: game.id,
        score,
        level,
        time,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        game: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    // Calculate rank
    const higherScores = await prisma.gameScore.count({
      where: {
        gameId: game.id,
        score: { gt: score },
      },
    });

    return NextResponse.json(createApiResponse({
      ...gameScore,
      rank: higherScores + 1,
    }), { status: 201 });
  } catch (error) {
    console.error('Submit score error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
