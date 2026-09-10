import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GameProjectStatus } from '@prisma/client';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { createApiResponse, createErrorResponse, validateInput } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { awardPoints } from '@/lib/gamification';

interface Params { params: { slug: string } }

const decisionSchema = z.object({
  approve: z.boolean(),
  reason: z.string().max(400).optional(),
});

/**
 * POST /api/game-projects/[slug]/approve
 *
 * Admin-only. Body: `{ approve: true }` to publish, or `{ approve: false, reason }`
 * to reject. Awards 50 gamification points to the author on publish.
 */
export async function POST(request: NextRequest, { params }: Params) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
  const denied = await requireRole(user, ['ADMIN']);
  if (denied) return denied;

  try {
    const game = await prisma.gameProject.findUnique({ where: { slug: params.slug } });
    if (!game) return NextResponse.json(createErrorResponse('Not found'), { status: 404 });

    const body = await request.json();
    const validation = validateInput(decisionSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.errors),
        { status: 400 }
      );
    }
    const { approve, reason } = validation.data!;

    const updated = await prisma.gameProject.update({
      where: { id: game.id },
      data: approve
        ? {
            status: GameProjectStatus.PUBLISHED,
            publishedAt: new Date(),
            rejectionReason: null,
          }
        : {
            status: GameProjectStatus.REJECTED,
            rejectionReason: reason || 'Did not meet community guidelines.',
          },
    });

    // Notify the author
    await prisma.notification.create({
      data: {
        userId: game.userId,
        type: 'system',
        title: approve ? 'Your game has been published! 🎉' : 'Your game needs revisions',
        message: approve
          ? `"${game.title}" is now live in the public gallery.`
          : `"${game.title}" was not approved. Reason: ${reason || 'See gallery guidelines.'}`,
        link: approve ? `/game-gallery?view=${game.slug}` : `/game-lab/${game.slug}`,
      },
    }).catch(() => { /* notifications are best-effort */ });

    if (approve) {
      await awardPoints(game.userId, 50, 'game_published', { gameProjectId: game.id, slug: game.slug });
    }

    return NextResponse.json(
      createApiResponse(updated, approve ? 'Game published' : 'Game rejected')
    );
  } catch (e) {
    console.error('approve error', e);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
