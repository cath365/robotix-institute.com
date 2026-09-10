import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  const checks: Record<string, { ok: boolean; message?: string }> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { ok: true };
  } catch (error) {
    checks.database = {
      ok: false,
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }

  const jwtSecret = process.env.JWT_SECRET;
  checks.auth = {
    ok: Boolean(jwtSecret && jwtSecret.length >= 32),
    ...(!(jwtSecret && jwtSecret.length >= 32)
      ? { message: 'JWT_SECRET is missing or shorter than 32 characters' }
      : {}),
  };

  checks.environment = {
    ok: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development',
  };

  const ok = Object.values(checks).every((check) => check.ok);

  return NextResponse.json(
    {
      ok,
      service: 'robotix-institute-backend',
      environment: process.env.NODE_ENV,
      checks,
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 }
  );
}
