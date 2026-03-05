"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
    Search, Package, Truck, CheckCircle, Clock, XCircle,
    RotateCcw, ArrowLeft, MapPin, CreditCard, ShoppingBag,
    ChevronRight, Sparkles,
} from "lucide-react";

const STATUS_STEPS = [
    { key: "pending", label: "Order Placed", icon: Clock, color: "#f59e0b" },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle, color: "#6366f1" },
    { key: "processing", label: "Processing", icon: Package, color: "#8b5cf6" },
    { key: "shipped", label: "Shipped", icon: Truck, color: "#3b82f6" },
    { key: "delivered", label: "Delivered", icon: CheckCircle, color: "#10b981" },
];

const STATUS_CANCELLED = ["cancelled", "returned"];

const STATUS_COLOR: Record<string, string> = {
    pending: "#f59e0b",
    confirmed: "#6366f1",
    processing: "#8b5cf6",
    shipped: "#3b82f6",
    delivered: "#10b981",
    cancelled: "#ef4444",
    returned: "#f43f5e",
};

const STATUS_BG: Record<string, string> = {
    pending: "rgba(245,158,11,0.1)",
    confirmed: "rgba(99,102,241,0.1)",
    processing: "rgba(139,92,246,0.1)",
    shipped: "rgba(59,130,246,0.1)",
    delivered: "rgba(16,185,129,0.1)",
    cancelled: "rgba(239,68,68,0.1)",
    returned: "rgba(244,63,94,0.1)",
};

function TrackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [orderNumber, setOrderNumber] = useState(searchParams.get("order") || "");
    const [phone, setPhone] = useState(searchParams.get("phone") || "");
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderNumber.trim() || !phone.trim()) {
            setError("Please enter both order number and phone number.");
            return;
        }
        setLoading(true);
        setError("");
        setOrder(null);
        setSearched(true);
        try {
            const res = await fetch(
                `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Order not found");
            setOrder(data.data ? {
                ...data.data,
                status: data.data.status?.toLowerCase(),
                statusHistory: data.data.statusHistory?.map((h: any) => ({ ...h, status: h.status?.toLowerCase() }))
            } : null);
        } catch (err: any) {
            setError(err.message || "Order not found. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    const currentStepIdx = order
        ? STATUS_CANCELLED.includes(order.status)
            ? -1
            : STATUS_STEPS.findIndex((s) => s.key === order.status)
        : -1;

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
            <Navbar />

            {/* Background */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{
                    position: "absolute", width: 600, height: 600,
                    borderRadius: "50%", top: "-200px", left: "-100px",
                    background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
                    filter: "blur(60px)",
                }} />
                <div style={{
                    position: "absolute", width: 500, height: 500,
                    borderRadius: "50%", bottom: "10%", right: "-100px",
                    background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
                    filter: "blur(60px)",
                }} />
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)`,
                    backgroundSize: "56px 56px",
                }} />
            </div>

            <div style={{ position: "relative", zIndex: 1, paddingTop: "100px", paddingBottom: "80px" }}>
                <div className="page-container" style={{ maxWidth: "760px" }}>

                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "48px" }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "7px 20px", borderRadius: "100px",
                            background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
                            fontSize: "12px", fontWeight: 700, color: "#a5b4fc",
                            marginBottom: "20px", letterSpacing: "0.5px",
                        }}>
                            <Sparkles size={12} /> ORDER TRACKING
                        </div>
                        <h1 style={{
                            fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 900,
                            color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1.1,
                            marginBottom: "14px",
                        }}>
                            Track Your{" "}
                            <span style={{
                                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            }}>Order</span>
                        </h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "15px", maxWidth: "440px", margin: "0 auto" }}>
                            Enter your order number and phone number to get real-time delivery updates.
                        </p>
                    </div>

                    {/* Search Card */}
                    <div style={{
                        background: "var(--bg-card)", border: "1px solid var(--border)",
                        borderRadius: "24px", padding: "36px", marginBottom: "32px",
                        boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
                    }}>
                        <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div className="track-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                                {/* Order Number */}
                                <div>
                                    <label style={{
                                        display: "block", fontSize: "12px", fontWeight: 700,
                                        color: "var(--text-muted)", marginBottom: "8px",
                                        textTransform: "uppercase", letterSpacing: "0.6px",
                                    }}>Order Number</label>
                                    <div style={{ position: "relative" }}>
                                        <ShoppingBag size={15} style={{
                                            position: "absolute", left: "14px", top: "50%",
                                            transform: "translateY(-50%)", color: "var(--text-muted)",
                                            pointerEvents: "none",
                                        }} />
                                        <input
                                            value={orderNumber}
                                            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                                            placeholder="WW-2025-XXXX"
                                            className="input-field"
                                            style={{ paddingLeft: "42px", fontFamily: "monospace", letterSpacing: "0.5px" }}
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label style={{
                                        display: "block", fontSize: "12px", fontWeight: 700,
                                        color: "var(--text-muted)", marginBottom: "8px",
                                        textTransform: "uppercase", letterSpacing: "0.6px",
                                    }}>Phone Number</label>
                                    <div style={{ position: "relative" }}>
                                        <span style={{
                                            position: "absolute", left: "14px", top: "50%",
                                            transform: "translateY(-50%)", color: "var(--text-muted)",
                                            fontSize: "13px", fontWeight: 600, pointerEvents: "none",
                                        }}>📞</span>
                                        <input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="01XXXXXXXXX"
                                            type="tel"
                                            className="input-field"
                                            style={{ paddingLeft: "42px" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "10px",
                                    padding: "12px 16px", borderRadius: "12px",
                                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                                    color: "#fca5a5", fontSize: "13px",
                                }}>
                                    <XCircle size={16} style={{ flexShrink: 0 }} />
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="btn-primary"
                                style={{
                                    justifyContent: "center", padding: "14px",
                                    fontSize: "15px", gap: "10px",
                                    opacity: loading ? 0.7 : 1,
                                }}>
                                {loading ? (
                                    <>
                                        <div style={{
                                            width: "18px", height: "18px", borderRadius: "50%",
                                            border: "2px solid rgba(255,255,255,0.3)",
                                            borderTopColor: "var(--text-primary)", animation: "spin 0.7s linear infinite",
                                        }} />
                                        Tracking...
                                    </>
                                ) : (
                                    <><Search size={17} /> Track Order</>
                                )}
                            </button>
                        </form>

                        {!order && !searched && (
                            <div style={{ textAlign: "center", marginTop: "20px" }}>
                                <button
                                    onClick={() => setShowForgotModal(true)}
                                    style={{
                                        background: "none", border: "none", cursor: "pointer",
                                        color: "#a5b4fc", fontSize: "14px", fontWeight: 600,
                                        textDecoration: "underline", textUnderlineOffset: "4px"
                                    }}
                                >
                                    Forgot Order Number?
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Result */}
                    {order && (
                        <div style={{ animation: "fadeUp 0.5s ease both" }}>

                            {/* Status Banner */}
                            <div style={{
                                background: STATUS_BG[order.status] || "rgba(99,102,241,0.1)",
                                border: `1px solid ${STATUS_COLOR[order.status] || "#6366f1"}30`,
                                borderRadius: "20px", padding: "24px 28px", marginBottom: "20px",
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                flexWrap: "wrap", gap: "12px",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                    <div style={{
                                        width: "52px", height: "52px", borderRadius: "14px", flexShrink: 0,
                                        background: `${STATUS_COLOR[order.status] || "#6366f1"}20`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        {STATUS_CANCELLED.includes(order.status)
                                            ? <XCircle size={26} color={STATUS_COLOR[order.status]} />
                                            : order.status === "delivered"
                                                ? <CheckCircle size={26} color="#10b981" />
                                                : order.status === "shipped"
                                                    ? <Truck size={26} color="#3b82f6" />
                                                    : <Package size={26} color={STATUS_COLOR[order.status]} />
                                        }
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "3px" }}>
                                            Order #{order.orderNumber}
                                        </p>
                                        <p style={{ fontSize: "22px", fontWeight: 900, color: "var(--text-primary)" }}>
                                            {order.status === "delivered" ? "🎉 Delivered!" :
                                                order.status === "shipped" ? "📦 On the Way" :
                                                    order.status === "cancelled" ? "❌ Cancelled" :
                                                        order.status === "returned" ? "↩️ Returned" :
                                                            order.status === "processing" ? "⚙️ Processing" :
                                                                order.status === "confirmed" ? "✅ Confirmed" :
                                                                    "🕐 Order Placed"}
                                        </p>
                                    </div>
                                </div>
                                <span style={{
                                    padding: "8px 18px", borderRadius: "100px",
                                    background: `${STATUS_COLOR[order.status] || "#6366f1"}20`,
                                    border: `1px solid ${STATUS_COLOR[order.status] || "#6366f1"}40`,
                                    color: STATUS_COLOR[order.status] || "#a5b4fc",
                                    fontSize: "13px", fontWeight: 800, textTransform: "capitalize",
                                }}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Progress Timeline */}
                            {!STATUS_CANCELLED.includes(order.status) && (
                                <div style={{
                                    background: "var(--bg-card)", border: "1px solid var(--border)",
                                    borderRadius: "20px", padding: "28px", marginBottom: "20px",
                                }}>
                                    <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "24px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                                        Delivery Progress
                                    </p>
                                    <div style={{ position: "relative" }}>
                                        {/* Line */}
                                        <div style={{
                                            position: "absolute", left: "19px", top: "24px",
                                            width: "2px",
                                            height: `calc(100% - 48px)`,
                                            background: "var(--border)",
                                        }} />
                                        <div style={{
                                            position: "absolute", left: "19px", top: "24px",
                                            width: "2px",
                                            height: `${Math.min(100, ((currentStepIdx) / (STATUS_STEPS.length - 1)) * 100)}%`,
                                            background: "linear-gradient(to bottom, #6366f1, #10b981)",
                                            transition: "height 1s ease",
                                        }} />

                                        {/* Steps */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                                            {STATUS_STEPS.map((step, idx) => {
                                                const done = idx <= currentStepIdx;
                                                const current = idx === currentStepIdx;
                                                const Icon = step.icon;
                                                const histEntry = order.statusHistory?.find((h: any) => h.status === step.key);
                                                return (
                                                    <div key={step.key} style={{
                                                        display: "flex", alignItems: "flex-start", gap: "16px",
                                                        paddingBottom: idx < STATUS_STEPS.length - 1 ? "28px" : "0",
                                                        position: "relative", zIndex: 1,
                                                    }}>
                                                        {/* Dot */}
                                                        <div style={{
                                                            width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            background: done ? step.color : "var(--bg-elevated)",
                                                            border: current ? `2px solid ${step.color}` : done ? "none" : "2px solid var(--border)",
                                                            boxShadow: current ? `0 0 16px ${step.color}50` : "none",
                                                            transition: "all 0.4s ease",
                                                        }}>
                                                            <Icon size={18} color={done ? "white" : "var(--text-muted)"} />
                                                        </div>

                                                        {/* Info */}
                                                        <div style={{ paddingTop: "8px" }}>
                                                            <p style={{
                                                                fontSize: "14px", fontWeight: done ? 700 : 500,
                                                                color: done ? "white" : "var(--text-muted)",
                                                            }}>{step.label}</p>
                                                            {histEntry && (
                                                                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                                                    {new Date(histEntry.timestamp).toLocaleString("en-BD", {
                                                                        dateStyle: "medium", timeStyle: "short",
                                                                    })}
                                                                </p>
                                                            )}
                                                            {current && (
                                                                <span style={{
                                                                    display: "inline-block", marginTop: "4px",
                                                                    fontSize: "11px", fontWeight: 700,
                                                                    padding: "2px 10px", borderRadius: "100px",
                                                                    background: `${step.color}20`,
                                                                    color: step.color,
                                                                    border: `1px solid ${step.color}30`,
                                                                }}>● Current Status</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Order Details Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                                {/* Delivery Info */}
                                <div style={{
                                    background: "var(--bg-card)", border: "1px solid var(--border)",
                                    borderRadius: "16px", padding: "20px",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                                        <MapPin size={15} color="#6366f1" />
                                        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                            Delivery To
                                        </p>
                                    </div>
                                    <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "15px" }}>{order.customerName}</p>
                                    <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
                                        {order.zone && `${order.zone}, `}{order.district}
                                    </p>
                                </div>

                                {/* Payment */}
                                <div style={{
                                    background: "var(--bg-card)", border: "1px solid var(--border)",
                                    borderRadius: "16px", padding: "20px",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                                        <CreditCard size={15} color="#8b5cf6" />
                                        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                            Payment
                                        </p>
                                    </div>
                                    <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "15px", textTransform: "uppercase" }}>
                                        {order.paymentMethod}
                                    </p>
                                    <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px", textTransform: "capitalize" }}>
                                        {order.paymentStatus}
                                    </p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div style={{
                                background: "var(--bg-card)", border: "1px solid var(--border)",
                                borderRadius: "20px", overflow: "hidden", marginBottom: "20px",
                            }}>
                                <div style={{
                                    padding: "16px 20px", borderBottom: "1px solid var(--border)",
                                    display: "flex", alignItems: "center", gap: "8px",
                                }}>
                                    <Package size={15} color="var(--text-muted)" />
                                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                                        {order.itemCount} Item{order.itemCount !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {order.items.map((item: any, i: number) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            {item.image && (
                                                <img src={item.image} alt={item.name} style={{
                                                    width: "44px", height: "44px", borderRadius: "10px",
                                                    objectFit: "cover", flexShrink: 0,
                                                    border: "1px solid var(--border)",
                                                }} />
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {item.name}
                                                </p>
                                                {item.attributes && Object.keys(item.attributes).length > 0 && (
                                                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                                                        {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")}
                                                    </p>
                                                )}
                                            </div>
                                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                                                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                                                    ৳{item.totalPrice.toLocaleString()}
                                                </p>
                                                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>×{item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div style={{
                                    borderTop: "1px solid var(--border)",
                                    padding: "16px 20px", display: "flex", flexDirection: "column", gap: "8px",
                                }}>
                                    {[
                                        { label: "Subtotal", value: `৳${order.subtotal?.toLocaleString() || 0}` },
                                        { label: "Delivery", value: order.deliveryCharge === 0 ? "FREE" : `৳${order.deliveryCharge}` },
                                        ...(order.discount > 0 ? [{ label: "Discount", value: `-৳${order.discount}` }] : []),
                                    ].map((row) => (
                                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{row.label}</span>
                                            <span style={{ fontSize: "13px", color: row.label === "Discount" ? "#34d399" : "var(--text-secondary)" }}>{row.value}</span>
                                        </div>
                                    ))}
                                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid var(--border)", marginTop: "4px" }}>
                                        <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>Total</span>
                                        <span style={{ fontSize: "17px", fontWeight: 900, background: "linear-gradient(135deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                            ৳{order.total?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                                <Link href="/shop" className="btn-secondary" style={{ fontSize: "14px", padding: "11px 24px" }}>
                                    <ArrowLeft size={15} /> Continue Shopping
                                </Link>
                                <button onClick={() => { setOrder(null); setSearched(false); setOrderNumber(""); setPhone(""); }}
                                    className="btn-ghost" style={{ fontSize: "14px", padding: "11px 24px" }}>
                                    <Search size={15} /> Track Another
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty — after search but no result */}
                    {searched && !order && !loading && !error && (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                            <Package size={48} style={{ margin: "0 auto 16px", color: "var(--text-muted)", opacity: 0.4 }} />
                            <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>No order found.</p>
                        </div>
                    )}

                    {/* Help Text */}
                    {!order && !searched && (
                        <div style={{
                            background: "var(--bg-card)", border: "1px solid var(--border)",
                            borderRadius: "16px", padding: "20px 24px",
                            display: "flex", alignItems: "flex-start", gap: "14px",
                        }}>
                            <div style={{
                                width: "36px", height: "36px", borderRadius: "10px",
                                background: "rgba(99,102,241,0.12)", flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <ChevronRight size={18} color="#818cf8" />
                            </div>
                            <div>
                                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                                    Where to find your Order Number?
                                </p>
                                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                                    Your order number starts with <strong style={{ color: "#a5b4fc" }}>WW-</strong> and was sent to you after placing your order.
                                    Check your email or the order confirmation page. Use the same phone number you provided during checkout.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Forgot Order Number Modal */}
            {showForgotModal && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 100,
                    background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
                }}>
                    <div style={{
                        background: "var(--bg-card)", border: "1px solid var(--border)",
                        borderRadius: "24px", padding: "32px", maxWidth: "420px", width: "100%",
                        position: "relative", animation: "fadeUp 0.3s ease",
                        boxShadow: "0 24px 80px rgba(0,0,0,0.5)"
                    }}>
                        <button
                            onClick={() => setShowForgotModal(true)}
                            style={{ display: "none" }}
                        />
                        <button
                            onClick={() => setShowForgotModal(false)}
                            style={{
                                position: "absolute", top: "20px", right: "20px",
                                background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer"
                            }}
                        >
                            <XCircle size={22} />
                        </button>

                        <div style={{
                            width: "56px", height: "56px", borderRadius: "16px",
                            background: "rgba(99,102,241,0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            marginBottom: "20px"
                        }}>
                            <Search size={28} color="#818cf8" />
                        </div>

                        <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
                            Lost your Order Number?
                        </h3>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.6" }}>
                            Don't worry! Here is how you can find it:
                        </p>

                        <ul style={{ paddingLeft: "20px", margin: "0 0 24px", color: "var(--text-primary)", fontSize: "14px", lineHeight: "1.8", listStyleType: "circle" }}>
                            <li>Check the <b>Email address</b> you provided during checkout for your order receipt.</li>
                            <li>Check your <b>SMS</b> messages.</li>
                            <li>If you still can't find it, please contact our support team with your phone number.</li>
                        </ul>

                        <a href="tel:+8801XXXXXXXXX" className="btn-primary" style={{ display: "flex", justifyContent: "center", textDecoration: "none" }}>
                            Call Support
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TrackPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "#6366f1", animation: "spin 0.8s linear infinite" }} />
            </div>
        }>
            <TrackContent />
        </Suspense>
    );
}
