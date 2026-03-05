import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, paginate } from "@/lib/api";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.toLowerCase();
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "newest";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999");
    const tag = searchParams.get("tag");

    let whereClause: any = { isActive: true };

    // Category filter: slug → resolve to ID + any sub-category IDs
    if (category) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
        if (isUUID) {
            // raw SQL to also include children of this category ID
            const childRows = await prisma.$queryRaw<{ id: string }[]>`
                SELECT id FROM "Category" WHERE "parentId" = ${category}
            `;
            const allIds = [category, ...childRows.map(c => c.id)];
            whereClause.categoryId = { in: allIds };
        } else {
            // Resolve slug → parent ID + child IDs via raw SQL
            const parentRows = await prisma.$queryRaw<{ id: string }[]>`
                SELECT id FROM "Category" WHERE slug = ${category} AND "isActive" = true LIMIT 1
            `;
            if (parentRows.length > 0) {
                const parentId = parentRows[0].id;
                const childRows = await prisma.$queryRaw<{ id: string }[]>`
                    SELECT id FROM "Category" WHERE "parentId" = ${parentId}
                `;
                const allIds = [parentId, ...childRows.map(c => c.id)];
                whereClause.categoryId = { in: allIds };
            }
        }
    }


    if (search) {
        whereClause.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }

    if (featured === "true") whereClause.isFeatured = true;
    if (tag) whereClause.tags = { has: tag };
    if (minPrice > 0 || maxPrice < 999999) {
        whereClause.basePrice = { gte: minPrice, lte: maxPrice };
    }

    let orderByClause: any = { createdAt: "desc" };
    switch (sort) {
        case "price_asc": orderByClause = { basePrice: "asc" }; break;
        case "price_desc": orderByClause = { basePrice: "desc" }; break;
        case "popular": orderByClause = { soldCount: "desc" }; break;
        case "rating": orderByClause = { rating: "desc" }; break;
        case "demand": orderByClause = { demandScore: "desc" }; break;
        case "new": orderByClause = { createdAt: "desc" }; break;
    }


    try {
        const total = await prisma.product.count({ where: whereClause });
        const productsList = await prisma.product.findMany({
            where: whereClause,
            orderBy: orderByClause,
            skip: (page - 1) * limit,
            take: limit,
            include: { category: true, variants: true }
        });

        // The paginate helper from api.ts usually wants the raw array or does manual paginating. Let's format manually to match old paginate helper format.
        const totalPages = Math.ceil(total / limit);
        const result = {
            items: productsList,
            meta: { total, page, limit, totalPages, hasNext: page < totalPages }
        };

        const categories = await prisma.category.findMany({ where: { isActive: true } });

        return NextResponse.json({ success: true, data: { ...result, categories } });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
    }
}
