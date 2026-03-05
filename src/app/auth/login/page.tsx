"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap, ArrowRight, Shield, Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focusEmail, setFocusEmail] = useState(false);
    const [focusPass, setFocusPass] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return toast.error("Please fill all fields");
        setLoading(true);
        try {
            const res = await api.auth.login({ email, password });
            if (res.data.token) {
                setAuth(res.data.user, res.data.token, res.data.refreshToken);
                toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}! 👋`, {
                    style: { background: "#FFFDFC", color: "#172B26", border: "1px solid rgba(46,105,85,0.35)" },
                });
                const isAdmin = ["admin", "superadmin", "manager"].includes(res.data.user.role);
                router.replace(isAdmin ? "/admin" : "/");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || err?.message || "Invalid credentials", {
                style: { background: "#FFFDFC", color: "#172B26", border: "1px solid rgba(179,74,64,0.4)" },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh", background: "var(--bg-base)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
            padding: "24px",
        }}>
            {/* Background */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.08) 0%, transparent 55%)",
            }} />
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
                maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
            }} />
            {/* Orbs */}
            <div style={{ position: "absolute", top: "10%", left: "5%", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "15%", right: "5%", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.14), transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

            <div style={{ width: "100%", maxWidth: "440px", position: "relative", animation: "fadeUp 0.6s ease both" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
                        <div style={{
                            width: "44px", height: "44px", borderRadius: "14px",
                            background: "linear-gradient(135deg, #6366f1, #a855f7)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 8px 24px rgba(99,102,241,0.45)",
                        }}>
                            <Zap size={22} color="white" />
                        </div>
                        <span style={{
                            fontSize: "22px", fontWeight: 900,
                            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        }}>WW Commerce</span>
                    </Link>
                </div>

                {/* Card */}
                <div style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "24px",
                    padding: "36px",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
                }}>
                    <div style={{ marginBottom: "28px" }}>
                        <h1 style={{ fontSize: "26px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "6px" }}>
                            Welcome back
                        </h1>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                                Email Address
                            </label>
                            <div style={{ position: "relative" }}>
                                <Mail size={16} color={focusEmail ? "#818cf8" : "var(--text-muted)"} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", transition: "color 0.2s" }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onFocus={() => setFocusEmail(true)}
                                    onBlur={() => setFocusEmail(false)}
                                    placeholder="you@example.com"
                                    required
                                    style={{
                                        width: "100%", height: "48px",
                                        paddingLeft: "44px", paddingRight: "16px",
                                        background: "var(--bg-elevated)",
                                        border: `1px solid ${focusEmail ? "rgba(99,102,241,0.5)" : "var(--border)"}`,
                                        borderRadius: "12px", color: "var(--text-primary)", fontSize: "14px",
                                        fontFamily: "inherit", outline: "none", transition: "border-color 0.2s",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>Password</label>
                                <Link href="#" style={{ fontSize: "12px", color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}
                                    onMouseEnter={e => (e.currentTarget.style.color = "#4338ca")}
                                    onMouseLeave={e => (e.currentTarget.style.color = "#4f46e5")}>
                                    Forgot password?
                                </Link>
                            </div>
                            <div style={{ position: "relative" }}>
                                <Lock size={16} color={focusPass ? "#818cf8" : "var(--text-muted)"} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", transition: "color 0.2s" }} />
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onFocus={() => setFocusPass(true)}
                                    onBlur={() => setFocusPass(false)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: "100%", height: "48px",
                                        paddingLeft: "44px", paddingRight: "48px",
                                        background: "var(--bg-elevated)",
                                        border: `1px solid ${focusPass ? "rgba(99,102,241,0.5)" : "var(--border)"}`,
                                        borderRadius: "12px", color: "var(--text-primary)", fontSize: "14px",
                                        fontFamily: "inherit", outline: "none", transition: "border-color 0.2s",
                                    }}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                    position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
                                    padding: "4px", display: "flex",
                                }}>
                                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading} style={{
                            width: "100%", height: "50px",
                            background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                            color: "white", border: "none", borderRadius: "14px",
                            fontSize: "15px", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
                            fontFamily: "inherit", transition: "all 0.3s ease",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                            boxShadow: loading ? "none" : "0 8px 32px rgba(99,102,241,0.45)",
                        }}
                            onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 40px rgba(99,102,241,0.55)"; } }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(99,102,241,0.45)"; }}>
                            {loading ? (
                                <>
                                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "var(--text-primary)", animation: "spin 0.7s linear infinite" }} />
                                    Signing in...
                                </>
                            ) : (
                                <>Sign In <ArrowRight size={17} /></>
                            )}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div style={{
                        marginTop: "20px", padding: "14px 16px",
                        background: "rgba(99,102,241,0.06)",
                        border: "1px solid rgba(99,102,241,0.15)",
                        borderRadius: "12px",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                            <Shield size={13} color="#4f46e5" />
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.5px" }}>Demo Admin Account</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {[
                                { k: "Email", v: "admin@wwcommerce.com" },
                                { k: "Password", v: "Admin@1234" },
                            ].map(item => (
                                <div key={item.k} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "12px", color: "var(--text-muted)", minWidth: "58px" }}>{item.k}:</span>
                                    <button onClick={() => {
                                        if (item.k === "Email") setEmail(item.v);
                                        else setPassword(item.v);
                                    }} style={{
                                        fontSize: "12px", color: "#4f46e5", fontFamily: "inherit",
                                        background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                                        padding: "2px 8px", borderRadius: "5px", cursor: "pointer",
                                        fontWeight: 600,
                                    }}>{item.v}</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" }}>
                        Don't have an account?{" "}
                        <Link href="/auth/register" style={{ color: "#4f46e5", fontWeight: 700 }}
                            onMouseEnter={e => (e.currentTarget.style.color = "#4338ca")}
                            onMouseLeave={e => (e.currentTarget.style.color = "#4f46e5")}>
                            Create account →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
