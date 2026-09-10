import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const jwtUser = getUserFromRequest(request);
    if (!jwtUser) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const user = {
      id: jwtUser.userId,
      email: jwtUser.email,
      firstName: jwtUser.firstName,
      lastName: jwtUser.lastName,
      role: jwtUser.role,
      avatar: null,
      bio: null,
      githubUrl: null,
      linkedinUrl: null,
      points: 0,
      isActive: true,
      emailVerified: true,
      createdAt: null,
      _count: {
        enrollments: 0,
        codeProjects: 0,
        robotProjects: 0,
        forumPosts: 0,
        certificates: 0,
        achievements: 0,
      },
    };

    return NextResponse.json(createApiResponse(user));
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
