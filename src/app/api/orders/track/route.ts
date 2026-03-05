import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber")?.trim().toUpperCase();
    const phone = searchParams.get("phone")?.trim();

    if (!orderNumber || !phone) return NextResponse.json({ success: false, error: "Order number and phone are required" }, { status: 400 });

    try {
        const order = await prisma.order.findFirst({
            where: {
                orderNumber: { equals: orderNumber, mode: "insensitive" },
                customerPhone: phone
            },
            include: { items: true }
        });

        if (!order) return NextResponse.json({ success: false, error: "Order not found. Please check your order number and phone number." }, { status: 404 });

        // Parse address
        const address = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress;

        return NextResponse.json({
            success: true, data: {
                orderNumber: order.orderNumber,
                status: order.status,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                customerName: order.customerName,
                total: order.total,
                subtotal: order.subtotal,
                deliveryCharge: order.deliveryCharge,
                discount: order.discount,
                itemCount: order.items.length,
                items: order.items.map((i: any) => ({
                    name: i.name,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    totalPrice: i.totalPrice,
                    image: i.image,
                    attributes: i.attributes,
                })),
                district: (address as any)?.district,
                zone: (address as any)?.zone,
                statusHistory: order.statusHistory || [],
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            }
        });
    } catch (e) {
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
