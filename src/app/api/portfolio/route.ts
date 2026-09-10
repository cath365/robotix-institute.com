import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const portfolioSchema = z.object({
  headline: z.string().max(100).optional(),
  about: z.string().max(2000).optional(),
  skills: z.array(z.string()).optional(),
  website: z.string().url().optional().or(z.literal('')),
  isPublic: z.boolean().optional(),
});

const portfolioItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['project', 'certificate', 'achievement', 'code']),
  imageUrl: z.string().url().optional(),
  linkUrl: z.string().url().optional(),
});

// Get portfolio by user ID or username
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const currentUser = getUserFromRequest(request);
    const targetUserId = userId || currentUser?.userId;

    if (!targetUserId) {
      return NextResponse.json(
        createErrorResponse('User ID is required'),
        { status: 400 }
      );
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: targetUserId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
            githubUrl: true,
            linkedinUrl: true,
          },
        },
        items: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!portfolio) {
      // If user is viewing their own non-existent portfolio, return empty structure
      if (currentUser?.userId === targetUserId) {
        return NextResponse.json(createApiResponse({
          portfolio: null,
          canCreate: true,
        }));
      }
      return NextResponse.json(
        createErrorResponse('Portfolio not found'),
        { status: 404 }
      );
    }

    // Check visibility
    if (!portfolio.isPublic && currentUser?.userId !== targetUserId) {
      return NextResponse.json(
        createErrorResponse('This portfolio is private'),
        { status: 403 }
      );
    }

    // Get additional stats
    const stats = await prisma.$transaction([
      prisma.certificate.count({ where: { userId: targetUserId } }),
      prisma.codeProject.count({ where: { userId: targetUserId, isPublic: true } }),
      prisma.robotProject.count({ where: { userId: targetUserId, isPublished: true } }),
      prisma.userAchievement.count({ where: { userId: targetUserId } }),
    ]);

    return NextResponse.json(createApiResponse({
      ...portfolio,
      stats: {
        certificates: stats[0],
        codeProjects: stats[1],
        robotProjects: stats[2],
        achievements: stats[3],
      },
    }));
  } catch (error) {
    console.error('Get portfolio error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Create or update portfolio
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
    if (!rateLimiter(ip, 20, 60000)) {
      return NextResponse.json(
        createErrorResponse('Too many requests'),
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = portfolioSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const portfolio = await prisma.portfolio.upsert({
      where: { userId: user.userId },
      update: validation.data,
      create: {
        userId: user.userId,
        ...validation.data,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(
      createApiResponse(portfolio, 'Portfolio updated successfully')
    );
  } catch (error) {
    console.error('Update portfolio error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
