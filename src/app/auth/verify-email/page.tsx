"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/apiClient";
import Link from "next/link";

import { useAuthStore } from "@/store/authStore";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your email...");
    const { setAuth } = useAuthStore();

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No verification token provided in URL.");
            return;
        }

        api.post("/auth/verify-email", { token })
            .then((res) => {
                if (res.success && res.data) {
                    setAuth(res.data.user, res.data.token, res.data.refreshToken);
                    setStatus("success");
                    setMessage("Your email has been successfully verified! You are now logged in.");
                } else if (res.success) {
                    setStatus("success");
                    setMessage("Your email has been successfully verified!");
                } else {
                    setStatus("error");
                    setMessage(res.error || "Verification failed. The link might be expired or invalid.");
                }
            })
            .catch((err) => {
                setStatus("error");
                setMessage(err.message || "An error occurred during verification.");
            });
    }, [token, setAuth]);

    return (
        <div className="glass-card max-w-md w-full p-8 text-center animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-[-20%] w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_top_right,var(--primary-glow),transparent_60%)] pointer-events-none" />

            {status === "loading" && (
                <div className="flex flex-col items-center">
                    <Loader2 size={64} className="text-[var(--primary)] animate-spin mb-4" />
                    <h2 className="heading-md mb-2">Verifying Email</h2>
                    <p className="text-[var(--text-muted)]">{message}</p>
                </div>
            )}

            {status === "success" && (
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center mb-6">
                        <CheckCircle size={32} className="text-[#10b981]" />
                    </div>
                    <h2 className="heading-md mb-2">Verified!</h2>
                    <p className="text-[var(--text-muted)] mb-8">{message}</p>
                    <Link href="/" className="btn-primary w-full justify-center">
                        Return to Home
                    </Link>
                </div>
            )}

            {status === "error" && (
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[rgba(239,68,68,0.15)] flex items-center justify-center mb-6">
                        <XCircle size={32} className="text-[#ef4444]" />
                    </div>
                    <h2 className="heading-md mb-2">Verification Failed</h2>
                    <p className="text-[var(--text-muted)] mb-8">{message}</p>
                    <div className="flex flex-col gap-3 w-full">
                        <Link href="/auth/login" className="btn-primary w-full justify-center">
                            Return to Login
                        </Link>
                        <Link href="/" className="btn-ghost w-full justify-center">
                            Go to Home
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen py-[120px] flex items-center justify-center">
            <Suspense fallback={<div className="glass-card max-w-md w-full p-8 text-center"><Loader2 className="animate-spin mx-auto text-[var(--primary)]" /></div>}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
