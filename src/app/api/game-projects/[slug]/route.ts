import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GameProjectStatus } from '@prisma/client';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, validateInput, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

interface Params { params: { slug: string } }

const MAX_CODE_BYTES = 200_000;
const updateSchema = z.object({
  title: z.string().min(2).max(80).optional(),
  description: z.string().max(500).optional(),
  code: z.string().min(1).max(MAX_CODE_BYTES).optional(),
  tags: z.string().max(200).optional(),
  thumbnail: z.string().url().nullable().optional(),
});

/**
 * GET /api/game-projects/[slug]
 *
 * Anyone can view a PUBLISHED game; only the owner & admins can view drafts.
 * Increments playCount when `?play=1` is passed (rate-limited to prevent
 * inflation).
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const game = await prisma.gameProject.findUnique({
      where: { slug: params.slug },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { likes: true } },
      },
    });
    if (!game) return NextResponse.json(createErrorResponse('Game not found'), { status: 404 });

    const user = getUserFromRequest(request);
    if (game.status !== GameProjectStatus.PUBLISHED) {
      const isOwner = user?.userId === game.userId;
      let isAdmin = false;
      if (user) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { role: true } });
        isAdmin = dbUser?.role === 'ADMIN';
      }
      if (!isOwner && !isAdmin) {
        return NextResponse.json(createErrorResponse('Game not found'), { status: 404 });
      }
    }

    // Increment play count when explicitly playing — soft, IP-rate-limited.
    const { searchParams } = new URL(request.url);
    if (searchParams.get('play') === '1') {
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      if (rateLimiter(`gp:play:${game.id}:${ip}`, 10, 60_000)) {
        await prisma.gameProject.update({
          where: { id: game.id },
          data: { playCount: { increment: 1 } },
        });
      }
    }

    // Has the current viewer liked this game?
    let liked = false;
    if (user) {
      const existing = await prisma.gameProjectLike.findUnique({
        where: { userId_gameProjectId: { userId: user.userId, gameProjectId: game.id } },
        select: { id: true },
      });
      liked = !!existing;
    }

    return NextResponse.json(createApiResponse({ ...game, liked }));
  } catch (e) {
    console.error('GET /api/game-projects/[slug]', e);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

/**
 * PATCH /api/game-projects/[slug]
 *
 * Update fields on a game. Owner only. Editing a PUBLISHED game flips status
 * back to DRAFT so changes go through admin re-approval.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });

  try {
    const game = await prisma.gameProject.findUnique({ where: { slug: params.slug } });
    if (!game) return NextResponse.json(createErrorResponse('Not found'), { status: 404 });
    if (game.userId !== user.userId) {
      return NextResponse.json(createErrorResponse('Forbidden'), { status: 403 });
    }

    const body = await request.json();
    const validation = validateInput(updateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.errors),
        { status: 400 }
      );
    }

    const data = validation.data!;
    const codeChanged = typeof data.code === 'string' && data.code !== game.code;

    const updated = await prisma.gameProject.update({
      where: { id: game.id },
      data: {
        ...data,
        // If a published game's code changes, send it back through review.
        ...(codeChanged && game.status === GameProjectStatus.PUBLISHED
          ? { status: GameProjectStatus.DRAFT, publishedAt: null }
          : {}),
      },
    });
    return NextResponse.json(createApiResponse(updated, 'Saved'));
  } catch (e) {
    console.error('PATCH /api/game-projects/[slug]', e);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

/**
 * DELETE /api/game-projects/[slug]
 *
 * Owner or admin only.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
  try {
    const game = await prisma.gameProject.findUnique({ where: { slug: params.slug } });
    if (!game) return NextResponse.json(createErrorResponse('Not found'), { status: 404 });

    let allowed = game.userId === user.userId;
    if (!allowed) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { role: true } });
      allowed = dbUser?.role === 'ADMIN';
    }
    if (!allowed) return NextResponse.json(createErrorResponse('Forbidden'), { status: 403 });

    await prisma.gameProject.delete({ where: { id: game.id } });
    return NextResponse.json(createApiResponse({ ok: true }, 'Deleted'));
  } catch (e) {
    console.error('DELETE /api/game-projects/[slug]', e);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
