import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

interface Params {
  params: { id: string };
}

// Get team by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        competition: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            maxTeamSize: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                bio: true,
              },
            },
          },
        },
        submissions: {
          orderBy: { submittedAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            videoUrl: true,
            repoUrl: true,
            status: true,
            score: true,
            feedback: true,
            submittedAt: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        createErrorResponse('Team not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(createApiResponse(team));
  } catch (error) {
    console.error('Get team error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Join a team
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        competition: {
          select: { maxTeamSize: true, status: true },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        createErrorResponse('Team not found'),
        { status: 404 }
      );
    }

    if (team.competition.status !== 'upcoming' && team.competition.status !== 'active') {
      return NextResponse.json(
        createErrorResponse('Competition is not accepting new members'),
        { status: 400 }
      );
    }

    if (team._count.members >= team.competition.maxTeamSize) {
      return NextResponse.json(
        createErrorResponse('Team is full'),
        { status: 400 }
      );
    }

    // Check if user is already in this team or another team for this competition
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        userId: user.userId,
        team: { competitionId: team.competitionId },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        createErrorResponse('You are already in a team for this competition'),
        { status: 409 }
      );
    }

    // Add user to team
    await prisma.teamMember.create({
      data: {
        userId: user.userId,
        teamId: id,
        role: 'member',
      },
    });

    const updatedTeam = await prisma.team.findUnique({
      where: { id },
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
      createApiResponse(updatedTeam, 'Successfully joined the team')
    );
  } catch (error) {
    console.error('Join team error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Leave team
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const membership = await prisma.teamMember.findFirst({
      where: {
        userId: user.userId,
        teamId: id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        createErrorResponse('You are not a member of this team'),
        { status: 404 }
      );
    }

    // If leader leaves, delete the entire team
    if (membership.role === 'leader') {
      await prisma.team.delete({ where: { id } });
      return NextResponse.json(
        createApiResponse(null, 'Team disbanded')
      );
    }

    // Otherwise just remove the member
    await prisma.teamMember.delete({ where: { id: membership.id } });

    return NextResponse.json(
      createApiResponse(null, 'Successfully left the team')
    );
  } catch (error) {
    console.error('Leave team error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
