import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, getPaginationParams, createPaginatedResponse, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  competitionId: z.string().min(1, 'Competition ID is required'),
});

// Get teams for a competition
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    const competitionId = searchParams.get('competitionId');

    if (!competitionId) {
      return NextResponse.json(
        createErrorResponse('Competition ID is required'),
        { status: 400 }
      );
    }

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where: { competitionId },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
          submissions: {
            orderBy: { submittedAt: 'desc' },
            take: 1,
            select: {
              id: true,
              title: true,
              status: true,
              score: true,
            },
          },
          _count: {
            select: { members: true },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.team.count({ where: { competitionId } }),
    ]);

    return NextResponse.json(createPaginatedResponse(teams, total, pagination));
  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Create a new team
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter(ip, 10, 60000)) {
      return NextResponse.json(
        createErrorResponse('Too many requests'),
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = teamSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const { name, competitionId } = validation.data;

    // Check competition exists and is open for registration
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: { id: true, status: true, maxTeamSize: true },
    });

    if (!competition) {
      return NextResponse.json(
        createErrorResponse('Competition not found'),
        { status: 404 }
      );
    }

    if (competition.status !== 'upcoming' && competition.status !== 'active') {
      return NextResponse.json(
        createErrorResponse('Competition is not accepting new teams'),
        { status: 400 }
      );
    }

    // Check if user is already in a team for this competition
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        userId: user.userId,
        team: { competitionId },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        createErrorResponse('You are already in a team for this competition'),
        { status: 409 }
      );
    }

    // Create team with user as leader
    const team = await prisma.team.create({
      data: {
        name,
        competitionId,
        members: {
          create: {
            userId: user.userId,
            role: 'leader',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      createApiResponse(team, 'Team created successfully'),
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        createErrorResponse('A team with this name already exists in this competition'),
        { status: 409 }
      );
    }
    console.error('Create team error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
