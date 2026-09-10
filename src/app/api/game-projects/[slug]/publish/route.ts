import { NextRequest, NextResponse } from 'next/server';
import { GameProjectStatus } from '@prisma/client';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

interface Params { params: { slug: string } }

/**
 * POST /api/game-projects/[slug]/publish
 *
 * Submit a draft for admin review. Owner only. Idempotent.
 */
export async function POST(request: NextRequest, { params }: Params) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });

  try {
    const game = await prisma.gameProject.findUnique({ where: { slug: params.slug } });
    if (!game) return NextResponse.json(createErrorResponse('Not found'), { status: 404 });
    if (game.userId !== user.userId) {
      return NextResponse.json(createErrorResponse('Forbidden'), { status: 403 });
    }

    if (game.status === GameProjectStatus.PUBLISHED) {
      return NextResponse.json(createApiResponse(game, 'Already published'));
    }

    const updated = await prisma.gameProject.update({
      where: { id: game.id },
      data: {
        status: GameProjectStatus.PENDING,
        rejectionReason: null,
      },
    });

    return NextResponse.json(
      createApiResponse(updated, 'Submitted for review. An admin will publish it shortly.')
    );
  } catch (e) {
    console.error('publish error', e);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

/**
 * DELETE /api/game-projects/[slug]/publish
 *
 * Unpublish a published game. Owner only.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
  try {
    const game = await prisma.gameProject.findUnique({ where: { slug: params.slug } });
    if (!game) return NextResponse.json(createErrorResponse('Not found'), { status: 404 });
    if (game.userId !== user.userId) {
      return NextResponse.json(createErrorResponse('Forbidden'), { status: 403 });
    }
    const updated = await prisma.gameProject.update({
      where: { id: game.id },
      data: { status: GameProjectStatus.DRAFT, publishedAt: null },
    });
    return NextResponse.json(createApiResponse(updated, 'Unpublished'));
  } catch (e) {
    console.error('unpublish error', e);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
