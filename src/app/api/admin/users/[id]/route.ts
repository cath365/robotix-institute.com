import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

interface Params {
  params: { id: string };
}

const updateUserSchema = z.object({
  role: z.enum(['ADMIN', 'ACCOUNTANT', 'INSTRUCTOR', 'STUDENT', 'GUEST']).optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
});

// Get user details (Admin only)
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }

    const roleCheck = await requireRole(authUser, ['ADMIN']);
    if (roleCheck) return roleCheck;

    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            enrollments: true,
            codeProjects: true,
            robotProjects: true,
            forumPosts: true,
            certificates: true,
            achievements: true,
            orders: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(createErrorResponse('User not found'), { status: 404 });
    }

    return NextResponse.json(createApiResponse(user));
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

// Update user (Admin only)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }

    const roleCheck = await requireRole(authUser, ['ADMIN']);
    if (roleCheck) return roleCheck;

    // Prevent admin from deactivating themselves
    if (params.id === authUser.userId) {
      const body = await request.json();
      if (body.isActive === false) {
        return NextResponse.json(
          createErrorResponse('Cannot deactivate your own account'),
          { status: 400 }
        );
      }
    }

    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const { role, isActive, emailVerified } = validation.data;
    const updateData: Record<string, unknown> = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
      },
    });

    return NextResponse.json(createApiResponse(updated));
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

// Delete user (Admin only)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }

    const roleCheck = await requireRole(authUser, ['ADMIN']);
    if (roleCheck) return roleCheck;

    // Prevent admin from deleting themselves
    if (params.id === authUser.userId) {
      return NextResponse.json(
        createErrorResponse('Cannot delete your own account'),
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json(createErrorResponse('User not found'), { status: 404 });
    }

    // Soft delete - just deactivate
    await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json(createApiResponse({ message: 'User deactivated successfully' }));
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
