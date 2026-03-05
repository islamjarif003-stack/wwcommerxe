import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withAuth, AuthedRequest, auditLog } from "@/lib/api";

const getHandler = async (req: AuthedRequest) => {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let whereClause: any = {};
    if (search) {
        whereClause.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
        ];
    }
    if (category) whereClause.categoryId = category;
    if (status === "active") whereClause.isActive = true;
    if (status === "inactive") whereClause.isActive = false;
    if (status === "featured") whereClause.isFeatured = true;
    if (status === "low_stock") {
        // Raw SQL: filter where stock <= lowStockThreshold
        const lowStockProducts = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "Product" WHERE stock <= "lowStockThreshold"
            ${category ? prisma.$queryRaw`AND "categoryId" = ${category}` : prisma.$queryRaw``}
        `;
        whereClause.id = { in: lowStockProducts.map((p: any) => p.id) };
    }

    const [total, products, categories] = await Promise.all([
        prisma.product.count({ where: whereClause }),
        prisma.product.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            include: { category: { select: { name: true } } },
        }),
        prisma.category.findMany({
            select: { id: true, name: true, slug: true },
            orderBy: { sortOrder: "asc" },
        }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return ok({
        items: products,
        page, limit, total, totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        categories,
    });
};

const postHandler = async (req: AuthedRequest) => {
    const body = await req.json();
    const { name, slug, description, shortDescription, categoryId, brand, tags, images,
        basePrice, comparePrice, sku, stock, lowStockThreshold, attributes, variants,
        isActive, isFeatured, isDigital, seoTitle, seoDescription, weight } = body;

    if (!name || !slug || !basePrice || !sku || !categoryId)
        return err("name, slug, sku, basePrice, categoryId are required");

    const existing = await prisma.product.findFirst({ where: { slug } });
    if (existing) return err("Slug already exists", 409);

    const product = await prisma.product.create({
        data: {
            name, slug, description: description || "", shortDescription,
            categoryId, brand, tags: tags || [], images: images || [],
            basePrice: parseFloat(basePrice), comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
            sku, stock: parseInt(stock) || 0, lowStockThreshold: parseInt(lowStockThreshold) || 5,
            weight: weight ? parseFloat(weight) : undefined,
            attributes: attributes || {},
            isActive: isActive !== false, isFeatured: isFeatured || false, isDigital: isDigital || false,
            seoTitle, seoDescription, rating: 0, reviewCount: 0,
            soldCount: 0, viewCount: 0, demandScore: 0, performanceScore: 0,
            variants: {
                create: (variants || []).map((v: any) => ({
                    sku: v.sku, name: v.name, price: v.price || parseFloat(basePrice),
                    stock: v.stock || 0, attributes: v.attributes || {}
                }))
            }
        }
    });

    await auditLog("CREATE", "product", product.id, req.user.id, req.user.email, req.user.role, { name, sku });
    return ok(product, 201);
};

export const GET = withAuth(getHandler as any, "SUPERADMIN", "ADMIN", "MANAGER");
export const POST = withAuth(postHandler as any, "SUPERADMIN", "ADMIN");
