import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { codeProjectSchema } from '@/lib/validations';
import { createApiResponse, createErrorResponse, getPaginationParams, createPaginatedResponse, validateInput, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

// Get code projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    const language = searchParams.get('language');
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('public');

    const user = getUserFromRequest(request);

    const where: Record<string, unknown> = {};
    
    if (language) where.language = language;
    
    // If requesting specific user's projects
    if (userId) {
      where.userId = userId;
      // Only show public unless it's the user's own projects
      if (user?.userId !== userId) {
        where.isPublic = true;
      }
    } else if (isPublic === 'true') {
      where.isPublic = true;
    } else if (user) {
      // Show user's own projects + public projects
      where.OR = [
        { userId: user.userId },
        { isPublic: true },
      ];
    } else {
      where.isPublic = true;
    }

    const [projects, total] = await Promise.all([
      prisma.codeProject.findMany({
        where,
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
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.codeProject.count({ where }),
    ]);

    return NextResponse.json(createPaginatedResponse(projects, total, pagination));
  } catch (error) {
    console.error('Get code projects error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Create a new code project
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
    if (!rateLimiter(ip, 30, 60000)) {
      return NextResponse.json(
        createErrorResponse('Too many requests'),
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = validateInput(codeProjectSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.errors),
        { status: 400 }
      );
    }

    const project = await prisma.codeProject.create({
      data: {
        ...validation.data!,
        userId: user.userId,
      },
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
    });

    return NextResponse.json(
      createApiResponse(project, 'Project created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create code project error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
