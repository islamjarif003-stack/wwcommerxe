"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search, Menu, X, Zap, ChevronDown, User, LogOut, Settings, Package } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { CartDrawer } from "./CartDrawer";
import { usePrice } from "@/hooks/usePrice";

const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Deals", href: "/shop?tag=deal" },
    { label: "Track Order", href: "/track" },
];

export default function Navbar() {
    const { formatPrice, currency, setCurrency } = usePrice();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [cartHover, setCartHover] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const count = useCartStore((s) => s.itemCount());
    const { toggleCart } = useCartStore();
    const { user, clearAuth, isAdmin } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
    }, [searchOpen]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
            setSearchOpen(false);
        }
    };

    if (pathname.startsWith("/admin")) return null;

    const navbarBg = scrolled
        ? "rgba(250,246,240,0.85)"
        : "transparent";
    const navbarBorder = scrolled
        ? "1px solid var(--border)"
        : "1px solid transparent";

    return (
        <>
            <header style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                background: navbarBg,
                backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
                WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
                borderBottom: navbarBorder,
                transition: "all 0.35s ease",
                boxShadow: scrolled ? "var(--shadow-sm)" : "none",
            }}>
                {/* Announcement bar */}
                {!scrolled && (
                    <div className="announcement-bar" style={{
                        background: "var(--primary)",
                        textAlign: "center", fontWeight: 600,
                        color: "white", letterSpacing: "0.3px",
                    }}>
                        <span>🚀 <span className="hide-on-mobile" style={{ margin: "0 4px" }}>Free delivery on orders over {formatPrice(1)},000 ·</span> Dhaka same-day · 64 districts</span>
                    </div>
                )}

                <div className="page-container">
                    <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between",
                        height: "60px", gap: "12px",
                    }}>
                        {/* Logo */}
                        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}>
                            <img
                                src="/logo_transparent.png"
                                alt="Moon IT Shop"
                                style={{
                                    width: "44px", height: "44px", objectFit: "contain",
                                    marginRight: "4px",
                                    transition: "all 0.3s ease",
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                            />
                            <span className="desktop-only" style={{
                                fontSize: "17px", fontWeight: 900, letterSpacing: "-0.02em",
                                color: "var(--text-primary)",
                            }}>Moon IT Shop</span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="desktop-only" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: "2px" }}>
                            {NAV_LINKS.map(l => {
                                const isActive = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href.split("?")[0]);
                                return (
                                    <Link key={l.href} href={l.href} style={{
                                        padding: "7px 16px", borderRadius: "8px", fontSize: "14px",
                                        fontWeight: isActive ? 700 : 500, textDecoration: "none",
                                        color: isActive ? "var(--primary)" : "var(--text-secondary)",
                                        background: isActive ? "var(--primary-glow)" : "transparent",
                                        border: isActive ? "1px solid var(--border-accent)" : "1px solid transparent",
                                        transition: "all 0.2s ease", whiteSpace: "nowrap",
                                    }}
                                        onMouseEnter={e => {
                                            if (!isActive) {
                                                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                                                (e.currentTarget as HTMLElement).style.background = "var(--border-subtle)";
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!isActive) {
                                                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                                                (e.currentTarget as HTMLElement).style.background = "transparent";
                                            }
                                        }}>
                                        {l.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Actions */}
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                            {/* Search */}
                            {searchOpen ? (
                                <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div style={{ position: "relative" }}>
                                        <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="Search products..."
                                            style={{
                                                width: "220px", height: "38px",
                                                paddingLeft: "36px", paddingRight: "12px",
                                                background: "var(--bg-elevated)",
                                                border: "1px solid var(--border)",
                                                borderRadius: "10px", outline: "none",
                                                color: "var(--text-primary)", fontSize: "13px", fontFamily: "inherit",
                                                boxShadow: "var(--shadow-sm)"
                                            }}
                                            onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                                        />
                                    </div>
                                    <button type="button" onClick={() => setSearchOpen(false)} style={{
                                        width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
                                        background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
                                        borderRadius: "8px",
                                    }}>
                                        <X size={16} />
                                    </button>
                                </form>
                            ) : (
                                <button onClick={() => setSearchOpen(true)} style={{
                                    width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center",
                                    background: "transparent", border: "1px solid transparent", borderRadius: "10px",
                                    color: "var(--text-muted)", cursor: "pointer", transition: "all 0.2s",
                                }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--primary)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                                    <Search size={18} />
                                </button>
                            )}

                            {/* Currency Toggle */}
                            {mounted && (
                                <button onClick={() => setCurrency(currency === "BDT" ? "USD" : "BDT")} style={{
                                    height: "38px", padding: "0 10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                                    background: "transparent", border: "1px solid var(--border)", borderRadius: "10px",
                                    color: "var(--text-primary)", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                                }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
                                    <span style={{ color: currency === "BDT" ? "var(--primary)" : "var(--text-muted)" }}>৳</span>
                                    <span style={{ color: "var(--border)", fontWeight: 400 }}>|</span>
                                    <span style={{ color: currency === "USD" ? "var(--primary)" : "var(--text-muted)" }}>$</span>
                                </button>
                            )}

                            {/* Cart */}
                            <button onClick={toggleCart} style={{
                                width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center",
                                background: cartHover ? "var(--bg-elevated)" : "transparent",
                                border: "1px solid transparent", borderRadius: "10px",
                                color: cartHover ? "var(--primary)" : "var(--text-muted)",
                                cursor: "pointer", transition: "all 0.2s", position: "relative",
                            }}
                                onMouseEnter={() => setCartHover(true)}
                                onMouseLeave={() => setCartHover(false)}>
                                <ShoppingCart size={19} />
                                {mounted && count > 0 && (
                                    <span style={{
                                        position: "absolute", top: "4px", right: "4px",
                                        width: "16px", height: "16px",
                                        background: "var(--secondary)",
                                        color: "white", fontSize: "10px", fontWeight: 800,
                                        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                        border: "2px solid var(--bg-surface)",
                                        boxShadow: "0 2px 8px rgba(219,114,82,0.5)",
                                    }}>
                                        {count > 9 ? "9+" : count}
                                    </span>
                                )}
                            </button>

                            {/* User */}
                            <div ref={userMenuRef} style={{ position: "relative" }}>
                                {user ? (
                                    <>
                                        <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{
                                            display: "flex", alignItems: "center", gap: "8px",
                                            padding: "5px 10px 5px 5px", borderRadius: "100px",
                                            background: userMenuOpen ? "var(--bg-elevated)" : "transparent",
                                            border: "1px solid var(--border)",
                                            cursor: "pointer", transition: "all 0.2s",
                                        }}>
                                            <div style={{
                                                width: "28px", height: "28px", borderRadius: "50%",
                                                background: "var(--primary-light)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                color: "white", fontSize: "12px", fontWeight: 800,
                                                flexShrink: 0,
                                            }}>{user.name.charAt(0).toUpperCase()}</div>
                                            <span className="desktop-only" style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {user.name.split(" ")[0]}
                                            </span>
                                            <ChevronDown size={13} color="var(--text-muted)" style={{ transition: "transform 0.2s", transform: userMenuOpen ? "rotate(180deg)" : "rotate(0)" }} />
                                        </button>

                                        {userMenuOpen && (
                                            <div style={{
                                                position: "absolute", right: 0, top: "calc(100% + 10px)",
                                                width: "240px", zIndex: 200,
                                                background: "var(--bg-elevated)",
                                                border: "1px solid var(--border)",
                                                borderRadius: "16px",
                                                boxShadow: "var(--shadow-md)",
                                                animation: "slideDown 0.2s ease both",
                                                overflow: "hidden",
                                            }}>
                                                {/* User header */}
                                                <div style={{
                                                    padding: "16px 18px",
                                                    background: "var(--primary-glow)",
                                                    borderBottom: "1px solid var(--border)",
                                                }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                        <div style={{
                                                            width: "40px", height: "40px", borderRadius: "50%",
                                                            background: "var(--primary-light)",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            color: "white", fontSize: "16px", fontWeight: 800,
                                                        }}>{user.name.charAt(0).toUpperCase()}</div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1px" }}>{user.name}</p>
                                                            <p style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                                                        </div>
                                                    </div>
                                                    {user.loyaltyPoints > 0 && (
                                                        <div style={{
                                                            marginTop: "10px", padding: "6px 10px", borderRadius: "8px",
                                                            background: "rgba(194,136,62,0.1)", border: "1px solid rgba(194,136,62,0.2)",
                                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                                        }}>
                                                            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Loyalty Points</span>
                                                            <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--warn)" }}>৳ {user.loyaltyPoints}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Menu items */}
                                                <div style={{ padding: "6px" }}>
                                                    {[
                                                        { icon: User, label: "My Account", href: "/account" },
                                                        { icon: Package, label: "My Orders", href: "/account/orders" },
                                                    ].map(item => (
                                                        <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)} style={{
                                                            display: "flex", alignItems: "center", gap: "10px",
                                                            padding: "9px 12px", borderRadius: "10px",
                                                            fontSize: "13px", fontWeight: 500,
                                                            color: "var(--text-secondary)", textDecoration: "none",
                                                            transition: "all 0.15s",
                                                        }}
                                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--primary)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"; }}
                                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                                                            <item.icon size={15} />
                                                            {item.label}
                                                        </Link>
                                                    ))}
                                                    {isAdmin() && (
                                                        <Link href="/admin" onClick={() => setUserMenuOpen(false)} style={{
                                                            display: "flex", alignItems: "center", gap: "10px",
                                                            padding: "9px 12px", borderRadius: "10px",
                                                            fontSize: "13px", fontWeight: 600,
                                                            color: "var(--primary)", textDecoration: "none",
                                                            background: "var(--primary-glow)",
                                                            border: "1px solid var(--border-accent)",
                                                            margin: "3px 0",
                                                            transition: "all 0.15s",
                                                        }}>
                                                            <Settings size={15} /> Admin Panel ⚡
                                                        </Link>
                                                    )}
                                                    <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
                                                    <button onClick={() => { clearAuth(); setUserMenuOpen(false); window.location.href = "/"; }} style={{
                                                        width: "100%", display: "flex", alignItems: "center", gap: "10px",
                                                        padding: "9px 12px", borderRadius: "10px",
                                                        fontSize: "13px", fontWeight: 500,
                                                        color: "#f87171", background: "none", border: "none", cursor: "pointer",
                                                        textAlign: "left", transition: "all 0.15s", fontFamily: "inherit",
                                                    }}
                                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
                                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                                                        <LogOut size={15} /> Sign out
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link href="/auth/login" className="desktop-only" style={{
                                        display: "inline-flex", alignItems: "center", gap: "7px",
                                        padding: "8px 18px", borderRadius: "10px",
                                        background: "var(--primary)",
                                        color: "white", fontSize: "13px", fontWeight: 700, textDecoration: "none",
                                        boxShadow: "var(--shadow-sm)",
                                        transition: "all 0.25s ease",
                                        whiteSpace: "nowrap",
                                    }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; }}>
                                        <User size={14} /> Login
                                    </Link>
                                )}
                            </div>

                            {/* Mobile menu btn */}
                            <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-only" style={{
                                width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center",
                                background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
                                borderRadius: "10px", color: "rgba(255,255,255,0.7)", cursor: "pointer",
                            }}>
                                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="mobile-only" style={{
                        flexDirection: "column", padding: "8px 24px 20px",
                        borderTop: "1px solid var(--border)",
                        background: "rgba(7,7,17,0.97)", backdropFilter: "blur(20px)",
                        animation: "slideDown 0.2s ease",
                    }}>
                        {NAV_LINKS.map(l => (
                            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{
                                display: "block", padding: "12px 14px", borderRadius: "10px",
                                color: pathname === l.href ? "var(--primary)" : "var(--text-secondary)",
                                fontWeight: pathname === l.href ? 700 : 500, fontSize: "15px",
                                textDecoration: "none", marginBottom: "2px",
                                background: pathname === l.href ? "var(--primary-glow)" : "transparent",
                            }}>{l.label}</Link>
                        ))}

                        {!user && (
                            <Link href="/auth/login" onClick={() => setMobileOpen(false)} style={{
                                display: "block", padding: "12px 14px", borderRadius: "10px",
                                color: "white",
                                fontWeight: 700, fontSize: "15px",
                                textDecoration: "none", marginTop: "10px",
                                background: "var(--primary)",
                                textAlign: "center"
                            }}>Login Options <User size={14} style={{ display: "inline", marginBottom: "-2px" }} /></Link>
                        )}
                    </div>
                )}
            </header>

            <CartDrawer />
        </>
    );
}
