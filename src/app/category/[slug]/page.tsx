"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { ChevronRight, Filter, Grid3x3, List, SlidersHorizontal, X, Package } from "lucide-react";

const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "popular", label: "Most Popular" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
];

const LIMIT = 24;

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const subSlug = params.sub as string | undefined;

    const [category, setCategory] = useState<any>(null);
    const [subcategory, setSubcategory] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [sort, setSort] = useState("newest");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    // Load category info
    useEffect(() => {
        fetch(`/api/categories?slug=${slug}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) setCategory(d.data);
            });

        if (subSlug) {
            fetch(`/api/categories?slug=${subSlug}`)
                .then(r => r.json())
                .then(d => {
                    if (d.success) setSubcategory(d.data);
                });
        }
    }, [slug, subSlug]);

    // Load products
    const loadProducts = useCallback(async (p = 1) => {
        setIsLoading(true);
        try {
            // Use the relevant category for filtering
            const catParam = subSlug ? subSlug : slug;
            const qs = new URLSearchParams({
                category: catParam, page: String(p), limit: String(LIMIT),
                sort,
                ...(minPrice && { minPrice }),
                ...(maxPrice && { maxPrice }),
            });

            const res = await fetch(`/api/products?${qs}`);
            const data = await res.json();
            if (data.success) {
                const { items, meta } = data.data;
                setProducts(p === 1 ? items : prev => [...prev, ...items]);
                setPagination({ total: meta.total, totalPages: meta.totalPages });
                setPage(p);
            }
        } finally {
            setIsLoading(false);
        }
    }, [slug, subSlug, sort, minPrice, maxPrice]);

    useEffect(() => { loadProducts(1); }, [loadProducts]);

    const handleLoadMore = () => { if (page < pagination.totalPages) loadProducts(page + 1); };

    const handleFilterApply = () => { loadProducts(1); setFilterOpen(false); };

    const activeCategory = subcategory || category;

    return (
        <>
            <Navbar />
            <main style={{ minHeight: "100vh", background: "var(--bg-base)", paddingTop: "80px" }}>

                {/* Hero Banner */}
                <div style={{
                    background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))",
                    borderBottom: "1px solid var(--border)",
                    padding: "32px 0",
                }}>
                    <div className="page-container">
                        {/* Breadcrumb */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                            <Link href="/" style={{ color: "var(--text-muted)" }}>Home</Link>
                            <ChevronRight size={12} />
                            {category && (
                                <>
                                    <Link
                                        href={`/category/${category.slug}`}
                                        style={{ color: subcategory ? "var(--text-muted)" : "#a5b4fc" }}
                                    >
                                        {category.name}
                                    </Link>
                                    {subcategory && (
                                        <>
                                            <ChevronRight size={12} />
                                            <span style={{ color: "#a5b4fc" }}>{subcategory.name}</span>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                            <div>
                                <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: "white", letterSpacing: "-0.02em", marginBottom: "6px" }}>
                                    {activeCategory?.name || "Loading..."}
                                </h1>
                                {activeCategory?.description && (
                                    <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "560px" }}>
                                        {activeCategory.description}
                                    </p>
                                )}
                                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                                    {pagination.total.toLocaleString()} products found
                                </p>
                            </div>
                        </div>

                        {/* Subcategory pills (if viewing parent category) */}
                        {category && !subSlug && category.children?.length > 0 && (
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "20px" }}>
                                <Link href={`/category/${slug}`} style={{
                                    padding: "7px 16px", borderRadius: "100px", fontSize: "13px", fontWeight: 600,
                                    background: !subSlug ? "linear-gradient(135deg, #6366f1, #a855f7)" : "rgba(255,255,255,0.05)",
                                    color: "white", border: "1px solid var(--border)", textDecoration: "none",
                                }}>All</Link>
                                {category.children.map((child: any) => (
                                    <Link key={child.id} href={`/category/${slug}/${child.slug}`} style={{
                                        padding: "7px 16px", borderRadius: "100px", fontSize: "13px", fontWeight: 600,
                                        background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)",
                                        border: "1px solid var(--border)", textDecoration: "none",
                                        transition: "all 0.2s",
                                    }}>
                                        {child.name}
                                        <span style={{ marginLeft: "5px", fontSize: "10px", color: "var(--text-muted)" }}>
                                            ({child._count?.products || 0})
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="page-container" style={{ padding: "28px 24px" }}>
                    <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>

                        {/* Filter Sidebar — Desktop */}
                        <aside style={{
                            width: "220px", flexShrink: 0, position: "sticky", top: "80px",
                            display: isMounted && window?.innerWidth >= 1024 ? "block" : "none",
                        }}>
                            {isMounted && <FilterPanel
                                minPrice={minPrice} maxPrice={maxPrice}
                                setMinPrice={setMinPrice} setMaxPrice={setMaxPrice}
                                onApply={handleFilterApply}
                            />}
                        </aside>

                        {/* Main */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Toolbar */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", gap: "10px", flexWrap: "wrap" }}>
                                <button onClick={() => setFilterOpen(true)} style={{
                                    display: "flex", alignItems: "center", gap: "6px",
                                    padding: "9px 14px", borderRadius: "10px", border: "1px solid var(--border)",
                                    background: "var(--bg-card)", color: "var(--text-secondary)",
                                    cursor: "pointer", fontFamily: "inherit", fontSize: "13px",
                                }}>
                                    <SlidersHorizontal size={14} /> Filters
                                </button>

                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
                                    <select
                                        value={sort}
                                        onChange={e => { setSort(e.target.value); }}
                                        className="select-field"
                                        style={{ fontSize: "13px", padding: "8px 12px" }}
                                    >
                                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Product Grid */}
                            {isLoading && products.length === 0 ? (
                                <div className="products-grid">
                                    {[...Array(LIMIT)].map((_, i) => (
                                        <div key={i} style={{ borderRadius: "14px", aspectRatio: "4/3" }} className="skeleton" />
                                    ))}
                                </div>
                            ) : products.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "80px 24px" }}>
                                    <Package size={56} style={{ margin: "0 auto 16px", opacity: 0.2, color: "var(--text-muted)" }} />
                                    <p style={{ color: "white", fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>No products found</p>
                                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Try adjusting your filters</p>
                                </div>
                            ) : (
                                <>
                                    <div className="products-grid">
                                        {products.map(p => <ProductCard key={p.id} product={p} />)}
                                    </div>

                                    {/* Load More */}
                                    {page < pagination.totalPages && (
                                        <div style={{ textAlign: "center", marginTop: "40px" }}>
                                            <button
                                                onClick={handleLoadMore}
                                                disabled={isLoading}
                                                className="btn-primary"
                                                style={{ minWidth: "200px" }}
                                            >
                                                {isLoading ? "Loading..." : `Load More (${Math.min(LIMIT, pagination.total - products.length)} more)`}
                                            </button>
                                            <p style={{ marginTop: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
                                                Showing {products.length} of {pagination.total}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Filter Drawer */}
                {isMounted && filterOpen && (
                    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
                        <div onClick={() => setFilterOpen(false)} style={{ flex: 1, background: "rgba(0,0,0,0.6)" }} />
                        <div style={{
                            width: "300px", background: "var(--bg-surface)", borderLeft: "1px solid var(--border)",
                            padding: "24px", overflowY: "auto", animation: "slideDown 0.2s ease",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <h3 style={{ fontWeight: 700, color: "white" }}>Filters</h3>
                                <button onClick={() => setFilterOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <FilterPanel
                                minPrice={minPrice} maxPrice={maxPrice}
                                setMinPrice={setMinPrice} setMaxPrice={setMaxPrice}
                                onApply={handleFilterApply}
                            />
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}

function FilterPanel({ minPrice, maxPrice, setMinPrice, setMaxPrice, onApply }: any) {
    return (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 700, color: "white", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Price Range
            </h3>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <input
                    type="number" placeholder="Min ৳" value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="input-field" style={{ fontSize: "13px" }}
                />
                <input
                    type="number" placeholder="Max ৳" value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="input-field" style={{ fontSize: "13px" }}
                />
            </div>
            <button onClick={onApply} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Apply Filters
            </button>
        </div>
    );
}
