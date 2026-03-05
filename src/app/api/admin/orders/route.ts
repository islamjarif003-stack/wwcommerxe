import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withAuth, AuthedRequest } from "@/lib/api";

const getHandler = async (req: AuthedRequest) => {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase();
    const riskOnly = searchParams.get("risk") === "true";

    let whereClause: any = {};
    if (status) whereClause.status = status.toUpperCase();
    if (search) {
        whereClause.OR = [
            { orderNumber: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerPhone: { contains: search } }
        ];
    }
    if (riskOnly) {
        whereClause.OR = [
            ...(whereClause.OR || []),
            { isFraudSuspect: true },
            { riskScore: { gte: 50 } }
        ];
    }

    const total = await prisma.order.count({ where: whereClause });
    const orders = await prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { items: true }
    });

    return ok({
        items: orders,
        page,
        total,
        totalPages: Math.ceil(total / limit)
    });
};

export const GET = withAuth(getHandler as any, "SUPERADMIN", "ADMIN");
