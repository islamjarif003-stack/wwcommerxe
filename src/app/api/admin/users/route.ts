import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
        const payload = verifyToken(authHeader.slice(7));
        if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const ADMIN_ROLES = ["ADMIN", "SUPERADMIN", "MANAGER", "admin", "superadmin", "manager"];
        if (!ADMIN_ROLES.includes((payload as any).role)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" }
        });

        const safe = users.map(({ password, ...rest }) => rest);

        return NextResponse.json({ success: true, data: safe });
    } catch (e) {
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
