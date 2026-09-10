import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, validateInput } from '@/lib/api-utils';
import { blogCommentSchema } from '@/lib/validations';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }

    const body = await request.json();
    const validation = validateInput(blogCommentSchema, body);
    if (!validation.success) {
      return NextResponse.json(createErrorResponse('Validation failed', validation.errors), { status: 400 });
    }

    const { content, postId } = validation.data!;

    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json(createErrorResponse('Blog post not found'), { status: 404 });
    }

    const comment = await prisma.blogComment.create({
      data: {
        content,
        postId,
        userId: user.userId,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    // Notify post author
    if (post.authorId !== user.userId) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: 'forum',
          title: 'New Comment on Your Post',
          message: `${user.firstName} ${user.lastName} commented on "${post.title}"`,
          link: `/blog/${post.slug}`,
        },
      });
    }

    return NextResponse.json(createApiResponse(comment, 'Comment added'), { status: 201 });
  } catch (error) {
    console.error('Blog comment error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
