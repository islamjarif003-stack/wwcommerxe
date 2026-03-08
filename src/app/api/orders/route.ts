import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateOrderRisk } from "@/lib/aiEngine";
import { generateOrderNumber, calculateDelivery } from "@/lib/delivery";

export async function POST(req: NextRequest) {
    try {
        const { verifyToken } = await import("@/lib/auth");
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, error: "Authentication required to place an order" }, { status: 401 });
        }

        const payload = verifyToken(authHeader.slice(7));
        if (!payload || !payload.id) {
            return NextResponse.json({ success: false, error: "Invalid authentication token" }, { status: 401 });
        }

        const body = await req.json();
        const {
            customerName, customerEmail, customerPhone,
            shippingAddress, items, paymentMethod, couponCode, notes, userId,
        } = body;

        // Ensure user is the one placing their own order or at least authenticated
        const actualUserId = payload.id as string;

        if (!customerName || !customerPhone || !shippingAddress || !items?.length)
            return NextResponse.json({ success: false, error: "Missing required order fields" }, { status: 400 });

        let subtotal = 0;
        const orderItemsParams: any[] = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId }, include: { variants: true } });
            if (!product || !product.isActive) return NextResponse.json({ success: false, error: `Product not found: ${item.productId}` }, { status: 404 });
            if (product.stock < item.quantity) return NextResponse.json({ success: false, error: `Insufficient stock for ${product.name}` }, { status: 400 });

            let unitPrice = product.basePrice;
            let variantId: string | undefined;

            if (item.variantId) {
                const variant = product.variants.find((v) => v.id === item.variantId);
                if (!variant || !variant.isActive) return NextResponse.json({ success: false, error: `Variant not found` }, { status: 400 });
                unitPrice = variant.price;
                variantId = variant.id;
            }

            const totalPrice = unitPrice * item.quantity;
            subtotal += totalPrice;
            orderItemsParams.push({
                productId: product.id, variantId,
                name: product.name, sku: product.sku, image: product.images[0],
                quantity: item.quantity, unitPrice, totalPrice,
                attributes: item.attributes || {},
            });
        }

        const zones = await prisma.deliveryZone.findMany({ where: { isActive: true } });
        const deliveryInfo = calculateDelivery(shippingAddress.district, subtotal, zones as any);
        const deliveryCharge = deliveryInfo?.charge ?? 120;

        let discount = 0;
        // Ignore coupons for now since it's not in db.json originally and we haven't ported the model formally if it wasn't there fully, actually it wasn't in DB seed either.

        const total = subtotal + deliveryCharge - discount;

        const { riskScore, riskFlags, isFraudSuspect } = calculateOrderRisk({
            total, customerPhone, district: shippingAddress.district,
            paymentMethod, customerName, items: orderItemsParams,
        });

        // Use a transaction
        const order = await prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
                data: {
                    orderNumber: generateOrderNumber(),
                    userId: actualUserId,
                    customerName, customerEmail, customerPhone,
                    shippingAddress: shippingAddress,
                    subtotal, deliveryCharge, discount, total,
                    paymentMethod: paymentMethod.toUpperCase(),
                    paymentStatus: "PENDING",
                    status: "PENDING",
                    deliveryZoneId: deliveryInfo?.zoneId,
                    riskScore,
                    isFraudSuspect,
                    statusHistory: [{ status: "PENDING", timestamp: new Date().toISOString() }],
                    items: {
                        create: orderItemsParams.map(oi => ({
                            productId: oi.productId,
                            name: oi.name,
                            sku: oi.sku,
                            image: oi.image,
                            quantity: oi.quantity,
                            unitPrice: oi.unitPrice,
                            totalPrice: oi.totalPrice,
                            attributes: oi.attributes
                        }))
                    }
                }
            });

            // Decrement stock
            for (const item of orderItemsParams) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } }
                });
            }

            // Update user stats
            await tx.user.update({
                where: { id: actualUserId },
                data: {
                    totalOrders: { increment: 1 },
                    totalSpent: { increment: total },
                    loyaltyPoints: { increment: Math.floor(total / 100) },
                }
            });

            return createdOrder;
        });

        return NextResponse.json({ success: true, data: { order, deliveryInfo } }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, error: "Order creation failed" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
        const { verifyToken } = await import("@/lib/auth");
        const payload = verifyToken(authHeader.slice(7));
        if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const orders = await prisma.order.findMany({
            where: { userId: payload.id as string },
            orderBy: { createdAt: "desc" },
            include: { items: true }
        });

        return NextResponse.json({ success: true, data: orders });
    } catch (e) {
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
