"use client";
import { useEffect, useState, useRef } from "react";
import { AdminShell } from "@/components/AdminShell";
import { api } from "@/lib/apiClient";
import { Package, Plus, Search, Edit, Trash2, Eye, TrendingUp, AlertTriangle, Upload, X, Download, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [modalMode, setModalMode] = useState<"" | "create" | "edit">("");
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const emptyForm = {
        name: "", slug: "", description: "", shortDescription: "", categoryId: "",
        brand: "", tags: "", basePrice: "", comparePrice: "", sku: "",
        stock: "", lowStockThreshold: "5", isActive: true, isFeatured: false, isDigital: false,
        images: "", seoTitle: "", seoDescription: "",
    };
    const [form, setForm] = useState(emptyForm);

    const load = (page = 1) => {
        setIsLoading(true);
        const params: Record<string, string> = { page: String(page), limit: "20" };
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        api.admin.products.list(params)
            .then((res) => {
                setProducts(res.data.items || []);
                setCategories(res.data.categories || []);
                setPagination({ page: res.data.page, total: res.data.total, totalPages: res.data.totalPages });
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { load(); }, [statusFilter]);

    const openCreate = () => {
        setForm(emptyForm);
        setSelectedProduct(null);
        setModalMode("create");
    };

    const openEdit = (product: any) => {
        setSelectedProduct(product);
        setForm({
            name: product.name, slug: product.slug,
            description: product.description,
            shortDescription: product.shortDescription || "",
            categoryId: product.categoryId, brand: product.brand || "",
            tags: product.tags.join(", "),
            basePrice: String(product.basePrice),
            comparePrice: product.comparePrice ? String(product.comparePrice) : "",
            sku: product.sku, stock: String(product.stock),
            lowStockThreshold: String(product.lowStockThreshold),
            isActive: product.isActive, isFeatured: product.isFeatured, isDigital: product.isDigital,
            images: product.images.join(", "),
            seoTitle: product.seoTitle || "", seoDescription: product.seoDescription || "",
        });
        setModalMode("edit");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...form,
            tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
            images: form.images.split(",").map((i) => i.trim()).filter(Boolean),
            basePrice: parseFloat(form.basePrice),
            comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
            stock: parseInt(form.stock),
            lowStockThreshold: parseInt(form.lowStockThreshold),
        };
        try {
            if (modalMode === "create") {
                await api.admin.products.create(payload);
                toast.success("Product created!");
            } else {
                await api.admin.products.update(selectedProduct.id, payload);
                toast.success("Product updated!");
            }
            setModalMode("");
            load(pagination.page);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"?`)) return;
        try {
            await api.admin.products.delete(id);
            toast.success("Product deleted");
            load();
        } catch { toast.error("Delete failed"); }
    };

    const toggleFeatured = async (product: any) => {
        try {
            await api.admin.products.update(product.id, { isFeatured: !product.isFeatured });
            toast.success(`${product.isFeatured ? "Removed from" : "Added to"} featured`);
            load(pagination.page);
        } catch { toast.error("Update failed"); }
    };

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        setUploadResult(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const token = useAuthStore.getState().token || "";
            const res = await fetch("/api/admin/products/bulk-upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setUploadResult(data.data);
                toast.success(`✅ ${data.data.inserted} products uploaded!`);
                load(1);
            } else {
                toast.error(data.message || data.error || "Upload failed");
            }
        } catch { toast.error("Upload failed"); }
        finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <AdminShell>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Package size={22} className="text-[var(--primary)]" /> Products
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm">{pagination.total.toLocaleString()} products</p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        style={{ display: "none" }}
                        onChange={handleBulkUpload}
                    />
                    <a
                        href="data:text/csv;charset=utf-8,name,slug,sku,categoryId,basePrice,comparePrice,stock,description,brand,tags,images,isActive,isFeatured%0AExample Product,example-product,EX-001,CAT_ID_HERE,990,,50,Short description,BrandName,tag1|tag2,https://img.url/img.jpg,true,false"
                        download="product_template.csv"
                        className="btn-secondary text-sm"
                    >
                        <Download size={14} /> CSV Template
                    </a>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="btn-secondary text-sm"
                    >
                        <Upload size={14} /> {isUploading ? "Uploading..." : "Bulk Upload CSV"}
                    </button>
                    <button onClick={openCreate} className="btn-primary text-sm">
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            {/* Bulk upload result */}
            {uploadResult && (
                <div className="glass-card p-5 mb-6 border-emerald-500/20" style={{ borderColor: "rgba(16,185,129,0.2)" }}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                            <CheckCircle size={16} className="text-[var(--success)]" /> Upload Complete
                        </h3>
                        <button onClick={() => setUploadResult(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                            <X size={16} />
                        </button>
                    </div>
                    <div className="flex gap-6 text-sm">
                        <span>✅ Inserted: <strong className="text-[var(--success)]">{uploadResult.inserted}</strong></span>
                        <span>⚠️ Skipped: <strong className="text-[var(--warn)]">{uploadResult.skipped}</strong></span>
                        <span>📋 Total: <strong className="text-[var(--text-primary)]">{uploadResult.processed}</strong></span>
                    </div>
                    {uploadResult.insertErrors?.length > 0 && (
                        <details className="mt-3">
                            <summary className="text-xs text-[var(--danger)] cursor-pointer">Show {uploadResult.insertErrors.length} errors</summary>
                            <ul className="mt-2 text-xs text-[var(--text-muted)] space-y-1">
                                {uploadResult.insertErrors.map((e: string, i: number) => <li key={i}>• {e}</li>)}
                            </ul>
                        </details>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="glass-card p-4 mb-6 flex flex-wrap gap-3">
                <form onSubmit={(e) => { e.preventDefault(); load(1); }} className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input className="input-field pl-9 text-sm h-10" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button type="submit" className="btn-primary text-sm py-2 px-4">Search</button>
                </form>
                <select className="select-field w-auto text-sm h-10" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Products</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="low_stock">Low Stock</option>
                </select>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table-base">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Demand</th>
                                <th>Sold</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i}>{[...Array(8)].map((_, j) => <td key={j}><div className="skeleton h-4 rounded" /></td>)}</tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-12 text-[var(--text-muted)]">No products found</td></tr>
                            ) : products.map((p: any) => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />}
                                            <div>
                                                <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">{p.name}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{categories.find((c: any) => c.id === p.categoryId)?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="font-mono text-xs text-[var(--primary)]">{p.sku}</span></td>
                                    <td>
                                        <div>
                                            <p className="font-bold text-[var(--text-primary)] text-sm">৳{p.basePrice.toLocaleString()}</p>
                                            {p.comparePrice && <p className="text-xs text-[var(--text-muted)] line-through">৳{p.comparePrice.toLocaleString()}</p>}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`text-sm font-bold ${p.stock <= p.lowStockThreshold ? "text-[var(--danger)]" : "text-[var(--text-primary)]"}`}>
                                            {p.stock}
                                            {p.stock <= p.lowStockThreshold && <AlertTriangle size={12} className="inline ml-1" />}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex flex-col gap-1">
                                            <span className={`badge ${p.isActive ? "badge-success" : "badge-ghost"} text-[10px]`}>{p.isActive ? "Active" : "Inactive"}</span>
                                            {p.isFeatured && <span className="badge badge-primary text-[10px]">Featured</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-1">
                                            <TrendingUp size={12} className={p.demandScore > 70 ? "text-[var(--success)]" : "text-[var(--text-muted)]"} />
                                            <span className="text-xs">{p.demandScore}%</span>
                                        </div>
                                    </td>
                                    <td className="text-sm text-[var(--text-primary)]">{p.soldCount.toLocaleString()}</td>
                                    <td>
                                        <div className="flex gap-1">
                                            <Link href={`/products/${p.slug}`} target="_blank" className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all">
                                                <Eye size={14} />
                                            </Link>
                                            <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--warn)] hover:bg-amber-500/10 transition-all">
                                                <Edit size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-500/10 transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-[var(--border)] flex justify-between items-center">
                        <p className="text-xs text-[var(--text-muted)]">Page {pagination.page} of {pagination.totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => load(pagination.page - 1)} disabled={pagination.page === 1} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Prev</button>
                            <button onClick={() => load(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Form Modal */}
            {modalMode && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/70 backdrop-blur-sm overflow-y-auto">
                    <div className="glass-card w-full max-w-2xl p-6 animate-fade-in mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">{modalMode === "create" ? "Add New Product" : "Edit Product"}</h2>
                            <button onClick={() => setModalMode("")} className="btn-secondary text-xs py-1.5 px-3">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-[var(--text-muted)] mb-1">Product Name *</label>
                                    <input className="input-field text-sm" required value={form.name} onChange={(e) => {
                                        const name = e.target.value;
                                        const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
                                        setForm({ ...form, name, slug });
                                    }} />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--text-muted)] mb-1">Slug *</label>
                                    <input className="input-field text-sm" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--text-muted)] mb-1">Category *</label>
                                    <select className="select-field text-sm" required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                                        <option value="">Select Category</option>
                                        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--text-muted)] mb-1">Brand</label>
                                    <input className="input-field text-sm" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--text-muted)] mb-1">SKU *</label>
                                    <input className="input-field text-sm" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--text-muted)] mb-1">Base Price (৳) *</label>
                                    <input className="input-field text-sm" required type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--text-muted)] mb-1">Compare Price (৳)</label>
                                    <input className="input-field text-sm" type="number" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--text-muted)] mb-1">Stock *</label>
                                    <input className="input-field text-sm" required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--text-muted)] mb-1">Low Stock Alert At</label>
                                    <input className="input-field text-sm" type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--text-muted)] mb-1">Tags (comma separated)</label>
                                    <input className="input-field text-sm" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="eid, cotton, men" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--text-muted)] mb-1">Image URLs (comma separated)</label>
                                <input className="input-field text-sm" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--text-muted)] mb-1">Short Description</label>
                                <input className="input-field text-sm" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--text-muted)] mb-1">Full Description</label>
                                <textarea className="input-field text-sm" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="flex gap-4">
                                {[
                                    { key: "isActive", label: "Active" },
                                    { key: "isFeatured", label: "Featured" },
                                    { key: "isDigital", label: "Digital Product" },
                                ].map(({ key, label }) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form[key as keyof typeof form] as boolean}
                                            onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                                            className="accent-indigo-500 w-4 h-4"
                                        />
                                        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="btn-primary">{modalMode === "create" ? "Create Product" : "Save Changes"}</button>
                                <button type="button" onClick={() => setModalMode("")} className="btn-secondary">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminShell>
    );
}
