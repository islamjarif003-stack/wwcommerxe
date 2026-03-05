import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateTokens } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, setupKey } = await req.json();
        if (setupKey !== process.env.ADMIN_SETUP_KEY) return NextResponse.json({ success: false, error: "Invalid setup key" }, { status: 403 });
        if (!name || !email || !password) return NextResponse.json({ success: false, error: "All fields required" }, { status: 400 });

        const existing = await prisma.user.findFirst({ where: { role: "SUPERADMIN" } });
        if (existing) return NextResponse.json({ success: false, error: "Super admin already exists" }, { status: 409 });

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                name, email: email.toLowerCase(), password: hashedPassword,
                role: "SUPERADMIN", isActive: true, emailVerified: true,
                totalOrders: 0, totalSpent: 0, loyaltyPoints: 0,
            }
        });

        const { token, refreshToken } = generateTokens({ id: user.id, email: user.email, role: user.role });
        const { password: _, ...userSafe } = user;
        return NextResponse.json({ success: true, data: { user: userSafe, token, refreshToken } }, { status: 201 });
    } catch (e) {
        return NextResponse.json({ success: false, error: "Setup failed" }, { status: 500 });
    }
}
