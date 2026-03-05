"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to your error tracking service (Sentry, etc.)
        console.error("[GlobalError]", error);
    }, [error]);

    return (
        <html lang="en">
            <body style={{
                minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                background: "#0a0a14", fontFamily: "'Inter', sans-serif",
                padding: "24px", flexDirection: "column", textAlign: "center",
            }}>
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>⚠️</div>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "white", marginBottom: "12px" }}>
                    Something went wrong
                </h1>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px", maxWidth: "400px", marginBottom: "32px" }}>
                    An unexpected error occurred. Our team has been notified.
                </p>
                {error.digest && (
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", marginBottom: "24px" }}>
                        Error ID: {error.digest}
                    </p>
                )}
                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        onClick={reset}
                        style={{
                            padding: "12px 24px", borderRadius: "10px", cursor: "pointer",
                            background: "linear-gradient(135deg, #6366f1, #a855f7)",
                            color: "white", fontWeight: 700, border: "none", fontSize: "14px",
                        }}
                    >
                        Try Again
                    </button>
                    <Link href="/" style={{
                        padding: "12px 24px", borderRadius: "10px",
                        background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: "14px", textDecoration: "none",
                    }}>
                        Go Home
                    </Link>
                </div>
            </body>
        </html>
    );
}
