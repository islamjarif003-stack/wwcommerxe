import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withAuth, AuthedRequest } from "@/lib/api";

const handler = async (req: AuthedRequest) => {
    const orders = await prisma.order.findMany();
    const products = await prisma.product.findMany();
    const users = await prisma.user.findMany();
    const aiSuggestions: any[] = []; // Disabled for Postgres since not fully migrated

    // Revenue stats
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).getTime();

    const todayOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= todayStart);
    const monthOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= monthStart);
    const lastMonthOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= lastMonthStart && new Date(o.createdAt).getTime() <= lastMonthEnd);

    const validOrders = orders.filter(o => !["CANCELLED", "RETURNED", "cancelled", "returned"].includes(o.status));

    const validMonthOrders = monthOrders.filter(o => !["CANCELLED", "RETURNED", "cancelled", "returned"].includes(o.status));
    const validLastMonthOrders = lastMonthOrders.filter(o => !["CANCELLED", "RETURNED", "cancelled", "returned"].includes(o.status));

    const totalRevenue = validOrders.reduce((s, o) => s + o.total, 0);
    const monthRevenue = validMonthOrders.reduce((s, o) => s + o.total, 0);
    const lastMonthRevenue = validLastMonthOrders.reduce((s, o) => s + o.total, 0);
    const revenueGrowth = lastMonthRevenue > 0 ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : "0";

    // Order status breakdown
    const statusBreakdown = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Low stock products
    const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold && p.isActive);

    // Recent orders
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

    // Revenue last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
        const dayOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= dayStart && new Date(o.createdAt).getTime() < dayEnd);
        const validDayOrders = dayOrders.filter(o => !["CANCELLED", "RETURNED", "cancelled", "returned"].includes(o.status));
        return {
            date: d.toLocaleDateString("en-BD", { month: "short", day: "numeric" }),
            revenue: validDayOrders.reduce((s, o) => s + o.total, 0),
            orders: dayOrders.length,
        };
    }).reverse();

    // Top products
    const topProducts = [...products]
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 5)
        .map((p) => ({ id: p.id, name: p.name, soldCount: p.soldCount, revenue: p.soldCount * p.basePrice, image: p.images[0] }));

    return ok({
        stats: {
            totalRevenue,
            monthRevenue,
            revenueGrowth: parseFloat(revenueGrowth),
            totalOrders: orders.length,
            todayOrders: todayOrders.length,
            monthOrders: monthOrders.length,
            totalProducts: products.filter((p) => p.isActive).length,
            totalUsers: users.filter((u) => u.role === "USER").length,
            pendingOrders: orders.filter((o) => o.status === "PENDING").length,
            fraudSuspects: orders.filter((o) => o.isFraudSuspect).length,
            lowStockCount: lowStockProducts.length,
            pendingAiSuggestions: aiSuggestions.length,
        },
        statusBreakdown,
        recentOrders,
        last7Days,
        topProducts,
        lowStockProducts: lowStockProducts.slice(0, 5),
        aiSuggestions: aiSuggestions.slice(0, 5),
    });
};

export const GET = withAuth(handler, "SUPERADMIN", "ADMIN");
