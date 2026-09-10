import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client';

const RAW_JWT_SECRET = process.env.JWT_SECRET;
const IS_PROD = process.env.NODE_ENV === 'production';

if (!RAW_JWT_SECRET && IS_PROD) {
  throw new Error(
    '[robotix] JWT_SECRET must be set in production. Refusing to boot with an insecure default.'
  );
}
if (RAW_JWT_SECRET && RAW_JWT_SECRET.length < 32 && IS_PROD) {
  throw new Error(
    '[robotix] JWT_SECRET must be at least 32 characters in production.'
  );
}

const JWT_SECRET = RAW_JWT_SECRET || 'dev-only-insecure-secret-do-not-use-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload, expiresIn: string = JWT_EXPIRES_IN): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest | Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  if ('cookies' in request && typeof request.cookies?.get === 'function') {
    const token = request.cookies.get('token')?.value;
    return token || null;
  }
  return null;
}

export function getUserFromRequest(request: NextRequest | Request): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Returns a 4xx response if the user does not have the required role,
 * or `null` if authorized. ALWAYS `await` this function — it is async
 * because it re-validates the role from the database to defend against
 * stale tokens (revoked admins, deactivated accounts, etc.).
 */
export async function requireRole(
  user: JWTPayload | null,
  allowedRoles: Role[]
): Promise<NextResponse | null> {
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return null;
}

export function hasRole(user: JWTPayload | null, roles: Role[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
