"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, User, ShoppingBag } from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
    PENDING: { color: "#fbbf24", bg: "rgba(251,191,36,0.15)", icon: Clock, label: "Pending" },
    CONFIRMED: { color: "#60a5fa", bg: "rgba(96,165,250,0.15)", icon: CheckCircle, label: "Confirmed" },
    PROCESSING: { color: "#c084fc", bg: "rgba(192,132,252,0.15)", icon: Package, label: "Processing" },
    SHIPPED: { color: "#34d399", bg: "rgba(52,211,153,0.15)", icon: Truck, label: "Shipped" },
    DELIVERED: { color: "#10b981", bg: "rgba(16,185,129,0.15)", icon: CheckCircle, label: "Delivered" },
    CANCELLED: { color: "#f87171", bg: "rgba(248,113,113,0.15)", icon: XCircle, label: "Cancelled" },
    RETURNED: { color: "#f43f5e", bg: "rgba(244,63,94,0.15)", icon: XCircle, label: "Returned" },
};

export default function MyOrdersPage() {
    const { user, token } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Redirect if not logged in
        if (!token) {
            router.push(`/auth/login?redirect=/account/orders`);
            return;
        }

        // Fetch user orders
        api.orders.myOrders()
            .then(res => setOrders(res.data || []))
            .catch(err => console.error("Failed to load orders:", err))
            .finally(() => setIsLoading(false));
    }, [token, router]);

    if (!token) return null; // Prevent flash of content before redirect

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
            <Navbar />

            <div className="page-container" style={{ paddingTop: "100px", paddingBottom: "60px", maxWidth: "1000px", margin: "0 auto" }}>

                {/* ── Header Area ── */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                    <div style={{
                        width: "56px", height: "56px", borderRadius: "16px",
                        background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1px solid rgba(99,102,241,0.3)",
                    }}>
                        <User size={28} style={{ color: "#a78bfa" }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "white", margin: "0 0 4px 0" }}>My Account</h1>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
                            Welcome back, <span style={{ color: "white", fontWeight: 600 }}>{user?.name || "Customer"}</span>
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "24px", flexDirection: "column" }}>

                    {/* ── Order List ── */}
                    <div style={{ flex: 1 }}>
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px"
                        }}>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                                <ShoppingBag size={18} color="#a78bfa" /> Your Orders
                            </h2>
                            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600, background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: "20px" }}>
                                {orders.length} Total
                            </span>
                        </div>

                        {isLoading ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="skeleton" style={{ height: "130px", borderRadius: "16px" }} />
                                ))}
                            </div>
                        ) : orders.length === 0 ? (
                            <div style={{
                                background: "var(--bg-card)", border: "1px solid var(--border)",
                                borderRadius: "20px", padding: "60px 24px", textAlign: "center"
                            }}>
                                <div style={{
                                    width: "80px", height: "80px", borderRadius: "24px",
                                    background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px"
                                }}>
                                    <Package size={36} color="var(--text-muted)" />
                                </div>
                                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "white", marginBottom: "8px" }}>No orders yet</h3>
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
                                    You haven't placed any orders. Start exploring products!
                                </p>
                                <Link href="/shop" style={{
                                    display: "inline-block", padding: "12px 24px", borderRadius: "12px",
                                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                    color: "white", fontWeight: 700, fontSize: "14px", textDecoration: "none",
                                    boxShadow: "0 8px 20px rgba(99,102,241,0.3)"
                                }}>
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {orders.map((order: any) => {
                                    const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                                    const StatusIcon = st.icon;
                                    return (
                                        <div key={order.id} style={{
                                            background: "var(--bg-card)", border: "1px solid var(--border)",
                                            borderRadius: "16px", padding: "20px", transition: "transform 0.2s ease, border-color 0.2s ease",
                                        }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.4)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                                                <div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                                                        <span style={{ fontSize: "15px", fontWeight: 800, color: "white", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                                                            #{order.orderNumber}
                                                        </span>
                                                        <span style={{
                                                            fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "8px",
                                                            background: st.bg, color: st.color, display: "flex", alignItems: "center", gap: "4px"
                                                        }}>
                                                            <StatusIcon size={12} /> {st.label}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                                        Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>

                                                <div style={{ textAlign: "right" }}>
                                                    <div style={{ fontSize: "18px", fontWeight: 800, color: "white", marginBottom: "4px" }}>
                                                        $ / ৳{order.total.toLocaleString()}
                                                    </div>
                                                    <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                                                        {order.paymentMethod?.toLowerCase() === "cod" ? "Cash on Delivery" : "Digital Payment"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "16px 0" }} />

                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                                    <span style={{ color: "white", fontWeight: 600 }}>{order.items?.length || 0}</span> items in this order
                                                </div>

                                                <Link href={`/track?order=${order.orderNumber}&phone=${order.customerPhone}`} style={{
                                                    display: "flex", alignItems: "center", gap: "6px",
                                                    fontSize: "13px", fontWeight: 700, color: "#a78bfa", textDecoration: "none"
                                                }}>
                                                    Track Details <ChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
