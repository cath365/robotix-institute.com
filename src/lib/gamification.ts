import prisma from '@/lib/prisma';

/**
 * Adds points to a user and persists an audit log row (for weekly / all-time aggregates).
 */
export async function awardPoints(
  userId: string,
  delta: number,
  reason: string,
  meta?: Record<string, unknown>
): Promise<void> {
  if (delta === 0) return;
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: delta } },
    }),
    prisma.gamificationLog.create({
      data: {
        userId,
        delta,
        reason,
        ...(meta ? { meta: JSON.stringify(meta) } : {}),
      },
    }),
  ]);
}
