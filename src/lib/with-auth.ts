import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { getUserFromRequest, requireRole, type JWTPayload } from './auth';

type RouteContext = { params?: Record<string, string | string[]> };

type AuthedHandler<TCtx extends RouteContext = RouteContext> = (
  req: NextRequest,
  ctx: TCtx & { user: JWTPayload }
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps a route handler with authentication and (optional) role gating.
 * This eliminates the foot-gun where developers forget to `await requireRole(...)`
 * and accidentally bypass authorization (because a Promise is always truthy).
 */
export function withAuth<TCtx extends RouteContext = RouteContext>(
  roles: Role[] | null,
  handler: AuthedHandler<TCtx>
) {
  return async (req: NextRequest, ctx: TCtx) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (roles && roles.length > 0) {
      const denied = await requireRole(user, roles);
      if (denied) return denied;
    }

    return handler(req, { ...ctx, user });
  };
}
