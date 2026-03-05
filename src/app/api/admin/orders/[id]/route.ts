import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withAuth, AuthedRequest, auditLog } from "@/lib/api";

const putHandler = async (req: AuthedRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return err("Order not found", 404);

    const { status, note, courier, trackingNumber, paymentStatus } = await req.json();

    const updates: any = {};
    if (status) {
        updates.status = status.toUpperCase();
        const newHistory = [
            ...(order.statusHistory as any[] || []),
            { status: status.toUpperCase(), note, timestamp: new Date().toISOString(), by: req.user.email }
        ];
        updates.statusHistory = newHistory;
    }
    if (courier) updates.courier = courier;
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const updated = await prisma.order.update({
        where: { id },
        data: updates
    });
    await auditLog("UPDATE", "order", updated.id, req.user.id, req.user.email, req.user.role, { status, trackingNumber });
    return ok(updated);
};

const getHandler = async (_req: AuthedRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return err("Order not found", 404);

    let zone = null;
    if (order.deliveryZoneId) {
        zone = await prisma.deliveryZone.findUnique({ where: { id: order.deliveryZoneId } });
    }

    return ok({ order, zone });
};

export const GET = (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
    withAuth((r) => getHandler(r as AuthedRequest, ctx), "SUPERADMIN", "ADMIN")(req);
export const PUT = (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
    withAuth((r) => putHandler(r as AuthedRequest, ctx), "SUPERADMIN", "ADMIN")(req);
