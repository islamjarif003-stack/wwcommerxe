"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { api } from "@/lib/apiClient";
import { ShoppingBag, Search, Eye, ChevronDown, AlertTriangle, Truck } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
const STATUS_COLORS: Record<string, string> = {
    pending: "badge-warn", confirmed: "badge-primary", processing: "badge-primary",
    shipped: "badge-primary", delivered: "badge-success", cancelled: "badge-danger", returned: "badge-danger",
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [riskOnly, setRiskOnly] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [updating, setUpdating] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [note, setNote] = useState("");

    const load = (page = 1) => {
        setIsLoading(true);
        const params: Record<string, string> = { page: String(page), limit: "15" };
        if (status) params.status = status;
        if (search) params.search = search;
        if (riskOnly) params.risk = "true";
        api.admin.orders.list(params)
            .then((res) => {
                setOrders(res.data.items || []);
                setPagination({ page: res.data.page, total: res.data.total, totalPages: res.data.totalPages });
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { load(); }, [status, riskOnly]);

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); load(1); };

    const openDetail = async (id: string) => {
        try {
            const res = await api.admin.orders.get(id);
            setSelected(res.data.order);
            setNewStatus(res.data.order.status?.toLowerCase() || "");
        } catch { toast.error("Failed to load order"); }
    };

    const updateOrder = async () => {
        if (!selected) return;
        setUpdating(true);
        try {
            await api.admin.orders.update(selected.id, { status: newStatus, note });
            toast.success("Order updated!");
            setSelected(null);
            load(pagination.page);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <AdminShell>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <ShoppingBag size={24} className="text-[var(--primary)]" /> Orders
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm">{pagination.total} total orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="flex flex-wrap gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                className="input-field pl-9 text-sm h-10"
                                placeholder="Search order, customer, phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-primary text-sm py-2 px-4">Search</button>
                    </form>
                    <select
                        className="select-field w-auto text-sm h-10"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || "All Status"}</option>)}
                    </select>
                    <button
                        onClick={() => setRiskOnly(!riskOnly)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${riskOnly ? "bg-red-500/20 border-red-500/40 text-red-300" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                            }`}
                    >
                        <AlertTriangle size={14} /> Risk Only
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table-base">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Risk</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(9)].map((_, j) => <td key={j}><div className="skeleton h-4 rounded" /></td>)}
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-12 text-[var(--text-muted)]">No orders found</td>
                                </tr>
                            ) : (
                                orders.map((order: any) => (
                                    <tr key={order.id}>
                                        <td>
                                            <span className="font-mono text-xs text-[var(--primary)]">{order.orderNumber}</span>
                                        </td>
                                        <td>
                                            <div>
                                                <p className="text-sm text-[var(--text-primary)]">{order.customerName}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{order.customerPhone}</p>
                                            </div>
                                        </td>
                                        <td className="text-xs text-[var(--text-muted)]">{order.items.length} item(s)</td>
                                        <td className="font-semibold text-[var(--text-primary)]">৳{order.total.toLocaleString()}</td>
                                        <td>
                                            <span className="badge badge-ghost text-[10px] uppercase">{order.paymentMethod}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${STATUS_COLORS[order.status?.toLowerCase()] || "badge-ghost"} text-[10px]`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`text-xs font-bold ${order.riskScore >= 60 ? "text-[var(--danger)]" : order.riskScore >= 30 ? "text-[var(--warn)]" : "text-[var(--success)]"
                                                }`}>
                                                {order.riskScore}%
                                                {order.isFraudSuspect && " ⚠"}
                                            </span>
                                        </td>
                                        <td className="text-xs text-[var(--text-muted)]">
                                            {new Date(order.createdAt).toLocaleDateString("en-BD")}
                                        </td>
                                        <td>
                                            <button onClick={() => openDetail(order.id)} className="btn-secondary text-xs py-1 px-2">
                                                <Eye size={12} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
                        <p className="text-xs text-[var(--text-muted)]">Page {pagination.page} of {pagination.totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => load(pagination.page - 1)} disabled={pagination.page === 1} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Prev</button>
                            <button onClick={() => load(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/70 backdrop-blur-sm overflow-y-auto">
                    <div className="glass-card w-full max-w-2xl p-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">Order: {selected.orderNumber}</h2>
                                <p className="text-xs text-[var(--text-muted)]">{new Date(selected.createdAt).toLocaleString("en-BD")}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="btn-secondary text-xs py-1.5 px-3">✕ Close</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-xs text-[var(--text-muted)] mb-1">Customer</p>
                                <p className="text-sm font-semibold text-[var(--text-primary)]">{selected.customerName}</p>
                                <p className="text-xs text-[var(--text-secondary)]">{selected.customerPhone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[var(--text-muted)] mb-1">Delivery Address</p>
                                <p className="text-sm text-[var(--text-primary)]">{selected.shippingAddress?.addressLine}</p>
                                <p className="text-xs text-[var(--text-secondary)]">{selected.shippingAddress?.district}, {selected.shippingAddress?.zone}</p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="mb-6">
                            <p className="text-xs text-[var(--text-muted)] mb-3">Order Items</p>
                            {selected.items.map((item: any) => (
                                <div key={item.productId} className="flex gap-3 mb-2 bg-[var(--bg-elevated)] rounded-xl p-3">
                                    {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />}
                                    <div className="flex-1">
                                        <p className="text-sm text-[var(--text-primary)]">{item.name}</p>
                                        <p className="text-xs text-[var(--text-muted)]">×{item.quantity} · ৳{item.unitPrice.toLocaleString()} each</p>
                                    </div>
                                    <p className="font-bold text-[var(--text-primary)] text-sm">৳{item.totalPrice.toLocaleString()}</p>
                                </div>
                            ))}
                            <div className="flex justify-between text-sm font-bold mt-3 pt-3 border-t border-[var(--border)]">
                                <span className="text-[var(--text-muted)]">Total</span>
                                <span className="text-[var(--text-primary)]">৳{selected.total.toLocaleString()}</span>
                            </div>
                        </div>

                        {selected.riskScore >= 40 && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-6 flex items-start gap-2">
                                <AlertTriangle size={16} className="text-[var(--warn)] flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-300">Risk Score: {selected.riskScore}%</p>
                                    <p className="text-xs text-[var(--text-muted)]">Flags: {selected.riskFlags?.join(", ") || "none"}</p>
                                </div>
                            </div>
                        )}

                        {/* Update Status */}
                        <div className="border-t border-[var(--border)] pt-4">
                            <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Update Status</p>
                            <div className="flex gap-3">
                                <select className="select-field flex-1 text-sm h-10" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                    {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <button onClick={updateOrder} disabled={updating} className="btn-primary text-sm px-4 disabled:opacity-60">
                                    {updating ? "..." : "Update"}
                                </button>
                            </div>
                            <input
                                className="input-field mt-2 text-sm"
                                placeholder="Note (optional)"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </AdminShell>
    );
}
