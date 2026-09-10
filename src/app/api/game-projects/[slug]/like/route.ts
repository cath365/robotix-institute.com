import { NextRequest, NextResponse } from 'next/server';
import { GameProjectStatus } from '@prisma/client';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

interface Params { params: { slug: string } }

/**
 * POST /api/game-projects/[slug]/like
 *
 * Toggle like for the current user. Returns the new like count and whether
 * the current user now likes the game.
 */
export async function POST(request: NextRequest, { params }: Params) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });

  if (!rateLimiter(`gp:like:${user.userId}`, 60, 60_000)) {
    return NextResponse.json(createErrorResponse('Too many likes'), { status: 429 });
  }

  try {
    const game = await prisma.gameProject.findUnique({
      where: { slug: params.slug },
      select: { id: true, status: true, userId: true },
    });
    if (!game) return NextResponse.json(createErrorResponse('Not found'), { status: 404 });
    if (game.status !== GameProjectStatus.PUBLISHED) {
      return NextResponse.json(createErrorResponse('Cannot like a draft'), { status: 400 });
    }

    const existing = await prisma.gameProjectLike.findUnique({
      where: { userId_gameProjectId: { userId: user.userId, gameProjectId: game.id } },
    });

    let liked: boolean;
    if (existing) {
      await prisma.$transaction([
        prisma.gameProjectLike.delete({ where: { id: existing.id } }),
        prisma.gameProject.update({ where: { id: game.id }, data: { likeCount: { decrement: 1 } } }),
      ]);
      liked = false;
    } else {
      await prisma.$transaction([
        prisma.gameProjectLike.create({
          data: { userId: user.userId, gameProjectId: game.id },
        }),
        prisma.gameProject.update({ where: { id: game.id }, data: { likeCount: { increment: 1 } } }),
      ]);
      liked = true;
    }

    const updated = await prisma.gameProject.findUnique({
      where: { id: game.id },
      select: { likeCount: true },
    });

    return NextResponse.json(createApiResponse({
      liked,
      likeCount: updated?.likeCount ?? 0,
    }));
  } catch (e) {
    console.error('like error', e);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
