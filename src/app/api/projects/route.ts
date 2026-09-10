import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { createApiResponse, createErrorResponse, getPaginationParams, createPaginatedResponse, rateLimiter, sanitizeInput } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

const robotProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  components: z.array(z.string()).min(1, 'At least one component is required'),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  circuitUrl: z.string().url().optional(),
  sourceCode: z.string().optional(),
  tutorialMd: z.string().optional(),
  videoUrl: z.string().url().optional(),
  thumbnail: z.string().url().optional(),
  isPublished: z.boolean().optional().default(false),
});

// Get robot projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    const where: Record<string, unknown> = { isPublished: true };
    
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (featured === 'true') {
      where.likes = { gte: 10 }; // Featured = 10+ likes
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.robotProject.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.robotProject.count({ where }),
    ]);

    // Parse components JSON
    const projectsWithParsedData = projects.map(p => ({
      ...p,
      components: JSON.parse(p.components),
    }));

    return NextResponse.json(createPaginatedResponse(projectsWithParsedData, total, pagination));
  } catch (error) {
    console.error('Get robot projects error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Create a new robot project
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
    if (!rateLimiter(ip, 10, 60000)) {
      return NextResponse.json(
        createErrorResponse('Too many requests'),
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = robotProjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const { title, components, ...rest } = validation.data;
    const baseSlug = slugify(title);
    
    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.robotProject.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const project = await prisma.robotProject.create({
      data: {
        title: sanitizeInput(title),
        slug,
        components: JSON.stringify(components),
        ...rest,
        userId: user.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(
      createApiResponse({
        ...project,
        components: JSON.parse(project.components),
      }, 'Project created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create robot project error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
