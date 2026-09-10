import { NextResponse } from 'next/server';
import { verifyPassword, generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { createApiResponse, createErrorResponse, validateInput, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Rate limiting - stricter for login
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter(ip, 10, 60000)) {
      return NextResponse.json(
        createErrorResponse('Too many login attempts. Please try again later.'),
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = validateInput(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.errors),
        { status: 400 }
      );
    }

    const { email, password } = validation.data!;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        createErrorResponse('Invalid email or password'),
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        createErrorResponse('Your account has been deactivated. Please contact support.'),
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        createErrorResponse('Invalid email or password'),
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json(
      createApiResponse({ user: userWithoutPassword, token }, 'Login successful'),
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
