"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { api } from "@/lib/apiClient";
import { Flag, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

export default function FeatureFlagsPage() {
    const [flags, setFlags] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ key: "", name: "", description: "", isEnabled: false, rolloutPercentage: 100 });

    const load = () => {
        api.admin.featureFlags.list()
            .then((res) => setFlags(res.data || []))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { load(); }, []);

    const toggle = async (flag: any) => {
        try {
            await api.admin.featureFlags.update(flag.id, { isEnabled: !flag.isEnabled });
            toast.success(`Flag "${flag.name}" ${!flag.isEnabled ? "enabled" : "disabled"}`);
            load();
        } catch { toast.error("Update failed"); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete flag "${name}"?`)) return;
        try {
            await api.admin.featureFlags.delete(id);
            toast.success("Flag deleted");
            load();
        } catch { toast.error("Delete failed"); }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.admin.featureFlags.create(form);
            toast.success("Feature flag created!");
            setShowForm(false);
            setForm({ key: "", name: "", description: "", isEnabled: false, rolloutPercentage: 100 });
            load();
        } catch (err: any) { toast.error(err.message); }
    };

    return (
        <AdminShell>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Flag size={22} className="text-[var(--primary)]" /> Feature Flags
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm">Control feature rollouts and A/B experiments</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
                    <Plus size={16} /> New Flag
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="glass-card p-6 mb-6 animate-fade-in">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-4">Create Feature Flag</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-[var(--text-muted)] mb-1">Flag Key (unique) *</label>
                            <input className="input-field text-sm" placeholder="e.g. new_checkout" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase().replace(/\s/g, "_") })} required />
                        </div>
                        <div>
                            <label className="block text-xs text-[var(--text-muted)] mb-1">Name *</label>
                            <input className="input-field text-sm" placeholder="Human readable name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs text-[var(--text-muted)] mb-1">Description</label>
                            <input className="input-field text-sm" placeholder="What does this flag control?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs text-[var(--text-muted)] mb-1">Rollout % ({form.rolloutPercentage}%)</label>
                            <input type="range" min="0" max="100" value={form.rolloutPercentage} onChange={(e) => setForm({ ...form, rolloutPercentage: parseInt(e.target.value) })} className="w-full accent-indigo-500" />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-sm text-[var(--text-secondary)]">Enabled by default?</label>
                            <button type="button" onClick={() => setForm({ ...form, isEnabled: !form.isEnabled })} className={form.isEnabled ? "text-[var(--success)]" : "text-[var(--text-muted)]"}>
                                {form.isEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button type="submit" className="btn-primary text-sm">Create Flag</button>
                        <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {isLoading ? (
                    [...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)
                ) : flags.map((flag: any) => (
                    <div key={flag.id} className="glass-card p-4 flex items-center gap-4">
                        <button onClick={() => toggle(flag)} className={`flex-shrink-0 transition-colors ${flag.isEnabled ? "text-[var(--success)]" : "text-[var(--text-muted)]"}`}>
                            {flag.isEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                        </button>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-[var(--text-primary)]">{flag.name}</p>
                                <span className="font-mono text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded">{flag.key}</span>
                                {flag.isEnabled ? (
                                    <span className="badge badge-success text-[10px]">Active — {flag.rolloutPercentage}%</span>
                                ) : (
                                    <span className="badge badge-ghost text-[10px]">Disabled</span>
                                )}
                            </div>
                            {flag.description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{flag.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-24">
                                <div className="text-xs text-[var(--text-muted)] mb-0.5">Rollout</div>
                                <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full">
                                    <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${flag.rolloutPercentage}%` }} />
                                </div>
                            </div>
                            <button onClick={() => handleDelete(flag.id, flag.name)} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-500/10">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </AdminShell>
    );
}
