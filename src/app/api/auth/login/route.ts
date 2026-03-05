import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, generateTokens } from "@/lib/auth";

const IS_PROD = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) {
            return NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } }
        });
        if (!user) {
            return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
        }
        if (!user.isActive && user.role !== "SUPERADMIN") {
            return NextResponse.json({ success: false, error: "Account is deactivated" }, { status: 403 });
        }

        const valid = await comparePassword(password, user.password);
        if (!valid) {
            return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });

        const { token, refreshToken } = generateTokens({ id: user.id, email: user.email, role: user.role });
        const { password: _, ...userSafe } = user;

        const response = NextResponse.json({
            success: true,
            data: { user: userSafe, token, refreshToken }
        });

        // Set httpOnly cookie for middleware-level admin protection
        // Expires in 7 days (matches JWT expiry)
        const isAdmin = ["ADMIN", "SUPERADMIN", "MANAGER"].includes(user.role.toUpperCase());
        if (isAdmin) {
            response.cookies.set("ww-token", token, {
                httpOnly: true,
                secure: IS_PROD,
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: "/",
            });
        }

        return response;
    } catch (e) {
        console.error("[Login]", e);
        return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
    }
}
