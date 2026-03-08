import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ success: false, error: "Missing verification token" }, { status: 400 });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET missing");

        let decoded: any;
        try {
            decoded = jwt.verify(token, secret);
        } catch (e) {
            return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 400 });
        }

        if (!decoded?.email) {
            return NextResponse.json({ success: false, error: "Invalid token payload" }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: { email: { equals: decoded.email, mode: "insensitive" } }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const { generateTokens } = require("@/lib/auth");

        if (user.emailVerified) {
            const { token: authToken, refreshToken } = generateTokens({ id: user.id, email: user.email, role: user.role });
            const { password: _, ...userSafe } = user;
            return NextResponse.json({ success: true, message: "Email already verified", data: { user: userSafe, token: authToken, refreshToken } }, { status: 200 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true }
        });

        const { token: authToken, refreshToken } = generateTokens({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role });
        const { password: _, ...userSafe } = updatedUser;

        return NextResponse.json({ success: true, message: "Email successfully verified!", data: { user: userSafe, token: authToken, refreshToken } }, { status: 200 });
    } catch (e) {
        console.error("[auth/verify-email]", e);
        return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
    }
}
