import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, getPaginationParams } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Combined gamification leaderboard.
 * GET ?period=all|weekly&limit=50
 *
 * • all — user's lifetime `points` field (cheap + authoritative)
 * • weekly — sum positive `GamificationLog` deltas inside last 7 days
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') === 'weekly' ? 'weekly' : 'all';
    const pagination = getPaginationParams(searchParams);
    const limit = Math.min(Math.max(pagination.limit, 1), 100);
    const skip = pagination.skip;

    if (period === 'all') {
      const rows = await prisma.user.findMany({
        where: { role: 'STUDENT', isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          points: true,
        },
        orderBy: [{ points: 'desc' }],
        skip,
        take: limit,
      });
      const total = await prisma.user.count({
        where: { role: 'STUDENT', isActive: true },
      });
      const me = getUserFromRequest(request);
      const ranked = rows.map((r, i) => ({
        rank: skip + i + 1,
        user: {
          id: r.id,
          firstName: r.firstName,
          lastName: r.lastName,
          avatar: r.avatar,
        },
        points: r.points,
        isMe: me?.userId === r.id,
      }));
      return NextResponse.json(
        createApiResponse({ leaderboard: ranked, period, total })
      );
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const aggregates: { userId: string; pts: bigint }[] = await prisma.$queryRaw`
      SELECT "userId", SUM(delta)::bigint AS pts
      FROM "GamificationLog"
      WHERE "createdAt" >= ${weekAgo}
      GROUP BY "userId"
      HAVING SUM(delta) > 0
      ORDER BY pts DESC
      OFFSET ${skip}
      LIMIT ${limit}
    `;

    const countRows = await prisma.$queryRaw<{ c: bigint }[]>`
      SELECT COUNT(*)::bigint AS c FROM (
        SELECT "userId" FROM "GamificationLog"
        WHERE "createdAt" >= ${weekAgo}
        GROUP BY "userId"
        HAVING SUM(delta) > 0
      ) t`;

    const totalUsers = Number(countRows[0]?.c ?? 0);
    const userIds = aggregates.map((a) => a.userId);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));
    const me = getUserFromRequest(request);

    const leaderboard = aggregates.map((a, i) => {
      const u = userMap.get(a.userId);
      return {
        rank: skip + i + 1,
        points: Number(a.pts),
        user: u
          ? {
              id: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              avatar: u.avatar,
            }
          : { id: a.userId, firstName: '?', lastName: '?', avatar: null as string | null },
        isMe: me?.userId === a.userId,
      };
    });

    return NextResponse.json(
      createApiResponse({ leaderboard, period: 'weekly', total: totalUsers })
    );
  } catch (e) {
    console.error('leaderboard/users', e);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
