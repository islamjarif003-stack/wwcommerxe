import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateTokens } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, phone } = await req.json();
        if (!name || !email || !password) return NextResponse.json({ success: false, error: "Name, email and password are required" }, { status: 400 });
        if (password.length < 8) return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });

        const existing = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
        if (existing) return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                phone: phone || null,
                role: "USER",
                isActive: true,
                emailVerified: false,
                totalOrders: 0,
                totalSpent: 0,
                loyaltyPoints: 0,
                wishlist: [],
            }
        });

        // Generate email verification token independently from auth tokens
        const jwt = require("jsonwebtoken");
        if (process.env.JWT_SECRET) {
            const verifyToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "2h" });
            const { sendVerificationEmail } = require("@/lib/email");
            await sendVerificationEmail(user.email, verifyToken);
        } else {
            console.error("JWT_SECRET missing, cannot send verification email.");
        }

        const { token, refreshToken } = generateTokens({ id: user.id, email: user.email, role: user.role });
        const { password: _, ...userSafe } = user;
        return NextResponse.json({ success: true, data: { user: userSafe, token, refreshToken } }, { status: 201 });
    } catch (e) {
        const err = e as Error;
        console.error("[auth/register]", err);

        const message = process.env.NODE_ENV === "development"
            ? (err?.message || "Registration failed")
            : "Registration failed";

        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
