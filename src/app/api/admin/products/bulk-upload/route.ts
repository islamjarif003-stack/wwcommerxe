// POST /api/admin/products/bulk-upload
// Accepts CSV, parses it, inserts products in batches
// CSV Format: name,slug,sku,supplierSku,categoryId,basePrice,comparePrice,stock,description,brand,tags,images,isActive,isFeatured

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthedRequest, ok, err } from "@/lib/api";

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

function normalizeCategoryText(input: string): string {
    return (input || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]/g, "");
}

function tokenizeCategoryText(input: string): string[] {
    return (input || "")
        .toLowerCase()
        .replace(/&/g, " and ")
        .split(/[^a-z0-9]+/g)
        .map(t => t.trim())
        .filter(Boolean);
}

function resolveCategory(
    allCategories: Array<{ id: string; name: string; slug: string }>,
    rawCat: string,
    cleanedCatText: string,
    rawCode: string
) {
    const rawNorm = normalizeCategoryText(rawCat);
    const cleanedNorm = normalizeCategoryText(cleanedCatText);
    const codeNorm = normalizeCategoryText(rawCode);

    // 1) Strong exact matching first (id / slug / name / normalized equality)
    const exact = allCategories.find((c) =>
        c.id === rawCat ||
        c.id === cleanedCatText ||
        c.id === rawCode ||
        c.slug.toLowerCase() === rawCat.toLowerCase() ||
        c.slug.toLowerCase() === cleanedCatText.toLowerCase() ||
        c.slug.toLowerCase() === rawCode.toLowerCase() ||
        c.name.toLowerCase() === rawCat.toLowerCase() ||
        c.name.toLowerCase() === cleanedCatText.toLowerCase() ||
        normalizeCategoryText(c.name) === rawNorm ||
        normalizeCategoryText(c.name) === cleanedNorm ||
        normalizeCategoryText(c.slug) === rawNorm ||
        normalizeCategoryText(c.slug) === cleanedNorm
    );

    if (exact) return exact;

    // 2) Fallback for code hints like "General (GEN)" without risky substring matching
    if (codeNorm) {
        const byCode = allCategories.find((c) => {
            const tokens = [
                ...tokenizeCategoryText(c.name),
                ...tokenizeCategoryText(c.slug),
            ];

            return tokens.some((token) =>
                token === codeNorm ||
                (codeNorm.length >= 3 && token.startsWith(codeNorm))
            );
        });

        if (byCode) return byCode;
    }

    return undefined;
}

const REQUIRED = ["name", "slug", "sku", "supplierSku", "categoryId", "basePrice"];
const BATCH_SIZE = 50;

const handler = async (req: AuthedRequest): Promise<NextResponse> => {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) return err("No CSV file provided");

        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) return err("CSV must have header + at least one row");

        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, ""));
        const missingHeaders = REQUIRED.filter(r => !headers.includes(r.toLowerCase()));
        if (missingHeaders.length > 0) {
            return err(`Missing required CSV columns: ${missingHeaders.join(", ")}`);
        }

        const dataRows = lines.slice(1);
        const products: any[] = [];
        const errors: string[] = [];

        // Load all categories for smart resolving
        const allCategories = await prisma.category.findMany({
            select: { id: true, name: true, slug: true }
        });

        const categoryHint = allCategories
            .slice(0, 10)
            .map((c: any) => `${c.name} (${c.slug})`)
            .join(", ");

        for (let i = 0; i < dataRows.length; i++) {
            const values = parseCSVLine(dataRows[i]);
            if (values.length < REQUIRED.length) {
                errors.push(`Row ${i + 2}: Too few columns`);
                continue;
            }

            const row: Record<string, string> = {};
            headers.forEach((h, idx) => { row[h] = values[idx] || ""; });

            if (!row.name || !row.slug || !row.sku || !row.suppliersku?.trim()) {
                errors.push(`Row ${i + 2}: name, slug, sku, supplierSku are required`);
                continue;
            }

            const rawCat = (row.categoryid || row.category_id || "").trim();
            // Tolerate formats like "General (GEN)" or "Jewellery & Accessories (JACC)"
            const codeMatch = rawCat.match(/\(([^)]+)\)/);
            const rawCode = codeMatch?.[1]?.trim() || "";
            const cleanedCatText = rawCat.replace(/\([^)]*\)/g, '').trim();

            const matchedCategory = resolveCategory(allCategories, rawCat, cleanedCatText, rawCode);

            if (!matchedCategory) {
                errors.push(`Row ${i + 2}: Invalid category "${rawCat}". Use valid category ID, name, or slug. Examples: ${categoryHint}`);
                continue;
            }

            products.push({
                name: row.name,
                slug: row.slug,
                sku: row.sku,
                supplierSku: row.suppliersku.trim(),
                categoryId: matchedCategory.id,
                basePrice: isNaN(parseFloat(row.baseprice || row.price)) ? 0 : parseFloat(row.baseprice || row.price),
                comparePrice: (row.compareprice && !isNaN(parseFloat(row.compareprice))) ? parseFloat(row.compareprice) : null,
                stock: isNaN(parseInt(row.stock)) ? 0 : parseInt(row.stock),
                lowStockThreshold: isNaN(parseInt(row.lowstockthreshold)) ? 5 : parseInt(row.lowstockthreshold),
                description: row.description || "",
                shortDescription: row.shortdescription || "",
                brand: row.brand || "",
                tags: row.tags ? row.tags.split("|").map((t: string) => t.trim()).filter(Boolean) : [],
                images: row.images ? row.images.split("|").map((i: string) => i.trim()).filter(Boolean) : [],
                weight: row.weight ? parseFloat(row.weight) : undefined,
                isActive: row.isactive !== "false",
                isFeatured: row.isfeatured === "true",
                rating: 0, reviewCount: 0, soldCount: 0, viewCount: 0,
                demandScore: 0, performanceScore: 0,
            });
        }

        const invalidRows = errors.length;

        if (products.length === 0) {
            return err(`No valid rows found. Errors: ${errors.slice(0, 5).join("; ")}`);
        }

        // Batch insert (skip duplicates by slug/sku)
        let created = 0;
        let updated = 0;
        let skipped = 0;
        let duplicateSupplierSku = 0;
        let autoResolvedSlugSku = 0;
        const batchErrors: string[] = [];
        const processedSupplierSkuInCsv = new Set<string>();

        const buildSlug = (input: string) =>
            input
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "") || "product";

        const ensureUniqueSlug = async (baseInput: string) => {
            const base = buildSlug(baseInput);
            let candidate = base;
            let counter = 1;
            while (await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } })) {
                counter++;
                candidate = `${base}-${counter}`;
            }
            return candidate;
        };

        const ensureUniqueSku = async (baseInput: string) => {
            const base = (baseInput || "SKU").trim();
            let candidate = base;
            let counter = 1;
            while (await prisma.product.findUnique({ where: { sku: candidate }, select: { id: true } })) {
                counter++;
                candidate = `${base}-${counter}`;
            }
            return candidate;
        };

        for (let b = 0; b < products.length; b += BATCH_SIZE) {
            const batch = products.slice(b, b + BATCH_SIZE);
            for (const p of batch) {
                try {
                    const supplierKey = String(p.supplierSku || "").trim().toLowerCase();
                    if (supplierKey && processedSupplierSkuInCsv.has(supplierKey)) {
                        duplicateSupplierSku++;
                        skipped++;
                        batchErrors.push(`${p.name}: Duplicate supplierSku in same CSV (${p.supplierSku})`);
                        continue;
                    }
                    if (supplierKey) processedSupplierSkuInCsv.add(supplierKey);

                    // NOTE: Cast to any because local Prisma client types may be stale
                    // (supplierSku exists in schema, but generated types can lag while dev server locks engine file).
                    const existingBySupplierSku = await prisma.product.findFirst({
                        where: { supplierSku: p.supplierSku },
                        select: { id: true },
                    } as any);

                    if (existingBySupplierSku) {
                        await prisma.product.update({
                            where: { id: existingBySupplierSku.id },
                            data: {
                                name: p.name,
                                stock: p.stock,
                                basePrice: p.basePrice,
                                comparePrice: p.comparePrice,
                                categoryId: p.categoryId,
                                isActive: p.isActive,
                                isFeatured: p.isFeatured,
                                description: p.description,
                                shortDescription: p.shortDescription,
                                brand: p.brand,
                                tags: p.tags,
                                images: p.images,
                                lowStockThreshold: p.lowStockThreshold,
                                weight: p.weight,
                            },
                        });
                        updated++;
                    } else {
                        const slugOwner = await prisma.product.findUnique({ where: { slug: p.slug }, select: { id: true } });
                        const skuOwner = await prisma.product.findUnique({ where: { sku: p.sku }, select: { id: true } });

                        let createSlug = p.slug;
                        let createSku = p.sku;
                        if (slugOwner) {
                            createSlug = await ensureUniqueSlug(p.slug || p.name);
                        }
                        if (skuOwner) {
                            createSku = await ensureUniqueSku(p.sku || p.supplierSku);
                        }
                        if (createSlug !== p.slug || createSku !== p.sku) {
                            autoResolvedSlugSku++;
                        }

                        await prisma.product.create({
                            data: {
                                ...p,
                                slug: createSlug,
                                sku: createSku,
                            }
                        } as any);
                        created++;
                    }
                } catch (e: any) {
                    skipped++;
                    batchErrors.push(`${p.name}: ${e.message?.split('\\n').pop() || e.message}`);
                }
            }
        }

        const processingSkipped = skipped;
        const totalSkipped = processingSkipped + invalidRows;

        return ok({
            processed: dataRows.length,
            validRows: products.length,
            invalidRows,
            created,
            updated,
            inserted: created,
            skipped: totalSkipped,
            processingSkipped,
            duplicateSupplierSku,
            autoResolvedSlugSku,
            parseErrors: errors.slice(0, 20),
            insertErrors: batchErrors.slice(0, 20),
        });
    } catch (e: any) {
        console.error(e);
        return err(`Bulk upload failed: ${e.message}`);
    }
};

export const POST = withAuth(handler as any, "SUPERADMIN", "ADMIN");
