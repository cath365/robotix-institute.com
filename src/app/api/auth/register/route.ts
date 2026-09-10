import { NextResponse } from 'next/server';
import { hashPassword, generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { createApiResponse, createErrorResponse, validateInput, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter(ip, 5, 60000)) {
      return NextResponse.json(
        createErrorResponse('Too many requests. Please try again later.'),
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = validateInput(registerSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.errors),
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, role } = validation.data!;

    // Check existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        createErrorResponse('An account with this email already exists'),
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return NextResponse.json(
      createApiResponse({ user, token }, 'Registration successful'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
