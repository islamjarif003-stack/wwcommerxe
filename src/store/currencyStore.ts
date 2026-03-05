import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CurrencyStore {
    currency: "BDT" | "USD";
    exchangeRate: number; // 1 USD = X BDT
    setCurrency: (c: "BDT" | "USD") => void;
    setExchangeRate: (rate: number) => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
    persist(
        (set) => ({
            currency: "BDT",
            exchangeRate: 120, // Default exchange rate
            setCurrency: (currency) => set({ currency }),
            setExchangeRate: (exchangeRate) => set({ exchangeRate }),
        }),
        {
            name: "currency-store",
        }
    )
);
