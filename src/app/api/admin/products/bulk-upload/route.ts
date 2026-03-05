// POST /api/admin/products/bulk-upload
// Accepts CSV, parses it, inserts products in batches
// CSV Format: name,slug,sku,categoryId,basePrice,stock,description,brand,tags,images

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

const REQUIRED = ["name", "slug", "sku", "categoryId", "basePrice"];
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
        const missingHeaders = REQUIRED.filter(r => !headers.includes(r));
        if (missingHeaders.length > 0) {
            return err(`Missing required CSV columns: ${missingHeaders.join(", ")}`);
        }

        const dataRows = lines.slice(1);
        const products: any[] = [];
        const errors: string[] = [];

        for (let i = 0; i < dataRows.length; i++) {
            const values = parseCSVLine(dataRows[i]);
            if (values.length < REQUIRED.length) {
                errors.push(`Row ${i + 2}: Too few columns`);
                continue;
            }

            const row: Record<string, string> = {};
            headers.forEach((h, idx) => { row[h] = values[idx] || ""; });

            if (!row.name || !row.slug || !row.sku) {
                errors.push(`Row ${i + 2}: name, slug, and sku are required`);
                continue;
            }

            products.push({
                name: row.name,
                slug: row.slug,
                sku: row.sku,
                categoryId: row.categoryid || row.category_id,
                basePrice: parseFloat(row.baseprice || row.price || "0"),
                comparePrice: row.compareprice ? parseFloat(row.compareprice) : undefined,
                stock: parseInt(row.stock || "0"),
                lowStockThreshold: parseInt(row.lowstockthreshold || "5"),
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

        if (products.length === 0) {
            return err(`No valid rows found. Errors: ${errors.slice(0, 5).join("; ")}`);
        }

        // Batch insert (skip duplicates by slug/sku)
        let inserted = 0;
        let skipped = 0;
        const batchErrors: string[] = [];

        for (let b = 0; b < products.length; b += BATCH_SIZE) {
            const batch = products.slice(b, b + BATCH_SIZE);
            await Promise.all(
                batch.map(async (p) => {
                    try {
                        await prisma.product.upsert({
                            where: { slug: p.slug },
                            create: p,
                            update: {
                                // Only update stock and price if already exists
                                stock: p.stock, basePrice: p.basePrice,
                            },
                        });
                        inserted++;
                    } catch (e: any) {
                        skipped++;
                        batchErrors.push(`${p.name}: ${e.message?.slice(0, 80)}`);
                    }
                })
            );
        }

        return ok({
            processed: products.length,
            inserted,
            skipped,
            parseErrors: errors.slice(0, 20),
            insertErrors: batchErrors.slice(0, 20),
        });
    } catch (e: any) {
        console.error(e);
        return err(`Bulk upload failed: ${e.message}`);
    }
};

export const POST = withAuth(handler as any, "SUPERADMIN", "ADMIN");
