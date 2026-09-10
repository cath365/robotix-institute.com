import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

interface Params {
  params: { id: string };
}

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(5).optional(),
  type: z.enum(['project', 'certificate', 'achievement', 'code']).optional(),
  imageUrl: z.string().url().optional().nullable(),
  linkUrl: z.string().url().optional().nullable(),
});

// Update portfolio item
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const item = await prisma.portfolioItem.findUnique({
      where: { id: params.id },
      include: { portfolio: true },
    });

    if (!item) {
      return NextResponse.json(
        createErrorResponse('Item not found'),
        { status: 404 }
      );
    }

    if (item.portfolio.userId !== user.userId) {
      return NextResponse.json(
        createErrorResponse('Forbidden'),
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const updated = await prisma.portfolioItem.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json(createApiResponse(updated));
  } catch (error) {
    console.error('Update portfolio item error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Delete portfolio item
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const item = await prisma.portfolioItem.findUnique({
      where: { id: params.id },
      include: { portfolio: true },
    });

    if (!item) {
      return NextResponse.json(
        createErrorResponse('Item not found'),
        { status: 404 }
      );
    }

    if (item.portfolio.userId !== user.userId) {
      return NextResponse.json(
        createErrorResponse('Forbidden'),
        { status: 403 }
      );
    }

    await prisma.portfolioItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json(createApiResponse({ message: 'Item deleted successfully' }));
  } catch (error) {
    console.error('Delete portfolio item error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
