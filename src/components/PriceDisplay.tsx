"use client";

import { usePrice } from "@/hooks/usePrice";

export function PriceDisplay({ amount, className = "" }: { amount: number, className?: string }) {
    const { formatPrice } = usePrice();
    return <span className={className}>{formatPrice(amount)}</span>;
}
