import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hashPassword } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter, validateInput } from '@/lib/api-utils';
import { profileSchema } from '@/lib/validations';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        bio: true,
        githubUrl: true,
        linkedinUrl: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            codeProjects: true,
            robotProjects: true,
            forumPosts: true,
            certificates: true,
            achievements: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(createErrorResponse('User not found'), { status: 404 });
    }

    return NextResponse.json(createApiResponse(user));
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

// Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter(ip, 20, 60000)) {
      return NextResponse.json(createErrorResponse('Too many requests'), { status: 429 });
    }

    const body = await request.json();
    const validation = validateInput(profileSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.errors),
        { status: 400 }
      );
    }

    const { firstName, lastName, bio, githubUrl, linkedinUrl } = validation.data!;

    const updateData: Record<string, unknown> = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl || null;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl || null;

    const updated = await prisma.user.update({
      where: { id: authUser.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        bio: true,
        githubUrl: true,
        linkedinUrl: true,
      },
    });

    return NextResponse.json(createApiResponse(updated));
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
