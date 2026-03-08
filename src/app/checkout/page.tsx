"use client";
import { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/apiClient";
import { BANGLADESH_DISTRICTS, DHAKA_CITY_AREAS } from "@/lib/delivery";
import { ShoppingCart, Truck, CreditCard, CheckCircle, ArrowLeft, Package, Shield } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { usePrice } from "@/hooks/usePrice";

function CheckoutContent() {
    const { formatPrice } = usePrice();
    const { items, total, clearCart } = useCartStore();
    const cartTotal = useCartStore((s) => s.total());
    const itemCount = useCartStore((s) => s.itemCount());
    const { user } = useAuthStore();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!user) {
            toast.error("Please login to continue checkout");
            router.replace("/auth/login?redirect=/checkout");
        }
    }, [mounted, user, router]);

    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        addressLine: "",
        district: "",
        zone: "",
        city: "",
        paymentMethod: "cod" as const,
        couponCode: "",
        notes: "",
    });

    const [delivery, setDelivery] = useState<any>(null);
    const [isPlacing, setIsPlacing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState<any>(null);
    const [couponApplied, setCouponApplied] = useState(false);

    useEffect(() => {
        if (form.district) {
            api.delivery.calculate(form.district, cartTotal)
                .then((res) => setDelivery(res.data))
                .catch(() => setDelivery({ charge: 120, zoneName: "Standard Delivery", estimatedDays: "3-5 days", isFreeDelivery: false }));
        }
    }, [form.district, cartTotal]);

    const deliveryCharge = delivery?.charge ?? (form.district ? 120 : 0);
    const finalTotal = cartTotal + deliveryCharge;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.phone || !form.district || !form.addressLine) {
            return toast.error("Please fill all required fields");
        }
        if (items.length === 0) return toast.error("Cart is empty");

        setIsPlacing(true);
        try {
            const res = await api.orders.create({
                customerName: form.name,
                customerEmail: form.email,
                customerPhone: form.phone,
                shippingAddress: {
                    label: "Home",
                    name: form.name,
                    phone: form.phone,
                    addressLine: form.addressLine,
                    city: form.city || form.district,
                    district: form.district,
                    zone: form.zone,
                },
                items: items.map((i) => ({
                    productId: i.productId,
                    variantId: i.variantId,
                    quantity: i.quantity,
                    attributes: i.attributes,
                })),
                paymentMethod: form.paymentMethod,
                couponCode: form.couponCode || undefined,
                notes: form.notes || undefined,
                userId: user?.id,
            });
            setOrderPlaced(res.data.order);
            clearCart();
            toast.success("Order placed successfully! 🎉");
        } catch (err: any) {
            toast.error(err.message || "Failed to place order");
        } finally {
            setIsPlacing(false);
        }
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="page-container pb-16 max-w-2xl mx-auto text-center" style={{ paddingTop: "140px" }}>
                    <div className="glass-card p-12">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                            <CheckCircle size={40} className="text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Order Placed! 🎉</h1>
                        <p className="text-[var(--text-muted)] mb-6">Your order has been confirmed and is being processed.</p>

                        <div className="bg-[var(--bg-elevated)] rounded-2xl p-6 text-left mb-8 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[var(--text-muted)]">Order Number</span>
                                <span className="font-bold text-indigo-400 text-lg">{orderPlaced.orderNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--text-muted)]">Total Amount</span>
                                <span className="font-bold text-[var(--text-primary)]">{formatPrice(orderPlaced.total.toLocaleString())}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--text-muted)]">Payment</span>
                                <span className="badge badge-warn uppercase">{orderPlaced.paymentMethod}</span>
                            </div>
                            {orderPlaced.isFraudSuspect && (
                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-300">
                                    ⚠ Your order is under review. We'll contact you shortly.
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/" className="btn-primary">Continue Shopping</Link>
                            {user && <Link href="/account/orders" className="btn-secondary">View My Orders</Link>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!mounted || !user) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="page-container pb-16 text-center flex flex-col items-center justify-center min-h-[50vh]" style={{ paddingTop: "140px" }}>
                    <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center mb-4 animate-pulse">
                        <Shield size={24} className="text-white" />
                    </div>
                    <p className="text-[var(--text-muted)]">Verifying account...</p>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="page-container pb-16 text-center" style={{ paddingTop: "140px" }}>
                    <ShoppingCart size={64} className="mx-auto mb-4 text-[var(--text-muted)] opacity-30" />
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Cart is empty</h2>
                    <Link href="/shop" className="btn-primary mt-4 inline-flex">Browse Products</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="page-container pb-16" style={{ paddingTop: "140px" }}>
                <Link href="/shop" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm mb-8 transition-colors">
                    <ArrowLeft size={16} /> Continue Shopping
                </Link>
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Checkout</h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Contact */}
                            <div className="glass-card p-6">
                                <h2 className="font-semibold text-[var(--text-primary)] text-lg mb-4">Contact Information</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-[var(--text-muted)] mb-1">Full Name *</label>
                                        <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Your name" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[var(--text-muted)] mb-1">Phone Number *</label>
                                        <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="01XXXXXXXXX" type="tel" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm text-[var(--text-muted)] mb-1">Email (optional)</label>
                                        <input className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" type="email" />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping */}
                            <div className="glass-card p-6">
                                <h2 className="font-semibold text-[var(--text-primary)] text-lg mb-4 flex items-center gap-2">
                                    <Truck size={18} className="text-indigo-400" /> Delivery Address
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-[var(--text-muted)] mb-1">District *</label>
                                        <select className="select-field" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required>
                                            <option value="">Select District</option>
                                            {BANGLADESH_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[var(--text-muted)] mb-1">Area / Thana</label>
                                        {form.district === "Dhaka" ? (
                                            <select className="select-field" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}>
                                                <option value="">Select Area</option>
                                                {DHAKA_CITY_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                                            </select>
                                        ) : (
                                            <input className="input-field" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Upazila / Thana" />
                                        )}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm text-[var(--text-muted)] mb-1">Full Address *</label>
                                        <textarea className="input-field" rows={2} value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} required placeholder="House/Flat no., Road, Landmark..." />
                                    </div>
                                </div>

                                {delivery && (
                                    <div className="mt-4 flex items-center justify-between bg-[var(--bg-elevated)] rounded-xl p-3">
                                        <div>
                                            <p className="text-sm font-medium text-[var(--text-primary)]">{delivery.zoneName}</p>
                                            <p className="text-xs text-[var(--text-muted)]">Est. {delivery.estimatedDays}</p>
                                        </div>
                                        {delivery.isFreeDelivery ? (
                                            <span className="badge badge-success text-sm font-bold">FREE</span>
                                        ) : (
                                            <span className="text-[var(--text-primary)] font-bold">{formatPrice(delivery.charge)}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Payment */}
                            <div className="glass-card p-6">
                                <h2 className="font-semibold text-[var(--text-primary)] text-lg mb-4 flex items-center gap-2">
                                    <CreditCard size={18} className="text-indigo-400" /> Payment Method
                                </h2>
                                <div className="space-y-2">
                                    {[
                                        { value: "cod", label: "Cash on Delivery (COD)", desc: "Pay when you receive", icon: "💵" },
                                        { value: "bkash", label: "bKash", desc: "Mobile banking payment", icon: "📱" },
                                        { value: "nagad", label: "Nagad", desc: "Mobile banking payment", icon: "💳" },
                                    ].map((method) => (
                                        <label
                                            key={method.value}
                                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === method.value
                                                ? "border-indigo-500 bg-indigo-500/10"
                                                : "border-[var(--border)] hover:border-[var(--border-hover)]"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.value}
                                                checked={form.paymentMethod === method.value}
                                                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as any })}
                                                className="sr-only"
                                            />
                                            <span className="text-2xl">{method.icon}</span>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">{method.label}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{method.desc}</p>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.paymentMethod === method.value ? "border-indigo-500" : "border-[var(--border)]"
                                                }`}>
                                                {form.paymentMethod === method.value && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="glass-card p-6">
                                <label className="block text-sm text-[var(--text-muted)] mb-1">Order Notes (optional)</label>
                                <textarea className="input-field" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special instructions..." />
                            </div>
                        </div>

                        {/* Right: Summary */}
                        <div>
                            <div className="glass-card p-6 sticky top-24">
                                <h2 className="font-semibold text-[var(--text-primary)] text-lg mb-4 flex items-center gap-2">
                                    <Package size={18} className="text-indigo-400" /> Order Summary
                                </h2>

                                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                    {items.map((item) => (
                                        <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                                            {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-2">{item.name}</p>
                                                {item.attributes && <p className="text-xs text-[var(--text-muted)]">{Object.values(item.attributes).join(", ")}</p>}
                                                <p className="text-xs text-[var(--text-muted)]">×{item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-bold text-[var(--text-primary)] flex-shrink-0">{formatPrice(item.totalPrice.toLocaleString())}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Coupon */}
                                <div className="mb-4">
                                    <div className="flex gap-2">
                                        <input className="input-field text-sm py-2" placeholder="Coupon code" value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })} />
                                        <button type="button" className="btn-secondary text-xs py-2 px-3 whitespace-nowrap">Apply</button>
                                    </div>
                                </div>

                                <div className="border-t border-[var(--border)] pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--text-muted)]">Subtotal ({itemCount} items)</span>
                                        <span className="text-[var(--text-primary)]">{formatPrice(cartTotal.toLocaleString())}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--text-muted)]">Delivery</span>
                                        {delivery?.isFreeDelivery ? (
                                            <span className="text-emerald-400 font-semibold">FREE</span>
                                        ) : (
                                            <span className="text-[var(--text-primary)]">{formatPrice(deliveryCharge)}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--border)]">
                                        <span className="text-[var(--text-primary)]">Total</span>
                                        <span className="gradient-text">{formatPrice(finalTotal.toLocaleString())}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isPlacing}
                                    className="btn-primary w-full justify-center py-4 text-base mt-6 disabled:opacity-60"
                                >
                                    {isPlacing ? "Placing Order..." : `Place Order • ${formatPrice(finalTotal.toLocaleString())}`}
                                </button>

                                <p className="text-xs text-center text-[var(--text-muted)] mt-3">
                                    🔒 Secure & encrypted checkout
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[var(--text-primary)]">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
