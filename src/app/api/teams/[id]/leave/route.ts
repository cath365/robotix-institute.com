import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

interface Params {
  params: { id: string };
}

// Leave a team
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        members: true,
        competition: true,
      },
    });

    if (!team) {
      return NextResponse.json(
        createErrorResponse('Team not found'),
        { status: 404 }
      );
    }

    // Find user's membership
    const membership = team.members.find(m => m.userId === user.userId);
    if (!membership) {
      return NextResponse.json(
        createErrorResponse('You are not a member of this team'),
        { status: 400 }
      );
    }

    // Leader can't leave - must delete team instead
    if (membership.role === 'leader') {
      return NextResponse.json(
        createErrorResponse('Team leader cannot leave. Transfer leadership or delete the team.'),
        { status: 400 }
      );
    }

    // Remove member
    await prisma.teamMember.delete({
      where: { id: membership.id },
    });

    return NextResponse.json(createApiResponse({
      message: 'Successfully left team',
    }));
  } catch (error) {
    console.error('Leave team error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
