// Dynamic sitemap generator — /sitemap.xml
// Generates URLs for all active products and categories
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
        { url: `${BASE_URL}/shop`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
        { url: `${BASE_URL}/track`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    ];

    // Categories
    let categoryPages: MetadataRoute.Sitemap = [];
    try {
        const cats = await prisma.category.findMany({
            where: { isActive: true },
            select: { slug: true, updatedAt: true },
        });
        categoryPages = cats.map(cat => ({
            url: `${BASE_URL}/category/${cat.slug}`,
            lastModified: cat.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }));
    } catch { }

    // Products (limit to 50K for sitemap size — split into sitemap index if needed)
    let productPages: MetadataRoute.Sitemap = [];
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            select: { slug: true, updatedAt: true },
            orderBy: { demandScore: "desc" },
            take: 49000, // Leave room for categories + static
        });
        productPages = products.map(p => ({
            url: `${BASE_URL}/products/${p.slug}`,
            lastModified: p.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));
    } catch { }

    return [...staticPages, ...categoryPages, ...productPages];
}
