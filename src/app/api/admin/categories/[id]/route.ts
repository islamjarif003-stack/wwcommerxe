// PUT  /api/admin/categories/[id]  — update
// DELETE /api/admin/categories/[id] — delete
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withAuth, AuthedRequest, auditLog } from "@/lib/api";

const putHandler = async (req: AuthedRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) return err("Category not found", 404);

    const { name, slug, description, icon, parentId, sortOrder, isActive } = await req.json();

    if (slug && slug !== cat.slug) {
        const existing = await prisma.category.findUnique({ where: { slug } });
        if (existing) return err("Slug already in use", 409);
    }

    // Raw UPDATE to bypass stale Prisma types (parentId not in generated types yet)
    const updated = await prisma.$queryRaw<any[]>`
        UPDATE "Category"
        SET
            name = COALESCE(${name || null}, name),
            slug = COALESCE(${slug || null}, slug),
            description = ${description !== undefined ? (description || null) : null},
            icon = ${icon !== undefined ? (icon || null) : null},
            "parentId" = ${parentId !== undefined ? (parentId || null) : null},
            "sortOrder" = COALESCE(${sortOrder !== undefined ? parseInt(sortOrder) : null}, "sortOrder"),
            "isActive" = COALESCE(${isActive !== undefined ? isActive : null}, "isActive"),
            "updatedAt" = NOW()
        WHERE id = ${id}
        RETURNING *
    `;
    await auditLog("UPDATE", "category", updated[0].id, req.user.id, req.user.email, req.user.role, { name: updated[0].name });
    return ok(updated[0]);
};

const deleteHandler = async (_req: AuthedRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    try {
        // Check for linked products
        const count = await prisma.product.count({ where: { categoryId: id } });
        if (count > 0) return err(`Cannot delete: ${count} products are linked to this category. Reassign them first.`, 409);

        const cat = await prisma.category.findUnique({ where: { id } });
        if (cat) await auditLog("DELETE", "category", id, _req.user.id, _req.user.email, _req.user.role, { name: cat.name });

        await prisma.category.delete({ where: { id } });
        return ok({ message: "Category deleted" });
    } catch (e: any) {
        return err("Delete failed: " + e.message, 500);
    }
};

export const PUT = (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
    withAuth((r) => putHandler(r as AuthedRequest, ctx), "SUPERADMIN", "ADMIN")(req);
export const DELETE = (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
    withAuth((r) => deleteHandler(r as AuthedRequest, ctx), "SUPERADMIN", "ADMIN")(req);
