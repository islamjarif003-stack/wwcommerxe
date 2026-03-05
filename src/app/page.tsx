"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Truck, Star, TrendingUp, Package, ChevronRight, Sparkles, Clock, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { HeroVideo } from "@/components/HeroVideo";
import { api } from "@/lib/apiClient";
import { usePrice } from "@/hooks/usePrice";

const HERO_SLIDES = [
  {
    tag: "New Arrivals",
    title: "Earthy Luxury",
    titleAlt: "for Everyday Life",
    sub: "Discover handpicked styles · Free delivery to Dhaka",
    cta: "Shop Essentials",
    href: "/shop",
    bg1: "#ECE1CF", bg2: "#FAF6F0", bg3: "#D8D2C0",
    glow1: "rgba(219,114,82,0.15)", glow2: "rgba(31,64,58,0.1)",
    accent: "#DB7252",
  },
  {
    tag: "Signature Collection",
    title: "Minimalist",
    titleAlt: "Aesthetics",
    sub: "Timeless designs blending comfort with sophistication",
    cta: "Explore Collection",
    href: "/shop?tag=signature",
    bg1: "#FAF6F0", bg2: "#ECE1CF", bg3: "#E4D8C5",
    glow1: "rgba(31,64,58,0.15)", glow2: "rgba(219,114,82,0.1)",
    accent: "#1F403A",
  },
  {
    tag: "Artisan Made",
    title: "Crafted with",
    titleAlt: "Utmost Care",
    sub: "Sustainable materials and ethical production",
    cta: "Discover Artisan",
    href: "/shop?tag=artisan",
    bg1: "#E4D8C5", bg2: "#FAF6F0", bg3: "#ECE1CF",
    glow1: "rgba(185,172,155,0.25)", glow2: "rgba(31,64,58,0.08)",
    accent: "#1F403A",
  },
];

const STATS = [
  { value: "50K+", label: "Happy Customers" },
  { value: "10K+", label: "Products" },
  { value: "64", label: "Districts Covered" },
  { value: "4.8★", label: "Average Rating" },
];

const FEATURES = [
  { icon: Truck, label: "Same Day Delivery", desc: "Dhaka city · Next day others", color: "var(--primary)", bg: "var(--primary-glow)" },
  { icon: Shield, label: "100% Authentic", desc: "Every product verified", color: "var(--success)", bg: "rgba(46,105,85,0.1)" },
  { icon: Zap, label: "Easy COD", desc: "Pay when you receive", color: "var(--warn)", bg: "rgba(194,136,62,0.1)" },
  { icon: Award, label: "Best Prices", desc: "Guaranteed lowest price", color: "var(--purple)", bg: "rgba(219,114,82,0.1)" },
];

const DELIVERY = [
  { label: "Dhaka City", price: 60, days: "Same / Next Day", icon: "⚡" },
  { label: "Dhaka District", price: 80, days: "1-2 Days", icon: "🚚" },
  { label: "Anywhere else", price: 120, days: "3-5 Days", icon: "🇧🇩" },
];

export default function HomePage() {
  const { formatPrice } = usePrice();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [hotProducts, setHotProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(s => (s + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Promise.all([
      api.products.list({ featured: "true", limit: "8" }),
      api.categories.list(),
      api.products.list({ sort: "demand", limit: "4" }),
    ]).then(([f, c, h]) => {
      setFeaturedProducts(f.data.items || []);
      setCategories(c.data || []);
      setHotProducts(h.data.items || []);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const s = HERO_SLIDES[currentSlide];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar />

      {/* ══════════════ HERO ══════════════ */}
      <section style={{
        minHeight: "100vh", position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center",
        background: `radial-gradient(ellipse at 30% 30%, ${s.glow1} 0%, transparent 55%),
                     radial-gradient(ellipse at 70% 70%, ${s.glow2} 0%, transparent 55%),
                     linear-gradient(160deg, ${s.bg1} 0%, ${s.bg2} 50%, ${s.bg3} 100%)`,
        transition: "background 1.2s ease",
      }}>
        {/* Hero Background Video — desktop only, muted, autoplay, loop */}
        <HeroVideo
          sources={[
            "/videos/hero.mp4"
          ]}
          fallbackImage=""
          minHeight="100vh"
          overlayColor="rgba(236,225,207,0.7)"
        />

        {/* Animated grid overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(31,64,58,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(31,64,58,0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        }} />

        {/* Floating orbs */}
        {[
          { w: 500, h: 500, t: "-15%", l: "-10%", bg: s.glow1, delay: "0s" },
          { w: 400, h: 400, t: "50%", r: "-8%", bg: s.glow2, delay: "2s" },
          { w: 300, h: 300, t: "20%", l: "60%", bg: "rgba(244,114,182,0.08)", delay: "1s" },
        ].map((orb, i) => (
          <div key={i} style={{
            position: "absolute",
            width: orb.w, height: orb.h, borderRadius: "50%",
            background: `radial-gradient(circle, ${orb.bg}, transparent 70%)`,
            top: orb.t, left: (orb as any).l, right: (orb as any).r,
            filter: "blur(80px)", pointerEvents: "none",
            animation: `orb ${6 + i * 2}s ease-in-out infinite`,
            animationDelay: orb.delay,
          }} />
        ))}

        {/* Floating particles */}
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", borderRadius: "50%",
            width: `${3 + (i % 4) * 2}px`, height: `${3 + (i % 4) * 2}px`,
            background: s.accent, opacity: 0.5,
            left: `${8 + i * 9}%`, top: `${15 + (i % 5) * 16}%`,
            animation: `float ${4 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }} />
        ))}

        <div className="page-container" style={{ position: "relative", zIndex: 1, paddingTop: "80px", maxWidth: "100vw", overflowX: "hidden" }}>
          <div style={{ maxWidth: "820px", margin: "0 auto", textAlign: "center", padding: "40px 0 60px" }}>

            {/* Pill tag */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "7px 20px", borderRadius: "100px",
              background: `${s.accent}18`,
              border: `1px solid ${s.accent}40`,
              fontSize: "13px", fontWeight: 700, color: s.accent,
              marginBottom: "28px",
              animation: "fadeUp 0.6s ease both",
            }}>
              <Sparkles size={13} /> {s.tag}
            </div>

            {/* Headline */}
            <h1 key={currentSlide} style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(34px, 10vw, 96px)",
              fontWeight: 800, lineHeight: 1.05,
              wordWrap: "break-word",
              letterSpacing: "-0.02em",
              color: "var(--text-primary)", marginBottom: "24px",
              animation: "fadeUp 0.65s ease 0.1s both",
            }}>
              {s.title}{" "}
              <span style={{
                display: "inline-block",
                background: `linear-gradient(135deg, ${s.accent} 0%, var(--primary) 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>{s.titleAlt}</span>
            </h1>

            <p style={{
              fontSize: "clamp(15px, 2vw, 19px)", color: "var(--text-secondary)",
              marginBottom: "44px", lineHeight: 1.7,
              animation: "fadeUp 0.65s ease 0.2s both",
            }}>{s.sub}</p>

            <div style={{
              display: "flex", flexWrap: "wrap", gap: "14px",
              justifyContent: "center",
              animation: "fadeUp 0.65s ease 0.3s both",
            }}>
              <Link href={s.href} style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                padding: "16px 36px", borderRadius: "14px",
                background: `var(--primary)`,
                color: "var(--bg-card)", fontWeight: 700, fontSize: "16px",
                textDecoration: "none",
                boxShadow: `var(--shadow-sm)`,
                transition: "all 0.3s ease",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = `var(--shadow-md)`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = `var(--shadow-sm)`; }}>
                {s.cta} <ArrowRight size={18} />
              </Link>
              <Link href="/shop" style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                padding: "16px 36px", borderRadius: "14px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)", fontWeight: 700, fontSize: "16px", textDecoration: "none",
                backdropFilter: "blur(12px)", transition: "all 0.3s ease",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}>
                Browse All
              </Link>
            </div>

            {/* Slide dots */}
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "52px" }}>
              {HERO_SLIDES.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)} style={{
                  height: "4px", borderRadius: "2px",
                  width: i === currentSlide ? "40px" : "8px",
                  background: i === currentSlide ? s.accent : "rgba(255,255,255,0.2)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "all 0.4s ease",
                }} />
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="stats-grid-hero" style={{
            gap: "1px",
            background: "var(--border)",
            borderRadius: "20px", overflow: "hidden",
            animation: "fadeUp 0.7s ease 0.4s both",
            marginBottom: "0",
            boxShadow: "var(--shadow-sm)"
          }}>
            {STATS.map((st) => (
              <div key={st.label} style={{
                background: "var(--bg-surface)", backdropFilter: "blur(12px)",
                padding: "20px 24px", textAlign: "center",
              }}>
                <div style={{ fontSize: "clamp(20px,3vw,30px)", fontWeight: 900, color: "var(--text-primary)" }}>{st.value}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px", fontWeight: 600 }}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section style={{ padding: "0", background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="page-container">
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={f.label} className="feature-item" style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "20px 24px",
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "14px",
                  background: f.bg, display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0,
                  border: `1px solid ${f.color}25`,
                }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{f.label}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CATEGORIES ══════════════ */}
      {categories.length > 0 && (
        <section style={{ padding: "64px 0" }}>
          <div className="page-container">
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px" }}>
              <div>
                <div className="section-label">Collections</div>
                <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  Shop by Category
                </h2>
              </div>
              <Link href="/shop" className="btn-ghost">All <ChevronRight size={14} /></Link>
            </div>

            {/* Compact category grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "12px",
            }}>
              {categories.slice(0, 8).map((cat: any) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} style={{
                  position: "relative",
                  display: "block",
                  height: "160px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  textDecoration: "none",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}>
                  {/* Background image */}
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      transition: "transform 0.5s ease",
                      position: "absolute", inset: 0,
                    }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
                  ) : (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(135deg, var(--bg-elevated), var(--bg-card))",
                    }} />
                  )}

                  {/* Gradient overlay */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)",
                  }} />

                  {/* Text */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "14px 14px",
                  }}>
                    <p style={{ fontSize: "13px", fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: "3px" }}>
                      {cat.name}
                    </p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                      {cat.productCount || 0} products
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ══════════════ TRENDING ══════════════ */}
      {hotProducts.length > 0 && (
        <section style={{ padding: "20px 0 80px" }}>
          <div className="page-container">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px" }}>
              <div>
                <div className="section-label">AI Detected</div>
                <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  🔥 Trending Right Now
                </h2>
              </div>
              <Link href="/shop?sort=demand" className="btn-ghost">See all <ChevronRight size={14} /></Link>
            </div>

            {/* Fancy horizontal scroller on mobile, grid on desktop */}
            <div className="products-grid">
              {hotProducts.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ FEATURED PRODUCTS ══════════════ */}
      <section style={{ padding: "0 0 80px", background: "var(--bg-surface)", borderTop: "1px solid var(--border)" }}>
        <div className="page-container" style={{ paddingTop: "80px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "40px" }}>
            <div>
              <div className="section-label">Handpicked</div>
              <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Featured Products</h2>
            </div>
            <Link href="/shop?featured=true" className="btn-ghost">View All <ChevronRight size={14} /></Link>
          </div>

          {isLoading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ borderRadius: "20px", overflow: "hidden", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <div className="skeleton" style={{ aspectRatio: "3/4" }} />
                  <div style={{ padding: "16px" }}>
                    <div className="skeleton" style={{ height: "14px", borderRadius: "6px", marginBottom: "10px", width: "65%" }} />
                    <div className="skeleton" style={{ height: "12px", borderRadius: "6px", marginBottom: "10px", width: "45%" }} />
                    <div className="skeleton" style={{ height: "20px", borderRadius: "8px", width: "38%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="products-grid">
              {featuredProducts.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
              <Package size={52} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
              <p style={{ fontSize: "16px" }}>No products yet.</p>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <Link href="/shop" className="btn-primary" style={{ padding: "14px 40px", fontSize: "15px" }}>
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ DELIVERY ZONES BANNER ══════════════ */}
      <section style={{ padding: "80px 0" }}>
        <div className="page-container">
          <div style={{
            borderRadius: "28px", overflow: "hidden", position: "relative",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            padding: "56px 48px",
          }}>
            {/* Background grid */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }} />
            {/* Glow */}
            <div style={{
              position: "absolute", top: "-40%", right: "-10%",
              width: "500px", height: "500px", borderRadius: "50%",
              background: "radial-gradient(circle, var(--primary-glow), transparent 70%)",
              filter: "blur(60px)", pointerEvents: "none",
            }} />

            <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "40px" }}>
              <div style={{ flex: 1, minWidth: "280px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                  <Truck size={20} color="#818cf8" />
                  <span className="badge badge-primary">Nationwide Delivery</span>
                </div>
                <h3 style={{
                  fontSize: "clamp(24px,4vw,44px)", fontWeight: 800,
                  color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "28px",
                }}>
                  Delivered to Every<br />Corner of{" "}
                  <span style={{ color: "var(--secondary)" }}>Bangladesh 🇧🇩</span>
                </h3>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {DELIVERY.map(z => (
                    <div key={z.label} style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      backdropFilter: "blur(12px)",
                      borderRadius: "16px", padding: "16px 22px",
                      minWidth: "140px",
                    }}>
                      <div style={{ fontSize: "22px", marginBottom: "8px" }}>{z.icon}</div>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{z.label}</p>
                      <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary)", margin: "3px 0" }}>{formatPrice(z.price)}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{z.days}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: "88px", lineHeight: 1, filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))" }}>🇧🇩</div>
                <div style={{
                  marginTop: "16px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px", padding: "10px 20px",
                }}>
                  <p style={{ fontSize: "24px", fontWeight: 800, color: "var(--primary)" }}>64</p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Districts Covered</p>
                </div>
                <p style={{ fontSize: "13px", color: "var(--secondary)", marginTop: "10px", fontWeight: 600 }}>
                  🎁 Free delivery over {formatPrice(1000)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-surface)", padding: "60px 0 32px" }}>
        <div className="page-container">
          <div className="footer-grid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: "var(--primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "var(--shadow-sm)",
                }}>
                  <Zap size={18} color="white" />
                </div>
                <span style={{
                  fontSize: "19px", fontWeight: 800,
                  color: "var(--text-primary)",
                }}>WW Commerce</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "20px", maxWidth: "280px" }}>
                Bangladesh's most advanced AI-powered ecommerce platform. Smart shopping, fast delivery, guaranteed authentic products.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                {["bKash", "Nagad", "COD"].map(m => (
                  <span key={m} style={{
                    padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700,
                    background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}>{m}</span>
                ))}
              </div>
            </div>

            {[
              { title: "Shop", links: [{ l: "Men's Fashion", h: "/shop?category=mens-fashion" }, { l: "Women's Fashion", h: "/shop?category=womens-fashion" }, { l: "Electronics", h: "/shop?category=electronics" }, { l: "Home & Living", h: "/shop?category=home" }, { l: "Grocery", h: "/shop?category=grocery" }] },
              { title: "Help", links: [{ l: "Track Order", h: "/track" }, { l: "Return Policy", h: "#" }, { l: "FAQ", h: "#" }, { l: "Contact Us", h: "#" }] },
              { title: "Company", links: [{ l: "About Us", h: "#" }, { l: "Careers", h: "#" }, { l: "Blog", h: "#" }, { l: "Privacy Policy", h: "#" }] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "18px", letterSpacing: "0.5px", textTransform: "uppercase" }}>{col.title}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {col.links.map(li => (
                    <Link key={li.l} href={li.h} style={{ fontSize: "13px", color: "var(--text-muted)", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>{li.l}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: "1px solid var(--border)", paddingTop: "24px",
            display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px",
          }}>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>© 2026 WW Commerce. All rights reserved.</p>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              {[
                { icon: Shield, label: "SSL Secured", color: "#818cf8" },
                { icon: Zap, label: "COD Available", color: "#fbbf24" },
                { icon: Truck, label: "64 Districts", color: "#34d399" },
              ].map(item => (
                <span key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                  <item.icon size={13} color={item.color} /> {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
