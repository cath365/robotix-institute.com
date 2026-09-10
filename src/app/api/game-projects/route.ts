import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GameProjectStatus, Prisma } from '@prisma/client';
import { getUserFromRequest } from '@/lib/auth';
import {
  createApiResponse, createErrorResponse, getPaginationParams,
  createPaginatedResponse, rateLimiter, validateInput,
} from '@/lib/api-utils';
import prisma from '@/lib/prisma';

const MAX_CODE_BYTES = 200_000; // ~200 KB; plenty for a Phaser game

const createSchema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().max(500).optional().default(''),
  code: z.string().min(1).max(MAX_CODE_BYTES),
  templateId: z.string().max(40).optional(),
  tags: z.string().max(200).optional().default(''),
  thumbnail: z.string().url().optional(),
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || 'game';
  let candidate = root;
  let n = 1;
  // We try up to 50 variants before falling back to a random suffix.
  while (n < 50) {
    const exists = await prisma.gameProject.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!exists) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
  return `${root}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * GET /api/game-projects
 *
 * Query:
 *   - status: DRAFT | PENDING | PUBLISHED | REJECTED
 *   - mine=1: only the authenticated user's games (overrides status default)
 *   - q: search term (title)
 *   - sort: recent | popular | trending (default recent)
 *   - page, limit: standard pagination
 *
 * Defaults:
 *   - Anonymous: only PUBLISHED games are returned.
 *   - Authenticated + mine=1: all of the user's games regardless of status.
 *   - Authenticated otherwise: only PUBLISHED.
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);

    const mine = searchParams.get('mine') === '1';
    const status = searchParams.get('status') as GameProjectStatus | null;
    const q = searchParams.get('q')?.trim();
    const sort = searchParams.get('sort') ?? 'recent';

    const where: Prisma.GameProjectWhereInput = {};
    if (mine) {
      if (!user) return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
      where.userId = user.userId;
      if (status) where.status = status;
    } else if (user && status && (status === GameProjectStatus.PENDING || status === GameProjectStatus.REJECTED)) {
      // Only admins can browse pending / rejected globally.
      const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { role: true } });
      if (dbUser?.role !== 'ADMIN') {
        return NextResponse.json(createErrorResponse('Forbidden'), { status: 403 });
      }
      where.status = status;
    } else {
      where.status = GameProjectStatus.PUBLISHED;
    }
    if (q) where.title = { contains: q, mode: 'insensitive' };

    const orderBy: Prisma.GameProjectOrderByWithRelationInput =
      sort === 'popular' ? { likeCount: 'desc' } :
      sort === 'trending' ? { playCount: 'desc' } :
      { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      prisma.gameProject.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.gameProject.count({ where }),
    ]);

    return NextResponse.json(createPaginatedResponse(items, total, pagination));
  } catch (e) {
    console.error('GET /api/game-projects', e);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

/**
 * POST /api/game-projects
 *
 * Auth required. Creates a DRAFT game owned by the current user.
 */
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimiter(`gp:create:${user.userId}:${ip}`, 30, 60_000)) {
    return NextResponse.json(createErrorResponse('Too many creates'), { status: 429 });
  }

  try {
    const body = await request.json();
    const validation = validateInput(createSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.errors),
        { status: 400 }
      );
    }

    const data = validation.data!;
    const slug = await uniqueSlug(slugify(data.title));

    const created = await prisma.gameProject.create({
      data: {
        userId: user.userId,
        title: data.title,
        description: data.description ?? '',
        code: data.code,
        templateId: data.templateId,
        tags: data.tags ?? '',
        thumbnail: data.thumbnail,
        slug,
        status: GameProjectStatus.DRAFT,
      },
    });

    return NextResponse.json(createApiResponse(created, 'Game created'), { status: 201 });
  } catch (e) {
    console.error('POST /api/game-projects', e);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
