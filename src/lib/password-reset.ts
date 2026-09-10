import { createHash, randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import { getAppOrigin } from '@/lib/mailer';

const RESET_WINDOW_HOURS = 1;

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function getPasswordResetExpiryHours() {
  return RESET_WINDOW_HOURS;
}

export function buildResetPasswordUrl(token: string) {
  return `${getAppOrigin()}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function createPasswordResetToken(userId: string) {
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId,
      OR: [{ usedAt: null }, { expiresAt: { lt: new Date() } }],
    },
  });

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_WINDOW_HOURS * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashResetToken(token),
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function getPasswordResetRecord(token: string) {
  const tokenHash = hashResetToken(token);
  return prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          isActive: true,
        },
      },
    },
  });
}

export function isPasswordResetRecordValid(record: {
  usedAt: Date | null;
  expiresAt: Date;
  user: { isActive: boolean };
} | null) {
  if (!record) return false;
  if (record.usedAt) return false;
  if (!record.user.isActive) return false;
  return record.expiresAt.getTime() > Date.now();
}
