import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, getPaginationParams, createPaginatedResponse, rateLimiter, sanitizeInput } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const commentSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content is too long'),
  parentId: z.string().optional(), // For reply threads
});

// Get comments for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        createErrorResponse('Post ID is required'),
        { status: 400 }
      );
    }

    const [comments, total] = await Promise.all([
      prisma.forumComment.findMany({
        where: { postId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true,
            },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'asc' },
      }),
      prisma.forumComment.count({ where: { postId } }),
    ]);

    return NextResponse.json(createPaginatedResponse(comments, total, pagination));
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Create a comment
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
    const validation = commentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const { postId, content } = validation.data;

    // Check post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        createErrorResponse('Post not found'),
        { status: 404 }
      );
    }

    const comment = await prisma.forumComment.create({
      data: {
        postId,
        userId: user.userId,
        content: sanitizeInput(content),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      createApiResponse(comment, 'Comment posted successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
