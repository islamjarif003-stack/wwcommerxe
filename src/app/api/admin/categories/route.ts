// POST /api/admin/categories   — create
// GET  /api/admin/categories   — list all (flat)
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withAuth, AuthedRequest, auditLog } from "@/lib/api";

const getHandler = async (_req: AuthedRequest) => {
    // Raw SQL to bypass stale Prisma client (parentId not in generated types yet)
    const rows = await prisma.$queryRaw<any[]>`
        SELECT c.*,
            COUNT(DISTINCT p.id) AS product_count,
            COUNT(DISTINCT sub.id) AS child_count
        FROM "Category" c
        LEFT JOIN "Product" p ON p."categoryId" = c.id
        LEFT JOIN "Category" sub ON sub."parentId" = c.id
        GROUP BY c.id
        ORDER BY c."parentId" ASC NULLS FIRST, c."sortOrder" ASC
    `;

    // Build tree: attach children to parents
    const roots: any[] = [];
    const map: Record<string, any> = {};
    for (const r of rows) {
        r.productCount = Number(r.product_count ?? 0);
        r._count = { products: Number(r.product_count ?? 0) };
        r.children = [];
        delete r.product_count;
        delete r.child_count;
        map[r.id] = r;
    }
    for (const r of rows) {
        if (r.parentId) {
            map[r.parentId]?.children.push(r);
        } else {
            roots.push(r);
        }
    }
    return ok(roots);
};

const postHandler = async (req: AuthedRequest) => {
    const { name, slug, description, icon, parentId, sortOrder, isActive } = await req.json();
    if (!name || !slug) return err("name and slug are required");

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) return err("Slug already in use", 409);

    const category = await prisma.$queryRaw<any[]>`
        INSERT INTO "Category" (id, name, slug, description, icon, "parentId", "sortOrder", "isActive", "createdAt", "updatedAt")
        VALUES (
            gen_random_uuid()::text,
            ${name},
            ${slug},
            ${description || null},
            ${icon || null},
            ${parentId || null},
            ${parseInt(sortOrder) || 0},
            ${isActive !== false},
            NOW(), NOW()
        )
        RETURNING *
    `;
    await auditLog("CREATE", "category", category[0].id, req.user.id, req.user.email, req.user.role, { name });
    return ok(category[0], 201);
};

export const GET = withAuth(getHandler as any, "SUPERADMIN", "ADMIN", "MANAGER");
export const POST = withAuth(postHandler as any, "SUPERADMIN", "ADMIN");
