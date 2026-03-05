import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "404 — Page Not Found | WW Commerce",
};

export default function NotFound() {
    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "#0a0a14", fontFamily: "'Inter', sans-serif",
            padding: "24px", flexDirection: "column", textAlign: "center",
        }}>
            {/* Glow */}
            <div style={{
                position: "fixed", top: "30%", left: "50%", transform: "translateX(-50%)",
                width: "400px", height: "400px", borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)",
                filter: "blur(60px)", pointerEvents: "none",
            }} />

            <div style={{ position: "relative" }}>
                <h1 style={{
                    fontSize: "clamp(80px, 20vw, 180px)", fontWeight: 900, lineHeight: 1,
                    background: "linear-gradient(135deg, #6366f1, #a855f7, #f43f5e)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundClip: "text", marginBottom: "0",
                }}>404</h1>

                <h2 style={{ fontSize: "22px", fontWeight: 700, color: "white", marginTop: "8px", marginBottom: "12px" }}>
                    Page not found
                </h2>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px", maxWidth: "360px", margin: "0 auto 36px" }}>
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    <Link href="/" style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        padding: "13px 28px", borderRadius: "12px",
                        background: "linear-gradient(135deg, #6366f1, #a855f7)",
                        color: "white", fontWeight: 700, fontSize: "15px", textDecoration: "none",
                    }}>
                        🏠 Go Home
                    </Link>
                    <Link href="/shop" style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        padding: "13px 28px", borderRadius: "12px",
                        background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: "15px", textDecoration: "none",
                    }}>
                        🛍️ Browse Products
                    </Link>
                </div>
            </div>
        </div>
    );
}
