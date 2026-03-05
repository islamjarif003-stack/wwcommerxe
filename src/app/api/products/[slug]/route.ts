import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const product = await prisma.product.findFirst({
            where: { slug: slug, isActive: true },
            include: { variants: true }
        });

        if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });

        // Increase view count in background
        await prisma.product.update({
            where: { id: product.id },
            data: { viewCount: { increment: 1 } }
        });

        const category = await prisma.category.findUnique({ where: { id: product.categoryId } });

        // Related products (same category)
        const related = await prisma.product.findMany({
            where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
            take: 4,
            orderBy: { demandScore: 'desc' }
        });

        return NextResponse.json({ success: true, data: { product: { ...product, viewCount: product.viewCount + 1 }, category, related } });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
