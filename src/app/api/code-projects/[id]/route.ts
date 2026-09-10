import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

interface Params {
  params: { id: string };
}

// Get code project by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const user = getUserFromRequest(request);

    const project = await prisma.codeProject.findUnique({
      where: { id },
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

    if (!project) {
      return NextResponse.json(
        createErrorResponse('Project not found'),
        { status: 404 }
      );
    }

    // Check if user can access this project
    if (!project.isPublic && project.userId !== user?.userId) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 403 }
      );
    }

    return NextResponse.json(createApiResponse(project));
  } catch (error) {
    console.error('Get code project error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Update code project
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const existing = await prisma.codeProject.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        createErrorResponse('Project not found'),
        { status: 404 }
      );
    }

    if (existing.userId !== user.userId) {
      return NextResponse.json(
        createErrorResponse('You can only edit your own projects'),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, code, language, isPublic } = body;

    const project = await prisma.codeProject.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(code && { code }),
        ...(language && { language }),
        ...(typeof isPublic === 'boolean' && { isPublic }),
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
      createApiResponse(project, 'Project updated successfully')
    );
  } catch (error) {
    console.error('Update code project error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Delete code project
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

    const existing = await prisma.codeProject.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        createErrorResponse('Project not found'),
        { status: 404 }
      );
    }

    if (existing.userId !== user.userId) {
      return NextResponse.json(
        createErrorResponse('You can only delete your own projects'),
        { status: 403 }
      );
    }

    await prisma.codeProject.delete({ where: { id } });

    return NextResponse.json(
      createApiResponse(null, 'Project deleted successfully')
    );
  } catch (error) {
    console.error('Delete code project error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
