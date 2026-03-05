"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
    productId: string;
    variantId?: string;
    name: string;
    image?: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    attributes?: Record<string, string>;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: CartItem) => void;
    removeItem: (productId: string, variantId?: string) => void;
    updateQty: (productId: string, variantId: string | undefined, qty: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    setCartOpen: (open: boolean) => void;
    total: () => number;
    itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (item) => {
                const existing = get().items.find(
                    (i) => i.productId === item.productId && i.variantId === item.variantId
                );
                if (existing) {
                    set((s) => ({
                        items: s.items.map((i) =>
                            i.productId === item.productId && i.variantId === item.variantId
                                ? { ...i, quantity: i.quantity + item.quantity, totalPrice: i.unitPrice * (i.quantity + item.quantity) }
                                : i
                        ),
                        isOpen: true,
                    }));
                } else {
                    set((s) => ({ items: [...s.items, item], isOpen: true }));
                }
            },

            removeItem: (productId, variantId) =>
                set((s) => ({
                    items: s.items.filter((i) => !(i.productId === productId && i.variantId === variantId)),
                })),

            updateQty: (productId, variantId, qty) => {
                if (qty <= 0) {
                    get().removeItem(productId, variantId);
                    return;
                }
                set((s) => ({
                    items: s.items.map((i) =>
                        i.productId === productId && i.variantId === variantId
                            ? { ...i, quantity: qty, totalPrice: i.unitPrice * qty }
                            : i
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),
            toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
            setCartOpen: (open) => set({ isOpen: open }),
            total: () => get().items.reduce((s, i) => s + i.totalPrice, 0),
            itemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
        }),
        { name: "ww-cart" }
    )
);
