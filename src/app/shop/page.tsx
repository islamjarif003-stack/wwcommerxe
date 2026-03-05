"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/apiClient";
import { Search, SlidersHorizontal, Package, X, ChevronDown, TrendingUp, Flame } from "lucide-react";

const SORT_OPTIONS = [
    { label: "Newest First", value: "newest" },
    { label: "Most Popular", value: "popular" },
    { label: "Price: Low → High", value: "price_asc" },
    { label: "Price: High → Low", value: "price_desc" },
    { label: "Best Rating", value: "rating" },
    { label: "🔥 Trending", value: "demand" },
];

type Cat = { id: string; name: string; productCount: number; image?: string };

function FilterButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
    return (
        <button onClick={onClick} style={{
            width: "100%", padding: "9px 14px", borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontSize: "13px", fontWeight: active ? 700 : 500, cursor: "pointer",
            border: active ? "1px solid var(--border-accent)" : "1px solid transparent",
            background: active ? "var(--primary-glow)" : "transparent",
            color: active ? "var(--primary)" : "var(--text-secondary)",
            fontFamily: "inherit", transition: "all 0.18s ease",
        }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; } }}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; } }}>
            {children}
        </button>
    );
}

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<Cat[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [searchInput, setSearchInput] = useState("");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "newest";
    const featured = searchParams.get("featured") || "";
    const tag = searchParams.get("tag") || "";

    const updateParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value); else params.delete(key);
        params.delete("page");
        router.push(`/shop?${params.toString()}`);
    };

    useEffect(() => { setSearchInput(search); }, [search]);

    useEffect(() => {
        setIsLoading(true);
        const params: Record<string, string> = { page: String(page), limit: "12" };
        if (category) params.category = category;
        if (search) params.search = search;
        if (sort) params.sort = sort;
        if (featured) params.featured = featured;
        if (tag) params.tag = tag;
        api.products.list(params)
            .then(res => {
                setProducts(res.data.items || []);
                setTotal(res.data.meta?.total || 0);
                setTotalPages(res.data.meta?.totalPages || 1);
                setCategories(res.data.categories || []);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [category, search, sort, featured, tag, page]);

    const activeCategory = categories.find(c => c.id === category);
    const hasFilters = !!(category || search || featured || tag);
    const pageTitle = activeCategory?.name || (search ? `"${search}"` : tag ? `#${tag}` : "All Products");

    const SidebarPanel = () => (
        <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "20px", overflow: "hidden",
            position: "sticky", top: "88px",
        }}>
            {/* Header */}
            <div style={{
                padding: "16px 18px", borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(255,255,255,0.02)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <SlidersHorizontal size={15} color="var(--text-muted)" />
                    <span style={{ fontWeight: 800, fontSize: "14px", color: "var(--text-primary)" }}>Filters</span>
                </div>
                {hasFilters && (
                    <button onClick={() => router.push("/shop")} style={{
                        fontSize: "11px", fontWeight: 700, color: "var(--danger)",
                        background: "rgba(179,74,64,0.1)", border: "1px solid rgba(179,74,64,0.2)",
                        padding: "3px 9px", borderRadius: "6px", cursor: "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", gap: "4px",
                    }}><X size={10} /> Clear</button>
                )}
            </div>

            <div style={{ padding: "14px" }}>
                {/* Category section */}
                <p style={{
                    fontSize: "10px", fontWeight: 800, color: "var(--text-muted)",
                    textTransform: "uppercase", letterSpacing: "1px",
                    padding: "0 4px", marginBottom: "6px",
                }}>Category</p>
                <FilterButton active={!category} onClick={() => updateParam("category", "")}>
                    <span>All Categories</span>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>{total}</span>
                </FilterButton>
                {categories.slice(0, 8).map(cat => (
                    <FilterButton key={cat.id} active={category === cat.id} onClick={() => updateParam("category", cat.id)}>
                        <span>{cat.name}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>{cat.productCount}</span>
                    </FilterButton>
                ))}

                {/* Divider */}
                <div style={{ height: "1px", background: "var(--border)", margin: "12px 0" }} />

                {/* Type filters */}
                <p style={{
                    fontSize: "10px", fontWeight: 800, color: "var(--text-muted)",
                    textTransform: "uppercase", letterSpacing: "1px",
                    padding: "0 4px", marginBottom: "6px",
                }}>Special</p>
                <FilterButton active={!!featured} onClick={() => updateParam("featured", featured ? "" : "true")}>
                    <span>⭐ Featured</span>
                </FilterButton>
                <FilterButton active={sort === "demand"} onClick={() => updateParam("sort", sort === "demand" ? "newest" : "demand")}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Flame size={13} color="var(--warn)" /> Trending
                    </span>
                </FilterButton>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
            <Navbar />

            {/* ── Page Hero ── */}
            <div style={{
                paddingTop: "80px",
                background: "linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)",
                borderBottom: "1px solid var(--border)",
            }}>
                <div className="page-container" style={{ padding: "32px 24px" }}>
                    <div style={{ maxWidth: "700px" }}>
                        <h1 style={{
                            fontSize: "clamp(26px,5vw,48px)", fontWeight: 800,
                            color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "6px",
                        }}>{pageTitle}</h1>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                            {isLoading ? "Loading..." : `${total.toLocaleString()} products available`}
                        </p>
                    </div>

                    {/* Search bar */}
                    <div style={{ position: "relative", marginTop: "20px", maxWidth: "600px" }}>
                        <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && updateParam("search", searchInput)}
                            placeholder="Search for products, brands..."
                            style={{
                                width: "100%", height: "48px",
                                paddingLeft: "46px", paddingRight: searchInput ? "120px" : "100px",
                                background: "var(--bg-elevated)",
                                border: "1px solid var(--border)", borderRadius: "14px",
                                color: "var(--text-primary)", fontSize: "14px", fontFamily: "inherit", outline: "none",
                                transition: "border-color 0.2s",
                                boxShadow: "var(--shadow-sm)",
                            }}
                            onFocus={e => (e.target.style.borderColor = "var(--border-accent)")}
                            onBlur={e => (e.target.style.borderColor = "var(--border)")}
                        />
                        {searchInput && (
                            <button onClick={() => { setSearchInput(""); updateParam("search", ""); }} style={{
                                position: "absolute", right: "90px", top: "50%", transform: "translateY(-50%)",
                                background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
                                padding: "4px",
                            }}><X size={15} /></button>
                        )}
                        <button onClick={() => updateParam("search", searchInput)} style={{
                            position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)",
                            padding: "9px 18px", borderRadius: "10px",
                            background: "var(--primary)",
                            color: "white", border: "none", cursor: "pointer",
                            fontSize: "13px", fontWeight: 700, fontFamily: "inherit",
                        }}>Search</button>
                    </div>
                </div>
            </div>

            <div className="page-container" style={{ padding: "28px 24px 60px" }}>
                <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

                    {/* Desktop Sidebar */}
                    <aside style={{ width: "240px", flexShrink: 0, display: "none" }} id="shop-sidebar">
                        <SidebarPanel />
                    </aside>

                    {/* Main content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Sort / Filter bar */}
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            marginBottom: "20px", gap: "12px", flexWrap: "wrap",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                {/* Mobile filter btn */}
                                <button onClick={() => setMobileFilterOpen(true)} id="mobile-filter-btn" style={{
                                    display: "none",
                                    alignItems: "center", gap: "6px",
                                    padding: "8px 16px", borderRadius: "10px",
                                    background: hasFilters ? "var(--primary-glow)" : "var(--bg-elevated)",
                                    border: "1px solid " + (hasFilters ? "var(--border-accent)" : "var(--border)"),
                                    color: hasFilters ? "var(--primary)" : "var(--text-secondary)",
                                    fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                }}>
                                    <SlidersHorizontal size={14} /> Filters {hasFilters && "(on)"}
                                </button>

                                {/* Active filter tags */}
                                {hasFilters && (
                                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                        {category && activeCategory && (
                                            <span style={{
                                                display: "flex", alignItems: "center", gap: "6px",
                                                padding: "5px 12px", borderRadius: "100px",
                                                background: "var(--primary-glow)", border: "1px solid var(--border-accent)",
                                                fontSize: "12px", fontWeight: 700, color: "var(--primary)",
                                            }}>
                                                {activeCategory.name}
                                                <button onClick={() => updateParam("category", "")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", display: "flex" }}><X size={11} /></button>
                                            </span>
                                        )}
                                        {featured && (
                                            <span style={{
                                                display: "flex", alignItems: "center", gap: "6px",
                                                padding: "5px 12px", borderRadius: "100px",
                                                background: "rgba(194,136,62,0.1)", border: "1px solid rgba(194,136,62,0.2)",
                                                fontSize: "12px", fontWeight: 700, color: "var(--warn)",
                                            }}>
                                                ⭐ Featured
                                                <button onClick={() => updateParam("featured", "")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", display: "flex" }}><X size={11} /></button>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Sort dropdown */}
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto", flexShrink: 0 }}>
                                <span style={{ fontSize: "13px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Sort:</span>
                                <div style={{ position: "relative" }}>
                                    <select value={sort} onChange={e => updateParam("sort", e.target.value)} style={{
                                        padding: "8px 36px 8px 14px",
                                        background: "var(--bg-elevated)", border: "1px solid var(--border)",
                                        borderRadius: "10px", color: "var(--text-primary)", fontSize: "13px",
                                        fontFamily: "inherit", outline: "none", cursor: "pointer", appearance: "none",
                                        boxShadow: "var(--shadow-sm)",
                                    }}>
                                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                    <ChevronDown size={13} color="var(--text-muted)" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                </div>
                            </div>
                        </div>

                        {/* Products */}
                        {isLoading ? (
                            <div className="products-grid">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} style={{ borderRadius: "14px", overflow: "hidden", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                                        <div className="skeleton" style={{ aspectRatio: "4/3", borderRadius: "0" }} />
                                        <div style={{ padding: "12px 14px" }}>
                                            <div className="skeleton" style={{ height: "10px", width: "50%", marginBottom: "7px" }} />
                                            <div className="skeleton" style={{ height: "14px", width: "88%", marginBottom: "9px" }} />
                                            <div className="skeleton" style={{ height: "18px", width: "38%" }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="products-grid">
                                    {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={{
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        gap: "6px", marginTop: "48px",
                                    }}>
                                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                                            padding: "9px 20px", borderRadius: "10px",
                                            background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
                                            color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600,
                                            cursor: page === 1 ? "not-allowed" : "pointer",
                                            opacity: page === 1 ? 0.4 : 1, fontFamily: "inherit",
                                            transition: "all 0.2s",
                                        }}>← Prev</button>

                                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                            const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                                            return (
                                                <button key={pg} onClick={() => setPage(pg)} style={{
                                                    width: "38px", height: "38px", borderRadius: "10px",
                                                    background: pg === page ? "var(--primary)" : "var(--bg-elevated)",
                                                    border: pg === page ? "none" : "1px solid var(--border)",
                                                    color: pg === page ? "white" : "var(--text-secondary)",
                                                    fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                                    boxShadow: pg === page ? "var(--shadow-sm)" : "none",
                                                }}>{pg}</button>
                                            );
                                        })}

                                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                                            padding: "9px 20px", borderRadius: "10px",
                                            background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
                                            color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600,
                                            cursor: page === totalPages ? "not-allowed" : "pointer",
                                            opacity: page === totalPages ? 0.4 : 1, fontFamily: "inherit",
                                            transition: "all 0.2s",
                                        }}>Next →</button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{
                                textAlign: "center", padding: "100px 24px",
                                background: "var(--bg-card)", borderRadius: "24px",
                                border: "1px solid var(--border)",
                            }}>
                                <div style={{
                                    width: "80px", height: "80px", borderRadius: "24px",
                                    background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    margin: "0 auto 20px",
                                }}>
                                    <Package size={36} color="var(--text-muted)" />
                                </div>
                                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>No products found</h3>
                                <p style={{ color: "var(--text-muted)", marginBottom: "24px", fontSize: "14px" }}>
                                    Try different filters or search terms
                                </p>
                                <button onClick={() => router.push("/shop")} style={{
                                    padding: "11px 28px", borderRadius: "12px",
                                    background: "var(--primary)",
                                    color: "white", border: "none", cursor: "pointer",
                                    fontSize: "14px", fontWeight: 700, fontFamily: "inherit",
                                    boxShadow: "var(--shadow-sm)",
                                }}>Clear All Filters</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile filter drawer */}
            {mobileFilterOpen && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 200,
                    display: "flex", alignItems: "flex-end",
                }}>
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                        onClick={() => setMobileFilterOpen(false)} />
                    <div style={{
                        position: "relative", width: "100%", maxHeight: "80vh",
                        background: "var(--bg-card)", borderRadius: "24px 24px 0 0",
                        border: "1px solid var(--border)", overflow: "auto",
                        animation: "slideDown 0.3s ease",
                        padding: "20px",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                            <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>Filters</span>
                            <button onClick={() => setMobileFilterOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                                <X size={20} />
                            </button>
                        </div>
                        <SidebarPanel />
                    </div>
                </div>
            )}

        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ width: "40px", height: "40px", margin: "0 auto 16px", borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin 0.8s linear infinite" }} />
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading shop...</p>
                </div>
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
