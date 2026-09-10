import { NextResponse } from 'next/server';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

    if (!query || query.length < 2) {
      return NextResponse.json(createApiResponse({ results: [] }));
    }

    const searchFilter = { contains: query, mode: 'insensitive' as const };

    // Search across all content types in parallel
    const [courses, projects, blogPosts, forumPosts, paths] = await Promise.all([
      prisma.course.findMany({
        where: {
          published: true,
          OR: [{ title: searchFilter }, { description: searchFilter }],
        },
        select: { id: true, title: true, description: true, slug: true, thumbnail: true },
        take: limit,
      }),
      prisma.robotProject.findMany({
        where: {
          isPublished: true,
          OR: [{ title: searchFilter }, { description: searchFilter }],
        },
        select: { id: true, title: true, description: true, slug: true, thumbnail: true },
        take: limit,
      }),
      prisma.blogPost.findMany({
        where: {
          published: true,
          OR: [{ title: searchFilter }, { excerpt: searchFilter }],
        },
        select: { id: true, title: true, excerpt: true, slug: true, thumbnail: true },
        take: limit,
      }),
      prisma.forumPost.findMany({
        where: {
          OR: [{ title: searchFilter }, { content: searchFilter }],
        },
        select: { id: true, title: true, content: true },
        take: limit,
      }),
      prisma.learningPath.findMany({
        where: {
          published: true,
          OR: [{ title: searchFilter }, { description: searchFilter }],
        },
        select: { id: true, title: true, description: true, slug: true, thumbnail: true },
        take: limit,
      }),
    ]);

    // Normalize results into a unified format
    const results: any[] = [
      ...courses.map((c: any) => ({
        type: 'course' as const,
        id: c.id,
        title: c.title,
        description: c.description.substring(0, 120),
        url: `/courses/${c.slug}`,
        thumbnail: c.thumbnail,
      })),
      ...paths.map((p: any) => ({
        type: 'path' as const,
        id: p.id,
        title: p.title,
        description: p.description.substring(0, 120),
        url: `/paths/${p.slug}`,
        thumbnail: p.thumbnail,
      })),
      ...blogPosts.map((b: any) => ({
        type: 'blog' as const,
        id: b.id,
        title: b.title,
        description: b.excerpt.substring(0, 120),
        url: `/blog/${b.slug}`,
        thumbnail: b.thumbnail,
      })),
      ...projects.map((p: any) => ({
        type: 'project' as const,
        id: p.id,
        title: p.title,
        description: p.description.substring(0, 120),
        url: `/projects/${p.slug}`,
        thumbnail: p.thumbnail,
      })),
      ...forumPosts.map((f: any) => ({
        type: 'forum' as const,
        id: f.id,
        title: f.title,
        description: f.content.substring(0, 120),
        url: `/community?post=${f.id}`,
      })),
    ].slice(0, limit);

    return NextResponse.json(createApiResponse({ results, query }));
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
