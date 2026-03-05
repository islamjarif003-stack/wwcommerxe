// GET /api/health — Used by Docker, load balancers, uptime monitors
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const start = Date.now();
    try {
        // Quick DB ping
        await prisma.$queryRaw`SELECT 1`;
        const dbMs = Date.now() - start;

        return NextResponse.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            db: { status: "ok", latencyMs: dbMs },
            version: process.env.npm_package_version || "1.0.0",
        }, {
            status: 200,
            headers: { "Cache-Control": "no-store" },
        });
    } catch (e: any) {
        return NextResponse.json({
            status: "error",
            db: { status: "down", error: e.message },
            timestamp: new Date().toISOString(),
        }, { status: 503 });
    }
}
