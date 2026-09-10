import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true, bio: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        },
        _count: { select: { comments: true } },
      },
    });

    if (!post || !post.published) {
      return NextResponse.json(createErrorResponse('Blog post not found'), { status: 404 });
    }

    // Increment views
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(createApiResponse(post));
  } catch (error) {
    console.error('Blog post detail error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
