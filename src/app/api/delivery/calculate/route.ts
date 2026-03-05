import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDelivery } from "@/lib/delivery";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const district = searchParams.get("district");
        const orderTotal = parseFloat(searchParams.get("total") || "0");

        if (!district) return NextResponse.json({ success: false, error: "district is required" }, { status: 400 });

        const zones = await prisma.deliveryZone.findMany({ where: { isActive: true } });
        const result = calculateDelivery(district, orderTotal, zones as any);

        if (!result) return NextResponse.json({ success: false, error: "No delivery zone found for this district" }, { status: 404 });

        return NextResponse.json({ success: true, data: result });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
