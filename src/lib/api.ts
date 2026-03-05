import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const ok = (data: unknown, status = 200) =>
    NextResponse.json({ success: true, data }, { status });

export const err = (message: string, status = 400) =>
    NextResponse.json({ success: false, message }, { status });

export const paginate = <T>(
    items: T[],
    page: number,
    limit: number
): { items: T[]; total: number; page: number; totalPages: number } => {
    const start = (page - 1) * limit;
    return {
        items: items.slice(start, start + limit),
        total: items.length,
        page,
        totalPages: Math.ceil(items.length / limit),
    };
};

export type AuthedRequest = NextRequest & { user: { id: string; email: string; role: string } };

export const withAuth = (
    handler: (req: AuthedRequest, context?: any) => Promise<NextResponse>,
    ...roles: string[]
) => {
    return async (req: NextRequest, context?: any): Promise<NextResponse> => {
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) return err("Access token required", 401);

        const token = authHeader.slice(7);
        const payload = verifyToken(token);
        if (!payload) return err("Invalid or expired token", 401);

        const user = await prisma.user.findUnique({ where: { id: payload.id as string } });
        if (!user || (!user.isActive && user.role !== 'SUPERADMIN')) return err("User not found or deactivated", 401);

        if (roles.length > 0 && !roles.map(r => r.toUpperCase()).includes(user.role.toUpperCase())) {
            return err(`Role '${user.role}' not authorized`, 403);
        }

        const authedReq = req as unknown as AuthedRequest;
        authedReq.user = { id: user.id, email: user.email, role: user.role };
        return handler(authedReq, context);
    };
};

export const withOptionalAuth = (
    handler: (req: NextRequest, context?: any, user?: { id: string; email: string; role: string }) => Promise<NextResponse>
) => {
    return async (req: NextRequest, context?: any): Promise<NextResponse> => {
        const authHeader = req.headers.get("authorization");
        let user;
        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.slice(7);
            const payload = verifyToken(token);
            if (payload) {
                const u = await prisma.user.findUnique({ where: { id: payload.id as string } });
                if (u && (u.isActive || u.role === 'SUPERADMIN')) user = { id: u.id, email: u.email, role: u.role };
            }
        }
        return handler(req, context, user);
    };
};

export const auditLog = async (
    action: string,
    entity: string,
    entityId: string | null,
    userId: string,
    userEmail: string,
    userRole: string,
    details?: Record<string, unknown>
) => {
    try {
        // Cast to any: AuditLog exists in schema but Prisma client types may be stale
        // (regenerate with: npx prisma generate — after stopping the dev server)
        await (prisma as any).auditLog.create({
            data: {
                action,
                entity,
                entityId,
                userId,
                userEmail,
                userRole,
                details: details ?? null,
            }
        });
    } catch (e) {
        console.error(`[AUDIT] Save failed for ${action} on ${entity}`, e);
    }
};

