import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { competitionSubmissionSchema } from '@/lib/validations';
import { createApiResponse, createErrorResponse, getPaginationParams, createPaginatedResponse, validateInput, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

// Get submissions for a competition
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    const competitionId = searchParams.get('competitionId');
    const teamId = searchParams.get('teamId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (competitionId) where.competitionId = competitionId;
    if (teamId) where.teamId = teamId;
    if (status) where.status = status;

    const [submissions, total] = await Promise.all([
      prisma.competitionSubmission.findMany({
        where,
        include: {
          team: {
            select: {
              id: true,
              name: true,
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
          },
          competition: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.competitionSubmission.count({ where }),
    ]);

    return NextResponse.json(createPaginatedResponse(submissions, total, pagination));
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Submit to a competition
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
    const { competitionId, ...submissionData } = body;

    const validation = validateInput(competitionSubmissionSchema, submissionData);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.errors),
        { status: 400 }
      );
    }

    // Check competition exists and is active
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: { id: true, status: true },
    });

    if (!competition) {
      return NextResponse.json(
        createErrorResponse('Competition not found'),
        { status: 404 }
      );
    }

    if (competition.status !== 'active') {
      return NextResponse.json(
        createErrorResponse('Competition is not accepting submissions'),
        { status: 400 }
      );
    }

    // Find user's team in this competition
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: user.userId,
        team: { competitionId },
      },
      include: {
        team: true,
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        createErrorResponse('You must be part of a team to submit'),
        { status: 400 }
      );
    }

    // Check if team already has a submission
    const existingSubmission = await prisma.competitionSubmission.findFirst({
      where: {
        teamId: teamMember.teamId,
        competitionId,
      },
    });

    let submission;
    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.competitionSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          ...validation.data,
          status: 'submitted',
        },
        include: {
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } else {
      // Create new submission
      submission = await prisma.competitionSubmission.create({
        data: {
          ...validation.data!,
          teamId: teamMember.teamId,
          competitionId,
        },
        include: {
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    return NextResponse.json(
      createApiResponse(submission, existingSubmission ? 'Submission updated' : 'Submission created'),
      { status: existingSubmission ? 200 : 201 }
    );
  } catch (error) {
    console.error('Submit to competition error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
