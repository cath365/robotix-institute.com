import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, createErrorResponse, getPaginationParams, createPaginatedResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Get forum categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);

    const [categories, total] = await Promise.all([
      prisma.forumCategory.findMany({
        include: {
          _count: {
            select: { posts: true },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { name: 'asc' },
      }),
      prisma.forumCategory.count(),
    ]);

    const categoriesWithCounts = categories.map(cat => ({
      ...cat,
      postCount: cat._count.posts,
    }));

    return NextResponse.json(createPaginatedResponse(categoriesWithCounts, total, pagination));
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
