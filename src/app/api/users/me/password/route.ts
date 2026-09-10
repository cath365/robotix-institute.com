import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, verifyPassword, hashPassword } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Change password
export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter(ip, 5, 60000)) {
      return NextResponse.json(createErrorResponse('Too many attempts. Please wait.'), { status: 429 });
    }

    const body = await request.json();
    const validation = passwordChangeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json(createErrorResponse('User not found'), { status: 404 });
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(createErrorResponse('Current password is incorrect'), { status: 400 });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: authUser.userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json(createApiResponse({ message: 'Password changed successfully' }));
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
