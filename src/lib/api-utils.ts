import { NextRequest, NextResponse } from 'next/server';
import { z, ZodSchema } from 'zod';

// ─── Response Helpers ───────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export function createApiResponse<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message };
}

export function createErrorResponse(message: string, errors?: string[]): ApiResponse {
  return { success: false, message, errors };
}

export function apiResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message, success: false }, { status });
}

// ─── Rate Limiting ──────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(
  ip: string,
  limit: number = 60,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// Alias for backward compatibility
export const rateLimit = rateLimiter;

export function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         request.headers.get('x-real-ip') || 
         '127.0.0.1';
}

// ─── Validation ─────────────────────────────────────────────

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export function validateInput<T>(schema: ZodSchema<T>, body: unknown): ValidationResult<T> {
  try {
    const data = schema.parse(body);
    return { success: true, data };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, errors: err.errors.map(e => e.message) };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

// Alias for backward compatibility
export const validateBody = validateInput;

// ─── Security ───────────────────────────────────────────────

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// ─── Pagination ─────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
) {
  return {
    success: true,
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
      hasMore: params.page * params.limit < total,
    },
  };
}
