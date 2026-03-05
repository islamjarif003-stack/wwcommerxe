"use client";
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight, Package } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export function CartDrawer() {
    const { items, isOpen, setCartOpen, removeItem, updateQty, total, clearCart } = useCartStore();
    const cartTotal = useCartStore((s) => s.total());
    const itemCount = useCartStore((s) => s.itemCount());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-[#172B26]/30 z-[999] backdrop-blur-sm animate-fade-in"
                    onClick={() => setCartOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md z-[999] flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                style={{ background: "var(--bg-surface)", borderLeft: "1px solid var(--border)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={20} className="text-[var(--primary)]" />
                        <span className="font-semibold text-lg text-[var(--text-primary)]">Your Cart</span>
                        {mounted && itemCount > 0 && (
                            <span className="badge badge-primary">{itemCount} items</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {items.length > 0 && (
                            <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                                Clear all
                            </button>
                        )}
                        <button
                            onClick={() => setCartOpen(false)}
                            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-all text-[var(--text-secondary)] hover:text-[var(--primary)]"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                            <div className="w-20 h-20 rounded-full bg-[var(--bg-card)] flex items-center justify-center">
                                <Package size={36} className="text-[var(--text-muted)]" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg text-[var(--text-primary)]">Your cart is empty</p>
                                <p className="text-sm text-[var(--text-muted)] mt-1">Add some products to get started</p>
                            </div>
                            <Link href="/shop" onClick={() => setCartOpen(false)} className="btn-primary text-sm">
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={`${item.productId}-${item.variantId}`}
                                className="flex gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all relative overflow-hidden group"
                            >
                                {/* Subtle gradient background hover */}
                                <div className="absolute inset-0 bg-[var(--primary-glow)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                {/* Image */}
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border)] flex-shrink-0 relative z-10">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                                            <Package size={24} />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col relative z-10">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <p className="font-semibold text-[var(--text-primary)] leading-tight line-clamp-2 pr-2">{item.name}</p>
                                            {item.attributes && Object.keys(item.attributes).length > 0 && (
                                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                                    {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.productId, item.variantId)}
                                            className="p-1 -mr-2 -mt-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
                                            title="Remove item"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <div className="flex items-end justify-between mt-auto pt-3">
                                        <div className="font-bold text-lg text-[var(--primary)]">
                                            ৳{item.totalPrice.toLocaleString()}
                                        </div>

                                        {/* Qty controls */}
                                        <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-0.5 shadow-sm">
                                            <button
                                                onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                                                className="w-7 h-7 rounded-md hover:bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-6 text-center text-sm font-bold text-[var(--text-primary)] tracking-wide">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                                                className="w-7 h-7 rounded-md hover:bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-4 border-t border-[var(--border)] space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[var(--text-secondary)] font-bold">Subtotal</span>
                            <span className="font-bold text-lg text-[var(--primary)]">৳{cartTotal.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] text-center">Delivery charge calculated at checkout</p>
                        <Link
                            href="/checkout"
                            onClick={() => setCartOpen(false)}
                            className="btn-primary w-full justify-center text-sm py-3"
                        >
                            Proceed to Checkout <ArrowRight size={16} />
                        </Link>
                        <button
                            onClick={() => setCartOpen(false)}
                            className="btn-secondary w-full justify-center text-sm py-2"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
