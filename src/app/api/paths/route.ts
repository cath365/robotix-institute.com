import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, validateInput } from '@/lib/api-utils';
import { learningPathSchema } from '@/lib/validations';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const where: any = { published: true };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [paths, total] = await Promise.all([
      prisma.learningPath.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        include: {
          _count: { select: { enrollments: true, steps: true } },
        },
      }),
      prisma.learningPath.count({ where }),
    ]);

    return NextResponse.json(
      createApiResponse({
        paths,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error('Learning paths error:', error);
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
    const validation = validateInput(learningPathSchema, body);
    if (!validation.success) {
      return NextResponse.json(createErrorResponse('Validation failed', validation.errors), { status: 400 });
    }

    const { title, description, category, difficulty, thumbnail, duration } = validation.data!;
    const slug = slugify(title);

    const existing = await prisma.learningPath.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(createErrorResponse('A learning path with this title already exists'), { status: 409 });
    }

    const path = await prisma.learningPath.create({
      data: { title, slug, description, category, difficulty, thumbnail: thumbnail || null, duration },
      include: { _count: { select: { steps: true, enrollments: true } } },
    });

    return NextResponse.json(createApiResponse(path, 'Learning path created'), { status: 201 });
  } catch (error) {
    console.error('Create path error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
