import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

const getHandler = async () => {
    try {
        const sessions = await (prisma as any).chatSession.findMany({
            orderBy: { updatedAt: "desc" },
            include: {
                messages: { orderBy: { createdAt: "desc" }, take: 1 },
                user: { select: { name: true, email: true } },
            },
        });
        return NextResponse.json({ success: true, data: sessions });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, error: "Failed to load chat sessions" }, { status: 500 });
    }
};

export const GET = withAuth(getHandler as any, "SUPERADMIN", "ADMIN", "MANAGER");
