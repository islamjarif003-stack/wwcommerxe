import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/categories
// ?tree=true  → hierarchical parent→children structure
// ?parentId=xxx → only children of specific parent
// ?slug=xxx → single category lookup (with children)
// (no params) → flat list of all active categories

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const tree = searchParams.get("tree") === "true";
        const parentIdParam = searchParams.get("parentId");
        const slugParam = searchParams.get("slug");

        // ── Single category by slug ───────────────────────────────────────
        if (slugParam) {
            const cat = await prisma.category.findUnique({
                where: { slug: slugParam },
                include: {
                    _count: { select: { products: true } },
                },
            });
            if (!cat) {
                return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
            }

            // Get children via raw SQL (parentId may not be in types)
            const children = await prisma.$queryRaw<any[]>`
                SELECT id, name, slug, icon, "sortOrder", "isActive",
                    (SELECT COUNT(*) FROM "Product" p WHERE p."categoryId" = c.id AND p."isActive" = true) AS "productCount"
                FROM "Category" c
                WHERE c."parentId" = ${cat.id} AND c."isActive" = true
                ORDER BY c."sortOrder" ASC
            `;

            return NextResponse.json({
                success: true,
                data: { ...cat, productCount: Number(cat._count.products), children }
            });
        }

        // ── Tree: root categories with children ───────────────────────────
        if (tree) {
            // Get roots (parentId IS NULL) with product counts
            const roots = await prisma.$queryRaw<any[]>`
                SELECT c.id, c.name, c.slug, c.description, c.image, c.icon, c."sortOrder", c."isActive", c."createdAt",
                    COUNT(DISTINCT p.id) AS "productCount"
                FROM "Category" c
                LEFT JOIN "Product" p ON p."categoryId" = c.id AND p."isActive" = true
                WHERE c."parentId" IS NULL AND c."isActive" = true
                GROUP BY c.id
                ORDER BY c."sortOrder" ASC
            `;

            // Get all children
            const allChildren = await prisma.$queryRaw<any[]>`
                SELECT c.id, c.name, c.slug, c.icon, c."parentId", c."sortOrder",
                    COUNT(DISTINCT p.id) AS "productCount"
                FROM "Category" c
                LEFT JOIN "Product" p ON p."categoryId" = c.id AND p."isActive" = true
                WHERE c."parentId" IS NOT NULL AND c."isActive" = true
                GROUP BY c.id
                ORDER BY c."sortOrder" ASC
            `;

            // Attach children to parents
            const result = roots.map((r: any) => ({
                ...r,
                productCount: Number(r.productCount),
                children: allChildren
                    .filter((ch: any) => ch.parentId === r.id)
                    .map((ch: any) => ({ ...ch, productCount: Number(ch.productCount) })),
            }));

            return NextResponse.json({ success: true, data: result });
        }

        // ── Children of a specific parent ─────────────────────────────────
        if (parentIdParam) {
            const children = await prisma.$queryRaw<any[]>`
                SELECT c.id, c.name, c.slug, c.icon, c."parentId", c."sortOrder",
                    COUNT(DISTINCT p.id) AS "productCount"
                FROM "Category" c
                LEFT JOIN "Product" p ON p."categoryId" = c.id AND p."isActive" = true
                WHERE c."parentId" = ${parentIdParam} AND c."isActive" = true
                GROUP BY c.id
                ORDER BY c."sortOrder" ASC
            `;
            return NextResponse.json({
                success: true,
                data: children.map((c: any) => ({ ...c, productCount: Number(c.productCount) }))
            });
        }

        // ── Flat list (default) ───────────────────────────────────────────
        // Used by navbar, shop page filter sidebar
        const cats = await prisma.$queryRaw<any[]>`
            SELECT c.id, c.name, c.slug, 
                   COALESCE(c.image, (SELECT p.images[1] FROM "Product" p WHERE p."categoryId" = c.id LIMIT 1)) as image, 
                   c.icon, c."parentId", c."sortOrder",
                COUNT(DISTINCT p.id) AS "productCount"
            FROM "Category" c
            LEFT JOIN "Product" p ON p."categoryId" = c.id AND p."isActive" = true
            WHERE c."isActive" = true
            GROUP BY c.id
            ORDER BY c."sortOrder" ASC
        `;

        return NextResponse.json({
            success: true,
            data: cats.map((c: any) => ({ ...c, productCount: Number(c.productCount) }))
        });

    } catch (e: any) {
        console.error("[/api/categories] Error:", e.message);
        return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
    }
}
