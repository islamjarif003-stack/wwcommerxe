"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Star, TrendingUp, Heart, Eye } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        slug: string;
        basePrice: number;
        comparePrice?: number;
        images: string[];
        averageRating: number;
        reviewCount?: number;
        soldCount: number;
        stock: number;
        isHot?: boolean;
        isFeatured?: boolean;
        demandScore?: number;
        categoryName?: string;
        brand?: string;
        tags?: string[];
    };
}

export function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCartStore();
    const router = useRouter();
    const [imgLoaded, setImgLoaded] = useState(false);
    const [wishlist, setWishlist] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [adding, setAdding] = useState(false);

    const discount = product.comparePrice
        ? Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100)
        : 0;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setAdding(true);
        addItem({
            productId: product.id,
            name: product.name,
            sku: product.id,
            image: product.images[0] || "",
            unitPrice: product.basePrice,
            quantity: 1,
            totalPrice: product.basePrice,
        });
        toast.success(`Added to cart!`, {
            duration: 2000,
            style: { background: "#13131f", color: "#f0f0fa", border: "1px solid rgba(99,102,241,0.3)" },
            iconTheme: { primary: "#818cf8", secondary: "white" },
        });
        setTimeout(() => setAdding(false), 600);
    };

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setWishlist(!wishlist);
        toast(wishlist ? "Removed from wishlist" : "Added to wishlist ❤️", {
            duration: 1500,
            style: { background: "#13131f", color: "#f0f0fa", border: "1px solid rgba(255,255,255,0.06)" },
        });
    };

    const avgRating = product.averageRating ?? 0;
    const stars = Math.round(avgRating);
    const reviewCount = product.reviewCount ?? 0;
    const soldCount = product.soldCount ?? 0;

    return (
        <Link href={`/products/${product.slug}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
            <div
                className="product-card"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {/* ── Image ── */}
                <div style={{
                    position: "relative",
                    aspectRatio: "4/3",
                    overflow: "hidden",
                    background: `linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-card) 100%)`,
                }}>
                    {!imgLoaded && (
                        <div className="skeleton" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
                    )}
                    {product.images[0] ? (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            onLoad={() => setImgLoaded(true)}
                            style={{
                                width: "100%", height: "100%", objectFit: "cover",
                                transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
                                transform: isHovering ? "scale(1.08)" : "scale(1)",
                                opacity: imgLoaded ? 1 : 0,
                            }}
                        />
                    ) : (
                        <div style={{
                            width: "100%", height: "100%", background: "var(--bg-elevated)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <ShoppingCart size={36} color="var(--text-muted)" />
                        </div>
                    )}

                    {/* Gradient overlay on hover */}
                    <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to top, rgba(31,64,58,0.4) 0%, transparent 50%)",
                        opacity: isHovering ? 1 : 0,
                        transition: "opacity 0.3s ease",
                    }} />

                    {/* Top badges */}
                    <div style={{
                        position: "absolute", top: "10px", left: "10px",
                        display: "flex", flexDirection: "column", gap: "5px",
                    }}>
                        {discount > 0 && (
                            <span style={{
                                background: "var(--secondary)",
                                color: "var(--bg-card)", fontSize: "11px", fontWeight: 700,
                                padding: "3px 8px", borderRadius: "6px",
                                boxShadow: "var(--shadow-sm)",
                            }}>-{discount}%</span>
                        )}
                        {product.isHot && (
                            <span style={{
                                background: "var(--warn)",
                                color: "var(--bg-card)", fontSize: "10px", fontWeight: 600,
                                padding: "3px 8px", borderRadius: "6px",
                            }}>HOT</span>
                        )}
                        {product.isFeatured && !product.isHot && (
                            <span style={{
                                background: "var(--primary)",
                                color: "var(--bg-card)", fontSize: "10px", fontWeight: 600,
                                padding: "3px 8px", borderRadius: "6px",
                            }}>★ TOP</span>
                        )}
                    </div>

                    {/* Wishlist button */}
                    <button onClick={toggleWishlist} style={{
                        position: "absolute", top: "10px", right: "10px",
                        width: "32px", height: "32px",
                        background: "var(--bg-elevated)", backdropFilter: "blur(8px)",
                        border: "1px solid var(--border)",
                        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.2s",
                        opacity: isHovering ? 1 : 0,
                        transform: isHovering ? "scale(1)" : "scale(0.6)",
                    }}>
                        <Heart size={14} color={wishlist ? "var(--secondary)" : "var(--text-primary)"} fill={wishlist ? "var(--secondary)" : "none"} />
                    </button>

                    {/* Quick view — button instead of Link to avoid nested <a> hydration error */}
                    <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); router.push(`/products/${product.slug}`); }}
                        style={{
                            position: "absolute", top: "10px", right: "50px",
                            width: "32px", height: "32px",
                            background: "var(--bg-elevated)", backdropFilter: "blur(8px)",
                            border: "1px solid var(--border)",
                            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", transition: "all 0.2s",
                            opacity: isHovering ? 1 : 0,
                            transform: isHovering ? "scale(1)" : "scale(0.6)",
                        }}
                    >
                        <Eye size={14} color="var(--text-primary)" />
                    </button>

                    {/* Trending badge */}
                    {product.demandScore && product.demandScore > 80 && (
                        <div style={{
                            position: "absolute", bottom: isHovering ? "62px" : "10px", left: "10px",
                            background: "var(--success)", backdropFilter: "blur(8px)",
                            borderRadius: "6px", padding: "3px 8px",
                            display: "flex", alignItems: "center", gap: "4px",
                            transition: "bottom 0.3s ease",
                        }}>
                            <TrendingUp size={10} color="var(--bg-card)" />
                            <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--bg-card)" }}>Trending</span>
                        </div>
                    )}

                    {/* Quick Add button */}
                    <button
                        onClick={handleAddToCart}
                        className="quick-add"
                        style={{
                            display: "flex", alignItems: "center", gap: "7px",
                            padding: "10px 22px", borderRadius: "10px",
                            background: adding
                                ? "var(--success)"
                                : "var(--primary)",
                            color: "var(--bg-card)", border: "none", cursor: "pointer",
                            fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap",
                            boxShadow: "var(--shadow-sm)",
                            fontFamily: "inherit",
                            transition: "background 0.3s ease",
                        }}
                    >
                        <ShoppingCart size={14} />
                        {adding ? "Added ✓" : "Add to Cart"}
                    </button>
                </div>

                {/* ── Info ── */}
                <div style={{ padding: "12px 14px 14px" }}>
                    {/* Brand + Category */}
                    <p style={{
                        fontSize: "11px", color: "var(--text-muted)",
                        fontWeight: 600, letterSpacing: "0.5px",
                        textTransform: "uppercase", marginBottom: "5px",
                    }}>
                        {product.brand || product.categoryName || ""}
                    </p>

                    {/* Product name */}
                    <p style={{
                        fontSize: "13px", fontWeight: 700, color: "var(--text-primary)",
                        lineHeight: 1.35, marginBottom: "7px",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}>{product.name}</p>

                    {/* Stars + review count */}
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
                        <div style={{ display: "flex", gap: "2px" }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} size={11}
                                    fill={i <= stars ? "var(--warn)" : "none"}
                                    color={i <= stars ? "var(--warn)" : "var(--text-muted)"}
                                    strokeWidth={1.5}
                                />
                            ))}
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            {avgRating.toFixed(1)} ({reviewCount})
                        </span>
                    </div>

                    {/* Price row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap", marginTop: "auto" }}>
                        <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                            $ / ৳{product.basePrice.toLocaleString()}
                        </span>
                        {product.comparePrice && (
                            <span style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "line-through" }}>
                                $ / ৳{product.comparePrice.toLocaleString()}
                            </span>
                        )}
                        {discount > 0 && (
                            <span style={{
                                fontSize: "10px", fontWeight: 600, color: "var(--secondary)",
                                background: "var(--bg-card)", padding: "2px 6px",
                                borderRadius: "100px", border: "1px solid var(--border)",
                            }}>{discount}% off</span>
                        )}
                    </div>

                    {/* Progress bar — only show when stock is low */}
                    {product.stock > 0 && product.stock < 30 && (
                        <div style={{ marginTop: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
                                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                                    {soldCount.toLocaleString()}+ sold
                                </span>
                                {product.stock < 10 && (
                                    <span style={{ fontSize: "10px", color: "var(--danger)", fontWeight: 700 }}>
                                        Only {product.stock} left!
                                    </span>
                                )}
                            </div>
                            <div style={{ height: "2px", borderRadius: "2px", background: "var(--bg-elevated)" }}>
                                <div style={{
                                    height: "100%", borderRadius: "2px",
                                    background: product.stock < 10
                                        ? "var(--danger)"
                                        : "var(--primary)",
                                    width: `${Math.min(100, (product.stock / 30) * 100)}%`,
                                }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
