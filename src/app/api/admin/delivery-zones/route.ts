import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withAuth, AuthedRequest, auditLog } from "@/lib/api";

const getHandler = async (_req: AuthedRequest) => {
    const zones = await prisma.deliveryZone.findMany();

    const withStats = await Promise.all(zones.map(async (z) => {
        const zoneOrders = await prisma.order.findMany({ where: { deliveryZoneId: z.id } });
        return {
            ...z,
            totalOrders: zoneOrders.length,
            deliveredOrders: zoneOrders.filter((o) => o.status === "DELIVERED").length,
            successRate: zoneOrders.length > 0
                ? Math.round(zoneOrders.filter((o) => o.status === "DELIVERED").length / zoneOrders.length * 100)
                : 0,
        };
    }));
    return ok(withStats);
};

const postHandler = async (req: AuthedRequest) => {
    const body = await req.json();
    const { name, type, districts, areas, baseCharge, expressCharge, freeDeliveryThreshold, estimatedDays, couriers } = body;
    if (!name || !type || !baseCharge) return err("name, type, baseCharge required");

    const zone = await prisma.deliveryZone.create({
        data: {
            name, type, districts: districts || [], areas: areas || [],
            baseCharge: parseFloat(baseCharge),
            freeDeliveryThreshold: freeDeliveryThreshold ? parseFloat(freeDeliveryThreshold) : undefined,
            estimatedDays: estimatedDays || "3-5 days",
            couriers: couriers || [],
            courierPerformance: {},
            isActive: true,
        }
    });
    await auditLog("CREATE", "deliveryZone", zone.id, req.user.id, req.user.email, req.user.role, { name, type });
    return ok(zone, 201);
};

export const GET = withAuth(getHandler as any, "SUPERADMIN", "ADMIN", "MANAGER");
export const POST = withAuth(postHandler as any, "SUPERADMIN", "ADMIN");
