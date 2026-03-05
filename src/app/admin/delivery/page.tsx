"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { api } from "@/lib/apiClient";
import { Truck, Plus, Edit, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { usePrice } from "@/hooks/usePrice";

export default function AdminDeliveryPage() {
    const { formatPrice } = usePrice();
    const [zones, setZones] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", type: "outside_dhaka", baseCharge: "", freeDeliveryThreshold: "", estimatedDays: "3-5 days", districts: "", couriers: "" });

    const load = () => {
        api.admin.deliveryZones.list()
            .then((res) => setZones(res.data || []))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.admin.deliveryZones.create({
                ...form,
                baseCharge: parseFloat(form.baseCharge),
                freeDeliveryThreshold: form.freeDeliveryThreshold ? parseFloat(form.freeDeliveryThreshold) : undefined,
                districts: form.districts.split(",").map((d) => d.trim()).filter(Boolean),
                couriers: form.couriers.split(",").map((c) => c.trim()).filter(Boolean),
            });
            toast.success("Delivery zone created!");
            setShowForm(false);
            load();
        } catch (e: any) { toast.error(e.message); }
    };

    const TYPE_COLORS: Record<string, string> = {
        dhaka_city: "badge-primary",
        dhaka_district: "badge-warn",
        outside_dhaka: "badge-ghost",
        custom: "badge-success",
    };

    return (
        <AdminShell>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Truck size={22} className="text-[var(--primary)]" /> Delivery Zones
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm">Bangladesh courier routing & delivery configuration</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
                    <Plus size={16} /> New Zone
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="glass-card p-6 mb-6 animate-fade-in">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-4">Create Delivery Zone</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-[var(--text-muted)] mb-1">Zone Name *</label>
                            <input className="input-field text-sm" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sylhet Division" />
                        </div>
                        <div>
                            <label className="block text-xs text-[var(--text-muted)] mb-1">Type</label>
                            <select className="select-field text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                <option value="dhaka_city">Dhaka City</option>
                                <option value="dhaka_district">Dhaka District</option>
                                <option value="outside_dhaka">Outside Dhaka</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-[var(--text-muted)] mb-1">Base Charge (৳) *</label>
                            <input className="input-field text-sm" required type="number" value={form.baseCharge} onChange={(e) => setForm({ ...form, baseCharge: e.target.value })} placeholder="120" />
                        </div>
                        <div>
                            <label className="block text-xs text-[var(--text-muted)] mb-1">Free Delivery Threshold (৳)</label>
                            <input className="input-field text-sm" type="number" value={form.freeDeliveryThreshold} onChange={(e) => setForm({ ...form, freeDeliveryThreshold: e.target.value })} placeholder="Optional" />
                        </div>
                        <div>
                            <label className="block text-xs text-[var(--text-muted)] mb-1">Estimated Days</label>
                            <input className="input-field text-sm" value={form.estimatedDays} onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })} placeholder="3-5 days" />
                        </div>
                        <div>
                            <label className="block text-xs text-[var(--text-muted)] mb-1">Districts (comma separated)</label>
                            <input className="input-field text-sm" value={form.districts} onChange={(e) => setForm({ ...form, districts: e.target.value })} placeholder="Sylhet, Moulvibazar, Habiganj" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs text-[var(--text-muted)] mb-1">Couriers (comma separated)</label>
                            <input className="input-field text-sm" value={form.couriers} onChange={(e) => setForm({ ...form, couriers: e.target.value })} placeholder="Pathao, Paperfly, Sundarban" />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button type="submit" className="btn-primary text-sm">Create Zone</button>
                        <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {isLoading ? (
                    [...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)
                ) : zones.map((zone: any) => (
                    <div key={zone.id} className="glass-card p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <h3 className="font-semibold text-[var(--text-primary)]">{zone.name}</h3>
                                    <span className={`badge ${TYPE_COLORS[zone.type] || "badge-ghost"} text-[10px]`}>{zone.type.replace(/_/g, " ")}</span>
                                    {zone.isActive ? (
                                        <span className="badge badge-success text-[10px]">Active</span>
                                    ) : (
                                        <span className="badge badge-danger text-[10px]">Inactive</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)]">Base Charge</p>
                                        <p className="font-bold text-[var(--text-primary)]">{formatPrice(zone.baseCharge)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)]">Free Delivery</p>
                                        <p className="font-semibold text-[var(--success)]">
                                            {zone.freeDeliveryThreshold ? `Over ${formatPrice(zone.freeDeliveryThreshold)}` : "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)]">Est. Days</p>
                                        <p className="text-[var(--text-primary)]">{zone.estimatedDays}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)]">Orders / Success</p>
                                        <p className="text-[var(--text-primary)]">{zone.totalOrders || 0} / {zone.successRate || 0}%</p>
                                    </div>
                                </div>
                                {zone.districts?.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {zone.districts.slice(0, 6).map((d: string) => (
                                            <span key={d} className="badge badge-ghost text-[10px]">{d}</span>
                                        ))}
                                        {zone.districts.length > 6 && <span className="text-xs text-[var(--text-muted)]">+{zone.districts.length - 6} more</span>}
                                    </div>
                                )}
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {(zone.couriers || []).map((c: string) => (
                                        <span key={c} className="badge badge-primary text-[10px]">🚚 {c}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AdminShell>
    );
}
