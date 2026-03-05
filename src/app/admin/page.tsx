"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { api } from "@/lib/apiClient";
import {
    TrendingUp, ShoppingBag, Package, Users, AlertTriangle, Brain,
    ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Truck, XCircle, RotateCcw
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const STATUS_COLORS: Record<string, string> = {
    pending: "badge-warn",
    confirmed: "badge-primary",
    processing: "badge-primary",
    shipped: "badge-primary",
    delivered: "badge-success",
    cancelled: "badge-danger",
    returned: "badge-danger",
};

const STATUS_ICONS: Record<string, any> = {
    pending: Clock,
    confirmed: CheckCircle,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
    returned: RotateCcw,
};

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.admin.dashboard()
            .then((res) => setData(res.data))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const StatCard = ({ label, value, sub, icon: Icon, color, trend }: any) => (
        <div className="stat-card">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={20} />
                </div>
                {trend !== undefined && (
                    <span className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                        {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{value}</p>
            <p className="text-sm text-[var(--text-muted)]">{label}</p>
            {sub && <p className="text-xs text-[var(--text-secondary)] mt-1">{sub}</p>}
        </div>
    );

    if (isLoading) {
        return (
            <AdminShell>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[...Array(8)].map((_, i) => <div key={i} className="stat-card skeleton h-28" />)}
                </div>
            </AdminShell>
        );
    }

    const stats = data?.stats;
    const customTooltipStyle = {
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        color: "var(--text-primary)",
        fontSize: "12px",
    };

    return (
        <AdminShell>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Total Revenue" icon={TrendingUp}
                    value={`৳${(stats?.totalRevenue || 0).toLocaleString()}`}
                    sub={`This month: ৳${(stats?.monthRevenue || 0).toLocaleString()}`}
                    color="text-[var(--primary)] bg-[var(--primary-glow)]"
                    trend={stats?.revenueGrowth}
                />
                <StatCard
                    label="Total Orders" icon={ShoppingBag}
                    value={stats?.totalOrders || 0}
                    sub={`Today: ${stats?.todayOrders || 0} orders`}
                    color="text-[var(--success)] bg-[rgba(46,105,85,0.15)]"
                />
                <StatCard
                    label="Products" icon={Package}
                    value={stats?.totalProducts || 0}
                    sub={`Low stock: ${stats?.lowStockCount || 0}`}
                    color="text-[var(--warn)] bg-[rgba(194,136,62,0.15)]"
                />
                <StatCard
                    label="Customers" icon={Users}
                    value={stats?.totalUsers || 0}
                    color="text-[var(--secondary)] bg-[rgba(219,114,82,0.15)]"
                />
                <StatCard
                    label="Pending Orders" icon={Clock}
                    value={stats?.pendingOrders || 0}
                    color="text-[var(--warn)] bg-[rgba(194,136,62,0.15)]"
                />
                <StatCard
                    label="Fraud Suspects" icon={AlertTriangle}
                    value={stats?.fraudSuspects || 0}
                    sub="Require review"
                    color="text-[var(--danger)] bg-[rgba(179,74,64,0.15)]"
                />
                <StatCard
                    label="AI Suggestions" icon={Brain}
                    value={stats?.pendingAiSuggestions || 0}
                    sub="Pending approval"
                    color="text-[var(--secondary)] bg-[rgba(219,114,82,0.15)]"
                />
                <StatCard
                    label="Low Stock Items" icon={Package}
                    value={stats?.lowStockCount || 0}
                    sub="Need restocking"
                    color="text-[var(--danger)] bg-[rgba(179,74,64,0.15)]"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 glass-card p-6">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">Revenue — Last 7 Days</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-6">Daily revenue and order volume</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={data?.last7Days || []}>
                            <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                            <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={customTooltipStyle} />
                            <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#revenueGrad)" name="Revenue (৳)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Order Status */}
                <div className="glass-card p-6">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">Order Status Breakdown</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-6">All time</p>
                    <div className="space-y-3">
                        {Object.entries(data?.statusBreakdown || {}).map(([status, count]: [string, any]) => {
                            const Icon = STATUS_ICONS[status] || Package;
                            const total = stats?.totalOrders || 1;
                            const pct = Math.round((count / total) * 100);
                            return (
                                <div key={status}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <Icon size={13} className="text-[var(--text-muted)]" />
                                            <span className="text-xs text-[var(--text-secondary)] capitalize">{status}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-[var(--text-primary)]">{count}</span>
                                    </div>
                                    <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, background: status === "delivered" ? "var(--success)" : status === "cancelled" ? "var(--danger)" : "var(--primary)" }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 glass-card overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                        <h3 className="font-semibold text-[var(--text-primary)]">Recent Orders</h3>
                        <a href="/admin/orders" className="text-xs text-[var(--primary)] hover:text-[var(--primary-light)]">View all →</a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table-base">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Risk</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data?.recentOrders || []).slice(0, 6).map((order: any) => (
                                    <tr key={order.id}>
                                        <td>
                                            <a href={`/admin/orders/${order.id}`} className="text-[var(--primary)] hover:text-[var(--primary-light)] font-mono text-xs">
                                                {order.orderNumber}
                                            </a>
                                        </td>
                                        <td>
                                            <div>
                                                <p className="text-sm text-[var(--text-primary)]">{order.customerName}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{order.customerPhone}</p>
                                            </div>
                                        </td>
                                        <td className="font-semibold text-[var(--text-primary)]">৳{order.total.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${STATUS_COLORS[order.status?.toLowerCase()] || "badge-ghost"} text-[10px]`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`text-xs font-semibold ${order.riskScore >= 60 ? "risk-high" : order.riskScore >= 30 ? "risk-medium" : "risk-low"
                                                }`}>
                                                {order.riskScore}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    {/* Top Products */}
                    <div className="glass-card p-4">
                        <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-sm">Top Products</h3>
                        <div className="space-y-3">
                            {(data?.topProducts || []).slice(0, 4).map((p: any, i: number) => (
                                <div key={p.id} className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-[var(--text-muted)] w-4">{i + 1}</span>
                                    {p.image && <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-[var(--border)]" />}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{p.soldCount} sold</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Suggestions */}
                    <div className="glass-card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
                                <Brain size={15} className="text-[var(--secondary)]" /> AI Insights
                            </h3>
                            <a href="/admin/ai" className="text-xs text-[var(--primary)]">See all</a>
                        </div>
                        <div className="space-y-2">
                            {(data?.aiSuggestions || []).slice(0, 3).map((s: any) => (
                                <div key={s.id} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-xs font-medium text-[var(--text-primary)] leading-relaxed">{s.title}</p>
                                        <span className={`badge text-[9px] flex-shrink-0 ${s.impact === "high" ? "badge-danger" : s.impact === "medium" ? "badge-warn" : "badge-ghost"
                                            }`}>{s.impact}</span>
                                    </div>
                                    <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2">{s.description}</p>
                                </div>
                            ))}
                            {(!data?.aiSuggestions || data.aiSuggestions.length === 0) && (
                                <div className="text-center py-4 text-xs text-[var(--text-muted)]">
                                    <Brain size={24} className="mx-auto mb-2 opacity-30" />
                                    No pending suggestions
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
