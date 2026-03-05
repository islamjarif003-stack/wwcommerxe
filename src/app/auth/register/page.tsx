"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, ArrowRight, User, Mail, Phone, Lock, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

const FIELDS = [
    { key: "name", label: "Full Name", type: "text", placeholder: "Your full name", icon: User, required: true },
    { key: "email", label: "Email Address", type: "email", placeholder: "you@example.com", icon: Mail, required: true },
    { key: "phone", label: "Phone Number", type: "tel", placeholder: "01XXXXXXXXX", icon: Phone, required: false },
];

export default function RegisterPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
    const [showPwd, setShowPwd] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusField, setFocusField] = useState("");

    const passwordStrength = () => {
        const p = form.password;
        let score = 0;
        if (p.length >= 8) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score;
    };

    const strengthColors = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];
    const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
    const strength = passwordStrength();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) return toast.error("Passwords do not match");
        if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
        setIsLoading(true);
        try {
            const res = await api.auth.register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
            setAuth(res.data.user, res.data.token, res.data.refreshToken);
            toast.success(`Welcome to WW Commerce, ${res.data.user.name}! 🎉`, {
                style: { background: "#13131f", color: "#f0f0fa", border: "1px solid rgba(99,102,241,0.3)" },
            });
            router.push("/");
        } catch (err: any) {
            toast.error(err?.response?.data?.error || err.message || "Registration failed", {
                style: { background: "#13131f", color: "#f0f0fa", border: "1px solid rgba(239,68,68,0.3)" },
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh", background: "var(--bg-base)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden", padding: "24px",
        }}>
            {/* Background */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse at 20% 40%, rgba(99,102,241,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 60%, rgba(168,85,247,0.08) 0%, transparent 55%)",
            }} />
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
                maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
            }} />
            <div style={{ position: "absolute", top: "5%", right: "8%", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)", filter: "blur(70px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "10%", left: "5%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

            <div style={{ width: "100%", maxWidth: "460px", position: "relative", animation: "fadeUp 0.6s ease both" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
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
                            background: "linear-gradient(135deg, #a5b4fc, #c084fc)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        }}>WW Commerce</span>
                    </Link>
                </div>

                {/* Card */}
                <div style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "24px", padding: "36px",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
                }}>
                    <div style={{ marginBottom: "28px" }}>
                        <h1 style={{ fontSize: "26px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "6px" }}>
                            Create account
                        </h1>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Join thousands of happy customers</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Standard fields */}
                        {FIELDS.map(field => (
                            <div key={field.key} style={{ marginBottom: "16px" }}>
                                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                                    {field.label} {field.required && <span style={{ color: "#6366f1" }}>*</span>}
                                </label>
                                <div style={{ position: "relative" }}>
                                    <field.icon size={16}
                                        color={focusField === field.key ? "#818cf8" : "var(--text-muted)"}
                                        style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", transition: "color 0.2s" }}
                                    />
                                    <input
                                        type={field.type}
                                        value={(form as any)[field.key]}
                                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                        onFocus={() => setFocusField(field.key)}
                                        onBlur={() => setFocusField("")}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        style={{
                                            width: "100%", height: "48px",
                                            paddingLeft: "44px", paddingRight: "16px",
                                            background: "var(--bg-elevated)",
                                            border: `1px solid ${focusField === field.key ? "rgba(99,102,241,0.5)" : "var(--border)"}`,
                                            borderRadius: "12px", color: "var(--text-primary)", fontSize: "14px",
                                            fontFamily: "inherit", outline: "none", transition: "border-color 0.2s",
                                        }}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Password */}
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                                Password <span style={{ color: "#6366f1" }}>*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <Lock size={16}
                                    color={focusField === "password" ? "#818cf8" : "var(--text-muted)"}
                                    style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", transition: "color 0.2s" }}
                                />
                                <input
                                    type={showPwd ? "text" : "password"}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    onFocus={() => setFocusField("password")}
                                    onBlur={() => setFocusField("")}
                                    placeholder="Minimum 8 characters"
                                    required
                                    style={{
                                        width: "100%", height: "48px",
                                        paddingLeft: "44px", paddingRight: "48px",
                                        background: "var(--bg-elevated)",
                                        border: `1px solid ${focusField === "password" ? "rgba(99,102,241,0.5)" : "var(--border)"}`,
                                        borderRadius: "12px", color: "var(--text-primary)", fontSize: "14px",
                                        fontFamily: "inherit", outline: "none", transition: "border-color 0.2s",
                                    }}
                                />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                                    position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex",
                                }}>
                                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>

                            {/* Strength bar */}
                            {form.password.length > 0 && (
                                <div style={{ marginTop: "8px" }}>
                                    <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} style={{
                                                flex: 1, height: "3px", borderRadius: "2px",
                                                background: i <= strength ? strengthColors[strength - 1] : "rgba(255,255,255,0.06)",
                                                transition: "background 0.3s ease",
                                            }} />
                                        ))}
                                    </div>
                                    {strength > 0 && (
                                        <p style={{ fontSize: "11px", fontWeight: 600, color: strengthColors[strength - 1] }}>
                                            {strengthLabels[strength - 1]} password
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                                Confirm Password <span style={{ color: "#6366f1" }}>*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <Lock size={16}
                                    color={focusField === "confirm" ? "#818cf8" : "var(--text-muted)"}
                                    style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", transition: "color 0.2s" }}
                                />
                                <input
                                    type={showPwd ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                    onFocus={() => setFocusField("confirm")}
                                    onBlur={() => setFocusField("")}
                                    placeholder="Re-enter your password"
                                    required
                                    style={{
                                        width: "100%", height: "48px",
                                        paddingLeft: "44px", paddingRight: "48px",
                                        background: "var(--bg-elevated)",
                                        border: `1px solid ${focusField === "confirm" ? "rgba(99,102,241,0.5)"
                                            : form.confirmPassword && form.password !== form.confirmPassword
                                                ? "rgba(239,68,68,0.4)"
                                                : form.confirmPassword && form.password === form.confirmPassword
                                                    ? "rgba(16,185,129,0.4)"
                                                    : "var(--border)"
                                            }`,
                                        borderRadius: "12px", color: "var(--text-primary)", fontSize: "14px",
                                        fontFamily: "inherit", outline: "none", transition: "border-color 0.2s",
                                    }}
                                />
                                {form.confirmPassword && form.password === form.confirmPassword && (
                                    <CheckCircle size={17} color="#34d399" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }} />
                                )}
                            </div>
                            {form.confirmPassword && form.password !== form.confirmPassword && (
                                <p style={{ fontSize: "12px", color: "#f87171", marginTop: "5px" }}>Passwords don't match</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={isLoading} style={{
                            width: "100%", height: "50px",
                            background: isLoading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                            color: "white", border: "none", borderRadius: "14px",
                            fontSize: "15px", fontWeight: 800, cursor: isLoading ? "not-allowed" : "pointer",
                            fontFamily: "inherit", transition: "all 0.3s ease",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                            boxShadow: isLoading ? "none" : "0 8px 32px rgba(99,102,241,0.45)",
                        }}
                            onMouseEnter={e => { if (!isLoading) { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 40px rgba(99,102,241,0.55)"; } }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(99,102,241,0.45)"; }}>
                            {isLoading ? (
                                <>
                                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "var(--text-primary)", animation: "spin 0.7s linear infinite" }} />
                                    Creating account...
                                </>
                            ) : (
                                <>Create Account <ArrowRight size={17} /></>
                            )}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" }}>
                        Already have an account?{" "}
                        <Link href="/auth/login" style={{ color: "#818cf8", fontWeight: 700, textDecoration: "none" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "#a5b4fc")}
                            onMouseLeave={e => (e.currentTarget.style.color = "#818cf8")}>
                            Sign in →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
