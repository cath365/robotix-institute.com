import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};

    if (status && status !== 'All') {
      where.status = status;
    }

    const competitions = await prisma.competition.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: { teams: true },
        },
      },
    });

    return NextResponse.json(competitions);
  } catch (error) {
    console.error('Competitions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitions' },
      { status: 500 }
    );
  }
}
