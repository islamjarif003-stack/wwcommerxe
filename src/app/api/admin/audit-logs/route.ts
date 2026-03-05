import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withAuth, AuthedRequest } from "@/lib/api";

const getHandler = async (req: AuthedRequest) => {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const entity = searchParams.get("entity");
    const userId = searchParams.get("userId");

    let whereClause: any = {};
    if (entity) whereClause.entity = entity;
    if (userId) whereClause.userId = userId;

    const total = await prisma.auditLog.count({ where: whereClause });
    const logs = await prisma.auditLog.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    });

    return ok({ items: logs, page, limit, total, totalPages: Math.ceil(total / limit) });
};

export const GET = withAuth(getHandler as any, "SUPERADMIN", "ADMIN");
