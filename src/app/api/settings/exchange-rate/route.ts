import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET() {
    try {
        const setting = await prisma.adminSetting.findUnique({
            where: { key: "STORE_EXCHANGE_RATE" }
        });

        const rate = setting?.value ? Number(setting.value) : 120;
        return NextResponse.json({ success: true, rate });
    } catch (error) {
        return NextResponse.json({ success: false, rate: 120 });
    }
}

export async function POST(req: Request) {
    try {
        const token = getTokenFromRequest(req);
        if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const user = verifyToken(token);
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN" && user.role !== "MANAGER")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { rate } = body;

        if (!rate || isNaN(Number(rate))) {
            return NextResponse.json({ success: false, message: "Invalid rate" }, { status: 400 });
        }

        await prisma.adminSetting.upsert({
            where: { key: "STORE_EXCHANGE_RATE" },
            update: { value: Number(rate) },
            create: { key: "STORE_EXCHANGE_RATE", value: Number(rate) }
        });

        // Add audit log
        await prisma.auditLog.create({
            data: {
                action: "UPDATE_EXCHANGE_RATE",
                entity: "AdminSetting",
                userId: user.id,
                userEmail: user.email,
                userRole: user.role,
                details: { newRate: rate }
            }
        });

        return NextResponse.json({ success: true, message: "Exchange rate updated successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
