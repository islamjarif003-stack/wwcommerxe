"use client";
import { use, useEffect, useState } from "react";
import {
    ShoppingCart, Star, Truck, Shield, Package, ChevronRight,
    Plus, Minus, Heart, Share2, TrendingUp, CheckCircle, ArrowLeft
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { useCartStore } from "@/store/cartStore";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import Link from "next/link";
import { usePrice } from "@/hooks/usePrice";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { formatPrice } = usePrice();
    const { slug } = use(params);

    // ── ALL HOOKS MUST BE AT TOP LEVEL (no conditional hooks!) ──
    const [data, setData] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [wishlist, setWishlist] = useState(false);
    const [activeTab, setActiveTab] = useState<"description" | "specs">("description");
    const { addItem } = useCartStore();

    const getDefaultAttributes = (productData: any) => {
        if (!productData) return {};

        const variants = productData.variants || [];
        const productAttributes = productData.attributes || { Size: ["38 (M)", "40 (L)", "42 (XL)", "44 (XXL)"] };

        // Prefer first in-stock variant so size/color shows by default
        const defaultVariant = variants.find((v: any) => v.isActive !== false && (v.stock ?? 0) > 0)
            || variants.find((v: any) => v.isActive !== false)
            || variants[0];

        if (defaultVariant?.attributes && typeof defaultVariant.attributes === "object") {
            return defaultVariant.attributes;
        }

        // Fallback: choose first value from each attribute list
        const defaults: Record<string, string> = {};
        Object.entries(productAttributes).forEach(([key, values]) => {
            if (Array.isArray(values) && values.length > 0) {
                defaults[key] = String(values[0]);
            }
        });

        return defaults;
    };

    useEffect(() => {
        setIsLoading(true);
        api.products.get(slug)
            .then((res) => {
                const productData = res.data?.product;
                if (productData && !productData.attributes) {
                    productData.attributes = { Size: ["38 (M)", "40 (L)", "42 (XL)", "44 (XXL)"] };
                }
                setData(res.data);
                setSelectedImage(0);
                setSelectedAttributes(getDefaultAttributes(productData));
            })
            .catch(() => setData(null))
            .finally(() => setIsLoading(false));
    }, [slug]);

    // Variant matching effect — always runs, guards inside
    useEffect(() => {
        if (!data?.product?.variants?.length) return;
        const match = data.product.variants.find((v: any) =>
            Object.entries(selectedAttributes).every(([k, val]) => v.attributes?.[k] === val)
        );
        setSelectedVariant(match || null);
    }, [selectedAttributes, data]);

    // ── Derived values (computed after hooks) ──
    const product = data?.product;
    const category = data?.category;
    const related = data?.related || [];
    const currentPrice = selectedVariant?.price || product?.basePrice || 0;
    const currentStock = selectedVariant?.stock ?? product?.stock ?? 0;
    const discount = product?.comparePrice
        ? Math.round(((product.comparePrice - currentPrice) / product.comparePrice) * 100)
        : 0;
    const avgRating = product?.averageRating ?? product?.rating ?? 0;
    const stars = Math.round(avgRating);

    const handleAddToCart = () => {
        if (currentStock <= 0) return toast.error("Out of stock");
        addItem({
            productId: product.id,
            variantId: selectedVariant?.id,
            name: product.name,
            image: product.images?.[selectedImage],
            sku: selectedVariant?.sku || product.sku || product.id,
            unitPrice: currentPrice,
            quantity,
            totalPrice: currentPrice * quantity,
            attributes: Object.keys(selectedAttributes).length > 0 ? selectedAttributes : undefined,
        });
        toast.success(`${product.name} added to cart! 🛒`, {
            style: { background: "#13131f", color: "#f0f0fa", border: "1px solid rgba(99,102,241,0.3)" },
            iconTheme: { primary: "#818cf8", secondary: "white" },
        });
    };

    // ── Early returns AFTER hooks ──
    if (isLoading) {
        return (
            <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
                <Navbar />
                <div className="page-container" style={{ paddingTop: "100px", paddingBottom: "64px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}>
                        <div className="skeleton" style={{ aspectRatio: "1", borderRadius: "20px" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {[80, 60, 50, 120, 80, 100].map((w, i) => (
                                <div key={i} className="skeleton" style={{ height: `${16 + i * 4}px`, width: `${w}%`, borderRadius: "8px" }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data || !product) {
        return (
            <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Navbar />
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{
                        width: "100px", height: "100px", borderRadius: "28px",
                        background: "var(--bg-card)", border: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 24px",
                    }}>
                        <Package size={48} color="var(--text-muted)" />
                    </div>
                    <h2 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>Product not found</h2>
                    <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>This product may have been removed or the link is invalid.</p>
                    <Link href="/shop" style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        padding: "12px 28px", borderRadius: "12px",
                        background: "linear-gradient(135deg, #6366f1, #a855f7)",
                        color: "white", fontWeight: 700, textDecoration: "none",
                        boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
                    }}>
                        <ArrowLeft size={16} /> Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
            <Navbar />
            <div className="page-container" style={{ paddingTop: "96px", paddingBottom: "80px" }}>

                {/* Breadcrumb */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    fontSize: "13px", color: "var(--text-muted)", marginBottom: "32px",
                    flexWrap: "wrap",
                }}>
                    <Link href="/" style={{ textDecoration: "none", color: "var(--text-muted)", transition: "color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>Home</Link>
                    <ChevronRight size={13} />
                    <Link href="/shop" style={{ textDecoration: "none", color: "var(--text-muted)", transition: "color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>Shop</Link>
                    {category && (
                        <>
                            <ChevronRight size={13} />
                            <Link href={`/shop?category=${category.id}`} style={{ textDecoration: "none", color: "var(--text-muted)", transition: "color 0.2s" }}
                                onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                                {category.name}
                            </Link>
                        </>
                    )}
                    <ChevronRight size={13} />
                    <span style={{ color: "var(--text-primary)", fontWeight: 500, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {product.name}
                    </span>
                </div>

                {/* ── Main Product Layout ── */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "56px",
                    marginBottom: "64px",
                    alignItems: "start",
                }}>

                    {/* ── Left: Images ── */}
                    <div>
                        {/* Main image */}
                        <div style={{
                            position: "relative",
                            aspectRatio: "1",
                            borderRadius: "24px",
                            overflow: "hidden",
                            background: "var(--bg-card)",
                            border: "1px solid var(--border)",
                            marginBottom: "12px",
                        }}>
                            {product.images?.[selectedImage] ? (
                                <img
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Package size={72} color="var(--text-muted)" />
                                </div>
                            )}

                            {/* Badges */}
                            {discount > 0 && (
                                <div style={{
                                    position: "absolute", top: "16px", left: "16px",
                                    background: "linear-gradient(135deg, #ef4444, #f43f5e)",
                                    color: "white", fontSize: "12px", fontWeight: 800,
                                    padding: "4px 10px", borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(239,68,68,0.4)",
                                }}>-{discount}%</div>
                            )}
                            {product.demandScore > 75 && (
                                <div style={{
                                    position: "absolute", top: "16px", right: "16px",
                                    background: "rgba(245,158,11,0.9)",
                                    backdropFilter: "blur(8px)",
                                    color: "white", fontSize: "11px", fontWeight: 700,
                                    padding: "4px 10px", borderRadius: "8px",
                                    display: "flex", alignItems: "center", gap: "5px",
                                }}>
                                    <TrendingUp size={12} /> Hot Item
                                </div>
                            )}

                            {/* Wishlist */}
                            <button onClick={() => {
                                setWishlist(!wishlist);
                                toast(wishlist ? "Removed from wishlist" : "Added to wishlist ❤️", {
                                    style: { background: "#13131f", color: "#f0f0fa", border: "1px solid rgba(255,255,255,0.06)" },
                                });
                            }} style={{
                                position: "absolute", bottom: "16px", right: "16px",
                                width: "40px", height: "40px",
                                background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", transition: "all 0.2s",
                            }}>
                                <Heart size={18} color={wishlist ? "#f43f5e" : "white"} fill={wishlist ? "#f43f5e" : "none"} />
                            </button>
                        </div>

                        {/* Thumbnails */}
                        {product.images?.length > 1 && (
                            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                                {product.images.map((img: string, i: number) => (
                                    <button key={i} onClick={() => setSelectedImage(i)} style={{
                                        width: "72px", height: "72px", flexShrink: 0, borderRadius: "12px",
                                        overflow: "hidden", cursor: "pointer", padding: 0,
                                        border: selectedImage === i ? "2px solid #6366f1" : "2px solid var(--border)",
                                        transition: "border-color 0.2s",
                                        boxShadow: selectedImage === i ? "0 0 0 3px rgba(99,102,241,0.2)" : "none",
                                    }}>
                                        <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Right: Product Info ── */}
                    <div>
                        {/* Brand */}
                        {product.brand && (
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "#818cf8", marginBottom: "10px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                                {product.brand}
                            </p>
                        )}

                        {/* Name */}
                        <h1 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "16px" }}>
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                            <div style={{ display: "flex", gap: "3px" }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} size={15}
                                        fill={s <= stars ? "#f59e0b" : "none"}
                                        color={s <= stars ? "#f59e0b" : "var(--text-muted)"}
                                        strokeWidth={1.5}
                                    />
                                ))}
                            </div>
                            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                {avgRating.toFixed(1)} ({product.reviewCount || 0} reviews)
                            </span>
                            <span style={{ color: "var(--border)" }}>·</span>
                            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                {(product.soldCount || 0).toLocaleString()}+ sold
                            </span>
                        </div>

                        {/* Price */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: "16px",
                            marginBottom: "24px", paddingBottom: "24px",
                            borderBottom: "1px solid var(--border)",
                            flexWrap: "wrap",
                        }}>
                            <span style={{ fontSize: "38px", fontWeight: 900, color: "var(--text-primary)" }}>
                                {formatPrice(currentPrice.toLocaleString())}
                            </span>
                            {product.comparePrice && (
                                <span style={{ fontSize: "20px", color: "var(--text-muted)", textDecoration: "line-through" }}>
                                    {formatPrice(product.comparePrice.toLocaleString())}
                                </span>
                            )}
                            {discount > 0 && (
                                <span style={{
                                    fontSize: "13px", fontWeight: 700, color: "#34d399",
                                    background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
                                    padding: "4px 12px", borderRadius: "100px",
                                }}>
                                    Save {discount}%
                                </span>
                            )}
                        </div>

                        {/* Short description */}
                        {product.shortDescription && (
                            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "24px" }}>
                                {product.shortDescription}
                            </p>
                        )}

                        {/* Attribute selectors */}
                        {product.attributes && Object.entries(product.attributes).map(([attrName, values]: [string, any]) => (
                            <div key={attrName} style={{ marginBottom: "18px" }}>
                                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>
                                    {attrName}:{" "}
                                    <span style={{ color: "#818cf8" }}>{selectedAttributes[attrName] || "Select option"}</span>
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    {(values as string[]).map((val: string) => (
                                        <button key={val}
                                            onClick={() => setSelectedAttributes(prev => ({ ...prev, [attrName]: val }))}
                                            style={{
                                                padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
                                                cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                                                border: selectedAttributes[attrName] === val
                                                    ? "1px solid rgba(99,102,241,0.6)"
                                                    : "1px solid var(--border)",
                                                background: selectedAttributes[attrName] === val
                                                    ? "rgba(99,102,241,0.1)"
                                                    : "var(--bg-elevated)",
                                                color: selectedAttributes[attrName] === val ? "var(--primary, #4f46e5)" : "var(--text-secondary)",
                                                boxShadow: selectedAttributes[attrName] === val ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
                                            }}>
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Stock indicator */}
                        <div style={{ marginBottom: "20px" }}>
                            {currentStock > 10 ? (
                                <span style={{
                                    display: "inline-flex", alignItems: "center", gap: "6px",
                                    fontSize: "13px", fontWeight: 600, color: "#34d399",
                                    background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
                                    padding: "6px 14px", borderRadius: "100px",
                                }}>
                                    <CheckCircle size={13} /> In Stock ({currentStock} available)
                                </span>
                            ) : currentStock > 0 ? (
                                <span style={{
                                    display: "inline-flex", alignItems: "center", gap: "6px",
                                    fontSize: "13px", fontWeight: 600, color: "#fbbf24",
                                    background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
                                    padding: "6px 14px", borderRadius: "100px",
                                }}>
                                    ⚠ Only {currentStock} left!
                                </span>
                            ) : (
                                <span style={{
                                    display: "inline-flex", alignItems: "center", gap: "6px",
                                    fontSize: "13px", fontWeight: 600, color: "#f87171",
                                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                                    padding: "6px 14px", borderRadius: "100px",
                                }}>
                                    ✗ Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Qty + Add to Cart */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: "4px",
                                background: "var(--bg-card)", border: "1px solid var(--border)",
                                borderRadius: "14px", padding: "5px",
                            }}>
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{
                                    width: "36px", height: "36px", borderRadius: "10px",
                                    background: "none", border: "none", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "var(--text-secondary)", transition: "all 0.15s",
                                }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}>
                                    <Minus size={16} />
                                </button>
                                <span style={{ width: "40px", textAlign: "center", fontSize: "17px", fontWeight: 800, color: "var(--text-primary)" }}>{quantity}</span>
                                <button onClick={() => setQuantity(q => Math.min(currentStock, q + 1))} style={{
                                    width: "36px", height: "36px", borderRadius: "10px",
                                    background: "none", border: "none", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "var(--text-secondary)", transition: "all 0.15s",
                                }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}>
                                    <Plus size={16} />
                                </button>
                            </div>

                            <button onClick={handleAddToCart} disabled={currentStock <= 0} style={{
                                flex: 1, height: "50px",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                                background: currentStock <= 0
                                    ? "rgba(255,255,255,0.05)"
                                    : "linear-gradient(135deg, #6366f1, #a855f7)",
                                color: currentStock <= 0 ? "var(--text-muted)" : "white",
                                border: "none", borderRadius: "14px",
                                fontSize: "15px", fontWeight: 800, cursor: currentStock <= 0 ? "not-allowed" : "pointer",
                                fontFamily: "inherit", transition: "all 0.3s ease",
                                boxShadow: currentStock <= 0 ? "none" : "0 8px 28px rgba(99,102,241,0.4)",
                            }}
                                onMouseEnter={e => { if (currentStock > 0) { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 40px rgba(99,102,241,0.55)"; } }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(99,102,241,0.4)"; }}>
                                <ShoppingCart size={18} /> Add to Cart
                            </button>
                        </div>

                        {/* Buy Now */}
                        <Link href="/checkout" onClick={handleAddToCart} style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            height: "50px", borderRadius: "14px",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border)",
                            color: "var(--text-primary)", fontWeight: 700, fontSize: "15px",
                            textDecoration: "none", marginBottom: "24px",
                            transition: "all 0.2s",
                        }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--primary)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}>
                            Buy Now
                        </Link>

                        {/* Delivery info card */}
                        <div style={{
                            background: "var(--bg-card)", border: "1px solid var(--border)",
                            borderRadius: "16px", padding: "20px",
                            display: "flex", flexDirection: "column", gap: "14px",
                        }}>
                            {[
                                { Icon: Truck, color: "#818cf8", bg: "rgba(99,102,241,0.1)", title: "Fast Delivery", desc: "Dhaka: Same/Next Day · Others: 3-5 Days" },
                                { Icon: Shield, color: "#34d399", bg: "rgba(16,185,129,0.1)", title: "100% Genuine", desc: "All products are verified authentic" },
                                { Icon: Package, color: "#fbbf24", bg: "rgba(245,158,11,0.1)", title: "Easy Returns", desc: "7-day hassle-free return policy" },
                            ].map(item => (
                                <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                    <div style={{
                                        width: "36px", height: "36px", borderRadius: "10px",
                                        background: item.bg, display: "flex", alignItems: "center",
                                        justifyContent: "center", flexShrink: 0,
                                    }}>
                                        <item.Icon size={17} color={item.color} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{item.title}</p>
                                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Share */}
                        <button style={{
                            marginTop: "14px", display: "flex", alignItems: "center", gap: "7px",
                            fontSize: "13px", color: "var(--text-muted)", background: "none", border: "none",
                            cursor: "pointer", fontFamily: "inherit", transition: "color 0.2s",
                        }}
                            onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                            onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}>
                            <Share2 size={14} /> Share this product
                        </button>
                    </div>
                </div>

                {/* ── Description / Specs tabs ── */}
                <div style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "22px", overflow: "hidden", marginBottom: "64px",
                }}>
                    {/* Tab headers */}
                    <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
                        {(["description", "specs"] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                padding: "16px 28px", fontSize: "14px", fontWeight: 700,
                                cursor: "pointer", border: "none", background: "none", fontFamily: "inherit",
                                color: activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
                                borderBottom: activeTab === tab ? "2px solid #6366f1" : "2px solid transparent",
                                textTransform: "capitalize", transition: "all 0.2s",
                            }}>
                                {tab === "description" ? "Description" : "Specifications"}
                            </button>
                        ))}
                    </div>
                    <div style={{ padding: "28px 32px" }}>
                        {activeTab === "description" ? (
                            <div>
                                <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.9, whiteSpace: "pre-line" }}>
                                    {product.description || "No description available."}
                                </p>
                                {product.tags?.length > 0 && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "20px" }}>
                                        {product.tags.map((tag: string) => (
                                            <span key={tag} style={{
                                                padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: 600,
                                                background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                                                color: "var(--text-muted)",
                                            }}>#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                {[
                                    { k: "SKU", v: product.sku },
                                    { k: "Category", v: category?.name },
                                    { k: "Brand", v: product.brand },
                                    { k: "Stock", v: `${product.stock} units` },
                                    { k: "Rating", v: `${avgRating.toFixed(1)} / 5` },
                                    { k: "Sold", v: `${(product.soldCount || 0).toLocaleString()}+` },
                                ].filter(i => i.v).map(item => (
                                    <div key={item.k} style={{
                                        display: "flex", justifyContent: "space-between",
                                        padding: "10px 14px", background: "rgba(255,255,255,0.025)",
                                        borderRadius: "10px", fontSize: "13px",
                                    }}>
                                        <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{item.k}</span>
                                        <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{item.v}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Related Products ── */}
                {related.length > 0 && (
                    <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
                            <div>
                                <div className="section-label">You may also like</div>
                                <h2 style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                                    Related Products
                                </h2>
                            </div>
                            <Link href={`/shop?category=${category?.id || ""}`} style={{
                                display: "inline-flex", alignItems: "center", gap: "6px",
                                padding: "8px 18px", borderRadius: "10px",
                                background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
                                color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600,
                                textDecoration: "none", transition: "all 0.2s",
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--primary)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
                                See all <ChevronRight size={14} />
                            </Link>
                        </div>
                        <div className="products-grid">
                            {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
