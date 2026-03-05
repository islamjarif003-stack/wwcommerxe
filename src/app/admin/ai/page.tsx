"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { api } from "@/lib/apiClient";
import {
    Brain, RefreshCw, TrendingUp, Package, Truck, Lightbulb,
    AlertTriangle, Users, BarChart2, ChevronRight, Zap,
    ArrowUpRight, ArrowDownRight, CheckCircle, Clock, XCircle,
    Target, ShoppingBag, Activity, Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import { usePrice } from "@/hooks/usePrice";

// ── Tabs ─────────────────────────────────────────────────────
const TABS = [
    { id: "suggestions", label: "AI Insights", icon: Brain },
    { id: "inventory", label: "Inventory Alerts", icon: Package },
    { id: "pricing", label: "Price Intelligence", icon: TrendingUp },
    { id: "customers", label: "Customer Segments", icon: Users },
];

// ── Type badges ───────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
    pricing: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", icon: TrendingUp, label: "Pricing" },
    delivery: { color: "#60a5fa", bg: "rgba(96,165,250,0.1)", icon: Truck, label: "Delivery" },
    inventory: { color: "#f87171", bg: "rgba(248,113,113,0.1)", icon: Package, label: "Inventory" },
    ui: { color: "#c084fc", bg: "rgba(192,132,252,0.1)", icon: Lightbulb, label: "UX/UI" },
    marketing: { color: "#34d399", bg: "rgba(52,211,153,0.1)", icon: Target, label: "Marketing" },
    gemini: { color: "#ec4899", bg: "rgba(236,72,153,0.1)", icon: Sparkles, label: "Gemini AI" },
};

const IMPACT: Record<string, { color: string; label: string }> = {
    high: { color: "#f87171", label: "High Impact" },
    medium: { color: "#fbbf24", label: "Medium Impact" },
    low: { color: "#6b7280", label: "Low Impact" },
};

const SEGMENT_CONFIG: Record<string, { color: string; bg: string; emoji: string }> = {
    CHAMPIONS: { color: "#fbbf24", bg: "rgba(251,191,36,0.15)", emoji: "🏆" },
    LOYAL: { color: "#34d399", bg: "rgba(52,211,153,0.12)", emoji: "💚" },
    AT_RISK: { color: "#f87171", bg: "rgba(248,113,113,0.12)", emoji: "⚠️" },
    LOST: { color: "#6b7280", bg: "rgba(107,114,128,0.12)", emoji: "😴" },
    NEW: { color: "#818cf8", bg: "rgba(129,140,248,0.12)", emoji: "✨" },
    PROMISING: { color: "#60a5fa", bg: "rgba(96,165,250,0.12)", emoji: "🌱" },
};

// ── Card wrapper ──────────────────────────────────────────────
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "20px", ...style
        }}>
            {children}
        </div>
    );
}

export default function AIPage() {
    const { formatPrice } = usePrice();
    const [activeTab, setActiveTab] = useState("suggestions");
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [filterType, setFilterType] = useState("");
    const [stats, setStats] = useState({ total: 0, high: 0, medium: 0 });

    const load = async (tab = activeTab) => {
        setIsLoading(true);
        try {
            const params: Record<string, string> = { mode: tab };
            if (tab === "suggestions" && filterType) params.type = filterType;
            const res = await api.admin.aiSuggestions.list(params);
            setData(res.data);
            if (res.data?.items) {
                const items = res.data.items;
                setStats({
                    total: items.length,
                    high: items.filter((i: any) => i.impact === "high" || i.alertType === "CRITICAL_STOCKOUT").length,
                    medium: items.filter((i: any) => i.impact === "medium" || i.alertType === "LOW_STOCK").length,
                });
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to load AI data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { load(); }, [activeTab, filterType]);

    const runAI = async () => {
        setIsRunning(true);
        try {
            const res = await api.admin.aiSuggestions.run();
            toast.success(`✅ AI generated ${res.data.generated} insights!`);
            load();
        } catch {
            toast.error("AI analysis failed");
        } finally {
            setIsRunning(false);
        }
    };

    const items = data?.items || [];

    return (
        <AdminShell>
            {/* ── Header ─────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(99,102,241,0.3)" }}>
                            <Brain size={22} style={{ color: "#a78bfa" }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>AI Intelligence</h1>
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>Real-time analytics from your 10,000+ product catalog</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={runAI}
                    disabled={isRunning}
                    style={{
                        display: "flex", alignItems: "center", gap: "8px", padding: "11px 20px",
                        borderRadius: "12px", border: "none", cursor: "pointer", fontFamily: "inherit",
                        fontWeight: 700, fontSize: "14px", color: "var(--text-primary)",
                        background: isRunning ? "var(--bg-hover)" : "linear-gradient(135deg, #6366f1, #a855f7)",
                        transition: "all 0.2s ease",
                    }}
                >
                    {isRunning ? <><Activity size={16} style={{ animation: "spin 1s linear infinite" }} /> Analyzing...</> : <><Zap size={16} /> Run AI Analysis</>}
                </button>
            </div>

            {/* ── Stats Bar ──────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
                {[
                    { label: "Total Insights", value: stats.total, color: "#818cf8", icon: Brain },
                    { label: "High Priority", value: stats.high, color: "#f87171", icon: AlertTriangle },
                    { label: "Medium Priority", value: stats.medium, color: "#fbbf24", icon: Clock },
                ].map((s) => (
                    <Card key={s.label} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <s.icon size={18} style={{ color: s.color }} />
                        </div>
                        <div>
                            <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>{s.label}</div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* ── Tabs ───────────────────────────────────────── */}
            <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--bg-card)", borderRadius: "14px", padding: "4px", border: "1px solid var(--border)" }}>
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setFilterType(""); }}
                        style={{
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer",
                            fontFamily: "inherit", fontWeight: 600, fontSize: "13px", transition: "all 0.2s ease",
                            background: activeTab === tab.id ? "rgba(99,102,241,0.25)" : "transparent",
                            color: activeTab === tab.id ? "#a78bfa" : "var(--text-muted)",
                        }}
                    >
                        <tab.icon size={15} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Type filter (for suggestions tab) ─────────── */}
            {activeTab === "suggestions" && (
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", marginBottom: "16px", scrollbarWidth: "none" }}>
                        <button
                            onClick={() => setFilterType("")}
                            style={{
                                padding: "6px 16px", borderRadius: "100px", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap",
                                background: filterType === "" ? "linear-gradient(135deg, #6366f1, #818cf8)" : "var(--bg-elevated)",
                                color: filterType === "" ? "var(--text-primary)" : "var(--text-muted)",
                            }}
                        >
                            All Types
                        </button>
                        {["gemini", "pricing", "delivery", "inventory", "ui", "marketing"].map((t) => {
                            const tc = TYPE_CONFIG[t];
                            return (
                                <button
                                    key={t}
                                    onClick={() => setFilterType(t)}
                                    style={{
                                        padding: "6px 16px", borderRadius: "100px", border: "none", cursor: "pointer",
                                        fontFamily: "inherit", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap",
                                        background: filterType === t ? tc.bg : "var(--bg-elevated)",
                                        color: filterType === t ? tc.color : "var(--text-muted)",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {tc.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Content ────────────────────────────────────── */}
            {isLoading ? (
                <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
                    <Activity size={32} style={{ animation: "spin 1s linear infinite", marginBottom: "12px" }} />
                    <div>Running AI analysis...</div>
                </div>
            ) : items.length === 0 ? (
                <Card style={{ textAlign: "center", padding: "60px" }}>
                    <Brain size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
                    <div style={{ color: "var(--text-muted)", fontSize: "15px" }}>No insights yet. Click "Run AI Analysis" to generate.</div>
                </Card>
            ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                    {/* ── AI Suggestions ── */}
                    {activeTab === "suggestions" && items.map((item: any, i: number) => {
                        const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.marketing;
                        const ic = IMPACT[item.impact] || IMPACT.medium;
                        return (
                            <Card key={i} style={{ position: "relative", overflow: "hidden" }}>
                                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: tc.color, borderRadius: "16px 0 0 16px" }} />
                                <div style={{ paddingLeft: "8px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "10px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: tc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <tc.icon size={16} style={{ color: tc.color }} />
                                            </div>
                                            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{item.title}</h3>
                                        </div>
                                        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                                            <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", background: tc.bg, color: tc.color }}>{tc.label}</span>
                                            <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", background: `${ic.color}15`, color: ic.color }}>{ic.label}</span>
                                            <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px", background: "var(--bg-hover)", color: "var(--text-muted)" }}>
                                                {item.confidence}% confidence
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: 1.7 }}>{item.description}</p>
                                    {typeof item.expectedRevenueLift === "number" && (
                                        <div style={{ marginTop: "10px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#34d399", fontWeight: 700, background: "rgba(52,211,153,0.08)", padding: "5px 12px", borderRadius: "8px" }}>
                                            <ArrowUpRight size={13} /> Est. +{item.expectedRevenueLift}% revenue
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}

                    {/* ── Inventory Alerts ── */}
                    {activeTab === "inventory" && items.map((item: any, i: number) => {
                        const isOut = item.alertType === "CRITICAL_STOCKOUT";
                        const isDead = item.alertType === "DEAD_STOCK";
                        const color = isOut ? "#f87171" : isDead ? "#6b7280" : "#fbbf24";
                        return (
                            <Card key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                                    <Package size={18} style={{ color }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                                        <div>
                                            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>{item.productName}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>SKU: {item.sku}</div>
                                        </div>
                                        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                                            <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", background: `${color}18`, color }}>
                                                {isOut ? "OUT OF STOCK" : isDead ? "DEAD STOCK" : "LOW STOCK"}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "16px", marginTop: "10px", flexWrap: "wrap" }}>
                                        {[
                                            { label: "Stock", value: item.currentStock },
                                            { label: "Threshold", value: item.threshold },
                                            { label: "7d Sales", value: item.velocity7d },
                                            item.daysUntilStockout != null && { label: "Days Left", value: item.daysUntilStockout },
                                        ].filter(Boolean).map((m: any) => (
                                            <div key={m.label} style={{ background: "var(--bg-elevated)", borderRadius: "8px", padding: "6px 12px", textAlign: "center" }}>
                                                <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{m.value}</div>
                                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: "10px", fontSize: "13px", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "8px", padding: "10px 14px" }}>
                                        {item.action}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}

                    {/* ── Pricing Insights ── */}
                    {activeTab === "pricing" && items.map((item: any, i: number) => (
                        <Card key={i} style={{ display: "flex", gap: "16px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(251,191,36,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <TrendingUp size={18} style={{ color: "#fbbf24" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{item.productName}</div>
                                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399", background: "rgba(52,211,153,0.1)", padding: "4px 10px", borderRadius: "6px", flexShrink: 0 }}>
                                        <ArrowUpRight size={10} style={{ display: "inline" }} /> +{item.expectedRevenueLift}% est.
                                    </span>
                                </div>
                                <div style={{ display: "flex", gap: "12px", margin: "10px 0", flexWrap: "wrap" }}>
                                    <div style={{ background: "var(--bg-elevated)", borderRadius: "8px", padding: "8px 14px" }}>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Current</div>
                                        <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>{formatPrice(item.currentPrice?.toLocaleString())}</div>
                                    </div>
                                    {item.suggestedPrice !== item.currentPrice && (
                                        <>
                                            <div style={{ display: "flex", alignItems: "center", color: "var(--text-muted)", fontSize: "20px" }}>→</div>
                                            <div style={{ background: "rgba(52,211,153,0.08)", borderRadius: "8px", padding: "8px 14px", border: "1px solid rgba(52,211,153,0.2)" }}>
                                                <div style={{ fontSize: "11px", color: "rgba(52,211,153,0.7)" }}>Suggested</div>
                                                <div style={{ fontSize: "18px", fontWeight: 800, color: "#34d399" }}>{formatPrice(item.suggestedPrice?.toLocaleString())}</div>
                                            </div>
                                        </>
                                    )}
                                    <div style={{ background: "var(--bg-elevated)", borderRadius: "8px", padding: "8px 14px" }}>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Confidence</div>
                                        <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>{item.confidence}%</div>
                                    </div>
                                </div>
                                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>{item.reason}</p>
                            </div>
                        </Card>
                    ))}

                    {/* ── Customer Segments ── */}
                    {activeTab === "customers" && (
                        <>
                            {/* Segment summary */}
                            {data?.grouped && (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px", marginBottom: "12px" }}>
                                    {Object.entries(data.grouped).map(([seg, count]: any) => {
                                        const sc = SEGMENT_CONFIG[seg] || { color: "#6b7280", bg: "rgba(107,114,128,0.1)", emoji: "👤" };
                                        return (
                                            <Card key={seg} style={{ textAlign: "center", padding: "14px" }}>
                                                <div style={{ fontSize: "24px", marginBottom: "6px" }}>{sc.emoji}</div>
                                                <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>{count}</div>
                                                <div style={{ fontSize: "11px", fontWeight: 700, color: sc.color, marginTop: "3px" }}>{seg}</div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                            {/* Customer list */}
                            {items.map((c: any, i: number) => {
                                const sc = SEGMENT_CONFIG[c.segment] || { color: "#6b7280", bg: "rgba(107,114,128,0.1)", emoji: "👤" };
                                return (
                                    <Card key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", flexWrap: "wrap", gap: "12px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{sc.emoji}</div>
                                            <div>
                                                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{c.name}</div>
                                                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{c.email}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                                            {[
                                                { label: "Segment", value: c.segment, color: sc.color },
                                                { label: "Orders", value: c.orderCount },
                                                { label: "Spent", value: formatPrice(c.totalSpent?.toLocaleString()) },
                                                { label: "RFM", value: `${c.rfmScore}/15` },
                                                { label: "Last Order", value: `${c.daysSinceLastOrder}d ago` },
                                            ].map((m: any) => (
                                                <div key={m.label} style={{ textAlign: "center" }}>
                                                    <div style={{ fontSize: "13px", fontWeight: 700, color: m.color || "var(--text-primary)" }}>{m.value}</div>
                                                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "8px", padding: "6px 12px", maxWidth: "280px" }}>
                                            {c.recommendation}
                                        </div>
                                    </Card>
                                );
                            })}
                        </>
                    )}
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </AdminShell>
    );
}
