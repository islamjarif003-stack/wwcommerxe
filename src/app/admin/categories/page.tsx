"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { FolderTree, Plus, Edit, Trash2, ChevronRight, X, Check, Layers, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<any>(null);
    const [form, setForm] = useState({
        name: "", slug: "", description: "", icon: "", parentId: "", sortOrder: "0", isActive: true,
    });

    const token = () => useAuthStore.getState().token || "";

    const load = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/categories", {
                headers: {
                    Authorization: `Bearer ${token()}`
                }
            });
            const data = await res.json();
            if (data.success) setCategories(data.data);
        } finally { setIsLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openCreate = (parentId = "") => {
        setEditTarget(null);
        setForm({ name: "", slug: "", description: "", icon: "", parentId, sortOrder: "0", isActive: true });
        setModalOpen(true);
    };

    const openEdit = (cat: any) => {
        setEditTarget(cat);
        setForm({
            name: cat.name, slug: cat.slug, description: cat.description || "",
            icon: cat.icon || "", parentId: cat.parentId || "",
            sortOrder: String(cat.sortOrder), isActive: cat.isActive,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...form, sortOrder: parseInt(form.sortOrder) || 0,
            parentId: form.parentId || null,
        };
        try {
            const url = editTarget ? `/api/admin/categories/${editTarget.id}` : "/api/admin/categories";
            const method = editTarget ? "PUT" : "POST";
            const res = await fetch(url, {
                method, body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editTarget ? "Category updated!" : "Category created!");
                setModalOpen(false);
                load();
            } else { toast.error(data.message || data.error || "Failed"); }
        } catch { toast.error("Request failed"); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? Products in this category will need to be reassigned.`)) return;
        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token()}` },
            });
            const data = await res.json();
            if (data.success) { toast.success("Deleted"); load(); }
            else toast.error(data.message || "Failed");
        } catch { toast.error("Request failed"); }
    };

    const autoSlug = (name: string) =>
        name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

    return (
        <AdminShell>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <FolderTree size={22} className="text-purple-400" /> Categories
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm">Manage your category tree</p>
                </div>
                <button onClick={() => openCreate()} className="btn-primary text-sm">
                    <Plus size={16} /> Add Root Category
                </button>
            </div>

            {isLoading ? (
                <div style={{ display: "grid", gap: "12px" }}>
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "12px" }} />)}
                </div>
            ) : categories.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Layers size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
                    <p className="text-[var(--text-primary)] font-semibold mb-2">No categories yet</p>
                    <p className="text-[var(--text-muted)] text-sm mb-6">Create your first category to organize products</p>
                    <button onClick={() => openCreate()} className="btn-primary text-sm">
                        <Plus size={14} /> Create First Category
                    </button>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {categories.map((cat) => (
                        <div key={cat.id}>
                            {/* Root Category */}
                            <div className="glass-card p-4" style={{ display: "flex", alignItems: "center", gap: "14px", borderLeft: "3px solid rgba(168,85,247,0.5)" }}>
                                <div style={{
                                    width: "40px", height: "40px", borderRadius: "10px",
                                    background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "20px", flexShrink: 0,
                                }}>
                                    {cat.icon || "📁"}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <p className="font-semibold text-[var(--text-primary)]">{cat.name}</p>
                                        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "100px", background: "rgba(168,85,247,0.15)", color: "#c084fc" }}>
                                            /{cat.slug}
                                        </span>
                                        {!cat.isActive && <span className="badge-status" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: "10px", padding: "2px 7px", borderRadius: "100px" }}>Inactive</span>}
                                    </div>
                                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                        {(cat._count?.products ?? 0)} products · {cat.children?.length ?? 0} subcategories
                                    </p>
                                </div>
                                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                                    <button onClick={() => openCreate(cat.id)} title="Add subcategory" style={{
                                        padding: "7px", borderRadius: "8px", border: "1px solid var(--border)",
                                        background: "transparent", cursor: "pointer", color: "var(--text-muted)",
                                    }}><Plus size={14} /></button>
                                    <button onClick={() => openEdit(cat)} style={{
                                        padding: "7px", borderRadius: "8px", border: "1px solid var(--border)",
                                        background: "transparent", cursor: "pointer", color: "var(--text-secondary)",
                                    }}><Edit size={14} /></button>
                                    <button onClick={() => handleDelete(cat.id, cat.name)} style={{
                                        padding: "7px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)",
                                        background: "rgba(239,68,68,0.05)", cursor: "pointer", color: "#f87171",
                                    }}><Trash2 size={14} /></button>
                                </div>
                            </div>

                            {/* Subcategories */}
                            {cat.children?.length > 0 && (
                                <div style={{ marginLeft: "24px", borderLeft: "2px solid var(--border-subtle)", paddingLeft: "16px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {cat.children.map((sub: any) => (
                                        <div key={sub.id} className="glass-card p-3" style={{ display: "flex", alignItems: "center", gap: "12px", borderLeft: "2px solid rgba(99,102,241,0.3)" }}>
                                            <ChevronRight size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                                            <div style={{ fontSize: "16px" }}>{sub.icon || "📂"}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{sub.name}</p>
                                                    <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "100px", background: "rgba(99,102,241,0.1)", color: "#a5b4fc" }}>
                                                        /{sub.slug}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sub._count?.products ?? 0} products</p>
                                            </div>
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                <button onClick={() => openEdit(sub)} style={{
                                                    padding: "5px", borderRadius: "6px", border: "1px solid var(--border)",
                                                    background: "transparent", cursor: "pointer", color: "var(--text-secondary)",
                                                }}><Edit size={12} /></button>
                                                <button onClick={() => handleDelete(sub.id, sub.name)} style={{
                                                    padding: "5px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)",
                                                    background: "rgba(239,68,68,0.05)", cursor: "pointer", color: "#f87171",
                                                }}><Trash2 size={12} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            {modalOpen && (
                <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                    <div onClick={() => setModalOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} />
                    <div style={{
                        position: "relative", background: "var(--bg-surface)", border: "1px solid var(--border)",
                        borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "480px", zIndex: 1,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                            <h2 style={{ fontWeight: 700, color: "var(--text-primary)" }}>{editTarget ? "Edit Category" : "New Category"}</h2>
                            <button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <label className="input-label">Category Name *</label>
                                <input
                                    required className="input-field"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: f.slug || autoSlug(e.target.value) }))}
                                    placeholder="e.g. Women's Fashion"
                                />
                            </div>
                            <div>
                                <label className="input-label">URL Slug *</label>
                                <input
                                    required className="input-field"
                                    value={form.slug}
                                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                    placeholder="womens-fashion"
                                />
                            </div>
                            <div>
                                <label className="input-label">Parent Category (leave empty for root)</label>
                                <select
                                    className="select-field"
                                    value={form.parentId}
                                    onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                                >
                                    <option value="">— Root Category —</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div>
                                    <label className="input-label">Icon (emoji)</label>
                                    <input className="input-field" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="👗" />
                                </div>
                                <div>
                                    <label className="input-label">Sort Order</label>
                                    <input type="number" className="input-field" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="input-label">Description</label>
                                <textarea
                                    className="input-field" style={{ height: "80px", resize: "vertical" }}
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Short category description..."
                                />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <input type="checkbox" id="cat-active" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                                <label htmlFor="cat-active" style={{ fontSize: "14px", color: "var(--text-secondary)", cursor: "pointer" }}>Active (visible in store)</label>
                            </div>
                            <button type="submit" className="btn-primary" style={{ justifyContent: "center", marginTop: "4px" }}>
                                <Check size={16} /> {editTarget ? "Save Changes" : "Create Category"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminShell>
    );
}
