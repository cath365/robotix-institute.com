import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Get admin dashboard stats
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }
    const denied = await requireRole(user, ['ADMIN']);
    if (denied) return denied;

    // Get counts in parallel
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      totalProducts,
      totalOrders,
      totalCompetitions,
      activeCompetitions,
      recentEnrollments,
      recentOrders,
      popularCourses,
      revenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.competition.count(),
      prisma.competition.count({ where: { status: 'active' } }),
      // Recent enrollments
      prisma.enrollment.findMany({
        take: 5,
        orderBy: { enrolledAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, avatar: true },
          },
          course: {
            select: { title: true, slug: true },
          },
        },
      }),
      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
          items: {
            include: {
              product: {
                select: { name: true },
              },
            },
          },
        },
      }),
      // Popular courses (by enrollment count)
      prisma.course.findMany({
        take: 5,
        include: {
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: {
          enrollments: {
            _count: 'desc',
          },
        },
      }),
      // Total revenue
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'cancelled' } },
      }),
    ]);

    return NextResponse.json(createApiResponse({
      stats: {
        users: {
          total: totalUsers,
          students: totalStudents,
          instructors: totalInstructors,
        },
        courses: {
          total: totalCourses,
          enrollments: totalEnrollments,
        },
        marketplace: {
          products: totalProducts,
          orders: totalOrders,
          revenue: revenue._sum.total || 0,
        },
        competitions: {
          total: totalCompetitions,
          active: activeCompetitions,
        },
      },
      recentEnrollments,
      recentOrders,
      popularCourses: popularCourses.map(c => ({
        ...c,
        enrollmentCount: c._count.enrollments,
      })),
    }));
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
