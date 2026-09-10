import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const portfolioItemSchema = z.object({
  portfolioId: z.string().min(1, 'Portfolio ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['project', 'certificate', 'achievement', 'code']),
  imageUrl: z.string().url().optional().or(z.literal('')),
  linkUrl: z.string().url().optional().or(z.literal('')),
});

// Add item to portfolio
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
    const validation = portfolioItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    // Verify portfolio ownership
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: validation.data.portfolioId },
      select: { userId: true },
    });

    if (!portfolio || portfolio.userId !== user.userId) {
      return NextResponse.json(
        createErrorResponse('Portfolio not found or unauthorized'),
        { status: 403 }
      );
    }

    const item = await prisma.portfolioItem.create({
      data: {
        portfolioId: validation.data.portfolioId,
        title: validation.data.title,
        description: validation.data.description,
        type: validation.data.type,
        imageUrl: validation.data.imageUrl || null,
        linkUrl: validation.data.linkUrl || null,
      },
    });

    return NextResponse.json(
      createApiResponse(item, 'Item added to portfolio'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Add portfolio item error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
