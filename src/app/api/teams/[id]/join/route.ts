import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

interface Params {
  params: { id: string };
}

// Join a team
export async function POST(request: NextRequest, { params }: Params) {
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

    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        competition: true,
        members: true,
      },
    });

    if (!team) {
      return NextResponse.json(
        createErrorResponse('Team not found'),
        { status: 404 }
      );
    }

    // Check competition status
    if (team.competition.status !== 'upcoming' && team.competition.status !== 'active') {
      return NextResponse.json(
        createErrorResponse('Competition is not accepting new team members'),
        { status: 400 }
      );
    }

    // Check team size
    if (team.members.length >= team.competition.maxTeamSize) {
      return NextResponse.json(
        createErrorResponse('Team is full'),
        { status: 400 }
      );
    }

    // Check if already a member
    const isMember = team.members.some(m => m.userId === user.userId);
    if (isMember) {
      return NextResponse.json(
        createErrorResponse('Already a member of this team'),
        { status: 400 }
      );
    }

    // Check if user is in another team for this competition
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        userId: user.userId,
        team: { competitionId: team.competitionId },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        createErrorResponse('You are already in a team for this competition'),
        { status: 400 }
      );
    }

    // Add member
    await prisma.teamMember.create({
      data: {
        userId: user.userId,
        teamId: params.id,
        role: 'member',
      },
    });

    const updatedTeam = await prisma.team.findUnique({
      where: { id: params.id },
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

    return NextResponse.json(createApiResponse({
      message: 'Successfully joined team',
      team: updatedTeam,
    }));
  } catch (error) {
    console.error('Join team error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
