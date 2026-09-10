import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const quizAttemptSchema = z.object({
  quizId: z.string().min(1, 'Quiz ID is required'),
  answers: z.array(z.number().int().min(0)).min(1, 'Answers are required'),
});

// Get quiz by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');
    const lessonId = searchParams.get('lessonId');

    if (!quizId && !lessonId) {
      return NextResponse.json(
        createErrorResponse('Quiz ID or Lesson ID is required'),
        { status: 400 }
      );
    }

    const where = quizId ? { id: quizId } : { lessonId: lessonId! };

    const quiz = await prisma.quiz.findFirst({
      where,
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            options: true,
            points: true,
            order: true,
            // Don't include correctAnswer - that would let students cheat!
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        createErrorResponse('Quiz not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(createApiResponse(quiz));
  } catch (error) {
    console.error('Get quiz error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Submit quiz attempt
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
    if (!rateLimiter(ip, 30, 60000)) {
      return NextResponse.json(
        createErrorResponse('Too many requests'),
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = quizAttemptSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const { quizId, answers } = validation.data;

    // Get quiz with correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            correctAnswer: true,
            points: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        createErrorResponse('Quiz not found'),
        { status: 404 }
      );
    }

    if (answers.length !== quiz.questions.length) {
      return NextResponse.json(
        createErrorResponse(`Expected ${quiz.questions.length} answers, got ${answers.length}`),
        { status: 400 }
      );
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    const results = quiz.questions.map((q, i) => {
      totalPoints += q.points;
      const isCorrect = answers[i] === q.correctAnswer;
      if (isCorrect) earnedPoints += q.points;
      return {
        questionId: q.id,
        userAnswer: answers[i],
        correctAnswer: q.correctAnswer,
        isCorrect,
        points: isCorrect ? q.points : 0,
      };
    });

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= 70; // 70% pass threshold

    // Save attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.userId,
        quizId,
        score,
        answers: JSON.stringify(answers),
        passed,
      },
    });

    return NextResponse.json(
      createApiResponse({
        attemptId: attempt.id,
        score,
        passed,
        earnedPoints,
        totalPoints,
        results,
      }, passed ? 'Quiz passed!' : 'Quiz completed. Try again to improve your score.')
    );
  } catch (error) {
    console.error('Submit quiz error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
