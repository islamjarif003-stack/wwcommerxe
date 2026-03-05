import { useCurrencyStore } from "@/store/currencyStore";
import { useEffect, useState } from "react";

export function usePrice() {
    const { currency, setCurrency, exchangeRate, setExchangeRate } = useCurrencyStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Fetch the admin-configured exchange rate from DB
        fetch("/api/settings/exchange-rate")
            .then(r => r.json())
            .then(data => {
                if (data.success && data.rate) {
                    setExchangeRate(data.rate);
                }
            })
            .catch(() => { });
    }, []);

    const formatPrice = (priceInBdt: number | string | undefined | null) => {
        if (priceInBdt == null) return "৳0";
        let numericPrice = typeof priceInBdt === "string" ? Number(priceInBdt.replace(/,/g, "")) : priceInBdt;
        if (isNaN(numericPrice)) return "৳0";

        if (!mounted) {
            // SSR default
            return `৳${numericPrice.toLocaleString('en-IN')}`;
        }
        if (currency === "USD") {
            const usdPrice = numericPrice / exchangeRate;
            return `$${usdPrice.toFixed(2)}`;
        }
        return `৳${numericPrice.toLocaleString('en-IN')}`;
    };

    return { formatPrice, currency, setCurrency, exchangeRate, mounted };
}
