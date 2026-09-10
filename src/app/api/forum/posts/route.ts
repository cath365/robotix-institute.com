import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, validateInput } from '@/lib/api-utils';
import { forumPostSchema } from '@/lib/validations';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          category: { select: { id: true, name: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.forumPost.count({ where }),
    ]);

    return NextResponse.json(
      createApiResponse({
        posts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error('Forum posts error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(forumPostSchema, body);
    if (!validation.success) {
      return NextResponse.json(createErrorResponse('Validation failed', validation.errors), { status: 400 });
    }

    const { title, content, categoryId } = validation.data!;

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        categoryId,
        userId: authUser.userId,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(createApiResponse(post, 'Post created'), { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
