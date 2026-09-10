import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, validateInput } from '@/lib/api-utils';
import { blogPostSchema } from '@/lib/validations';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const where: any = { published: true };
    if (category) where.category = category;
    if (tag) where.tags = { has: tag };
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json(
      createApiResponse({
        posts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error('Blog posts error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !['ADMIN', 'INSTRUCTOR'].includes(user.role)) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 403 });
    }

    const body = await request.json();
    const validation = validateInput(blogPostSchema, body);
    if (!validation.success) {
      return NextResponse.json(createErrorResponse('Validation failed', validation.errors), { status: 400 });
    }

    const { title, excerpt, content, category, tags, thumbnail, published } = validation.data!;
    const slug = slugify(title);

    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(createErrorResponse('A blog post with this title already exists'), { status: 409 });
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        category,
        tags,
        thumbnail: thumbnail || null,
        published,
        authorId: user.userId,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    return NextResponse.json(createApiResponse(post, 'Blog post created'), { status: 201 });
  } catch (error) {
    console.error('Create blog post error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
