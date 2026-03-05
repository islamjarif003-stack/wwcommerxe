import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

const getHandler = async (req: NextRequest, context: any) => {
    try {
        if (!context || !context.params) {
            console.error("Missing context or params:", context);
            return NextResponse.json({ success: false, error: "Configuration Error" }, { status: 500 });
        }

        const resolvedParams = await context.params;
        const session = await (prisma as any).chatSession.findUnique({
            where: { id: resolvedParams.id },
            include: { messages: { orderBy: { createdAt: "asc" } } },
        });
        if (!session) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: session });
    } catch (e) {
        console.error("Error in GET chat session:", e);
        return NextResponse.json({ success: false, error: "Failed to load session", details: String(e) }, { status: 500 });
    }
};

export const GET = withAuth(getHandler as any, "SUPERADMIN", "ADMIN", "MANAGER");

// Ensure the endpoint is protected
export const dynamic = "force-dynamic";
