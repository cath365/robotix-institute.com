import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
    }

    const userId = user.userId;

    // Gather all analytics data in parallel
    const [
      enrollments,
      completedCourses,
      codeProjects,
      gameScores,
      achievements,
      quizAttempts,
      forumPosts,
      pathEnrollments,
      certificates,
      recentLessons,
    ] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId },
        include: { course: { select: { title: true, category: true, duration: true } } },
      }),
      prisma.enrollment.count({ where: { userId, completed: true } }),
      prisma.codeProject.count({ where: { userId } }),
      prisma.gameScore.findMany({
        where: { userId },
        include: { game: { select: { name: true, type: true } } },
        orderBy: { score: 'desc' },
        take: 10,
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { earnedAt: 'desc' },
      }),
      prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.forumPost.count({ where: { userId } }),
      prisma.pathEnrollment.findMany({
        where: { userId },
        include: { learningPath: { select: { title: true, slug: true }, } },
      }),
      prisma.certificate.findMany({
        where: { userId },
        orderBy: { issueDate: 'desc' },
      }),
      prisma.lessonProgress.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 10,
        include: { lesson: { select: { title: true, duration: true } } },
      }),
    ]);

    // Calculate stats
    const totalEnrolled = enrollments.length;
    const totalWatchTime = recentLessons.reduce((sum: number, lp: any) => sum + (lp.watchTime || 0), 0);
    const completedLessons = recentLessons.filter((lp: any) => lp.completed).length;
    const avgQuizScore = quizAttempts.length > 0
      ? quizAttempts.reduce((sum: number, q: any) => sum + q.score, 0) / quizAttempts.length
      : 0;
    const totalPoints = achievements.reduce((sum: number, a: any) => sum + a.achievement.points, 0);
    const topGameScore = gameScores.length > 0 ? gameScores[0].score : 0;

    // Category distribution for courses
    const categoryMap: Record<string, number> = {};
    enrollments.forEach((e: any) => {
      const cat = e.course.category;
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const coursesByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Weekly activity (last 4 weeks)
    const now = new Date();
    const weeklyActivity = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      const weekLabel = `Week ${4 - i}`;
      const lessonsCompleted = recentLessons.filter((lp: any) =>
        lp.completedAt && new Date(lp.completedAt) >= weekStart && new Date(lp.completedAt) < weekEnd
      ).length;
      return { week: weekLabel, lessons: lessonsCompleted };
    });

    // Skills radar based on categories
    const skills = [
      { skill: 'Robotics', level: categoryMap['Robotics Fundamentals'] ? Math.min(100, (categoryMap['Robotics Fundamentals'] || 0) * 25) : 10 },
      { skill: 'Programming', level: Math.min(100, codeProjects * 15) || 10 },
      { skill: 'IoT', level: categoryMap['ESP32 IoT Systems'] ? Math.min(100, (categoryMap['ESP32 IoT Systems'] || 0) * 25) : 10 },
      { skill: 'AI/ML', level: categoryMap['AI Robotics'] ? Math.min(100, (categoryMap['AI Robotics'] || 0) * 25) : 10 },
      { skill: 'Electronics', level: categoryMap['Electronics'] ? Math.min(100, (categoryMap['Electronics'] || 0) * 25) : 10 },
      { skill: 'Community', level: Math.min(100, forumPosts * 10) || 10 },
    ];

    return NextResponse.json(
      createApiResponse({
        overview: {
          totalEnrolled,
          completedCourses,
          codeProjects,
          totalPoints,
          avgQuizScore: Math.round(avgQuizScore * 10) / 10,
          totalWatchTime,
          forumPosts,
          certificates: certificates.length,
          topGameScore,
          achievementCount: achievements.length,
        },
        enrollments,
        pathEnrollments,
        achievements: achievements.map((a: any) => a.achievement),
        gameScores,
        certificates,
        coursesByCategory,
        weeklyActivity,
        skills,
      })
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
