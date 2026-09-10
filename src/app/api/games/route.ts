import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, getPaginationParams, createPaginatedResponse, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const gameScoreSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  score: z.number().int().min(0, 'Score must be positive'),
  level: z.number().int().min(1).optional().default(1),
  time: z.number().int().optional(), // Time to complete in seconds
});

// Get games list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    const type = searchParams.get('type');
    const difficulty = searchParams.get('difficulty');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (difficulty) where.difficulty = difficulty;

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          levels: {
            orderBy: { levelNum: 'asc' },
            select: {
              id: true,
              levelNum: true,
              name: true,
              maxScore: true,
            },
          },
          _count: {
            select: { scores: true },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.game.count({ where }),
    ]);

    return NextResponse.json(createPaginatedResponse(games, total, pagination));
  } catch (error) {
    console.error('Get games error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Submit a game score
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter(ip, 60, 60000)) {
      return NextResponse.json(
        createErrorResponse('Too many requests'),
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = gameScoreSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const { gameId, score, level, time } = validation.data;

    // Verify game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, maxScore: true },
    });

    if (!game) {
      return NextResponse.json(
        createErrorResponse('Game not found'),
        { status: 404 }
      );
    }

    // Cap score at max
    const finalScore = Math.min(score, game.maxScore);

    const gameScore = await prisma.gameScore.create({
      data: {
        userId: user.userId,
        gameId,
        score: finalScore,
        level,
        time,
      },
      include: {
        game: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    // Get user's rank for this game
    const betterScores = await prisma.gameScore.count({
      where: {
        gameId,
        score: { gt: finalScore },
      },
    });

    return NextResponse.json(
      createApiResponse({
        ...gameScore,
        rank: betterScores + 1,
      }, 'Score submitted successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Submit score error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
