import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

interface Params {
  params: { slug: string };
}

// Get robot project by slug
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = params;

    const project = await prisma.robotProject.findUnique({
      where: { slug },
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
    });

    if (!project) {
      return NextResponse.json(
        createErrorResponse('Project not found'),
        { status: 404 }
      );
    }

    // Increment views
    await prisma.robotProject.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(
      createApiResponse({
        ...project,
        components: JSON.parse(project.components),
      })
    );
  } catch (error) {
    console.error('Get robot project error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Like a project
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { slug } = params;
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const project = await prisma.robotProject.update({
      where: { slug },
      data: { likes: { increment: 1 } },
      select: { likes: true },
    });

    return NextResponse.json(
      createApiResponse({ likes: project.likes }, 'Project liked')
    );
  } catch (error) {
    console.error('Like project error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
