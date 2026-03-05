"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    loyaltyPoints: number;
    totalOrders: number;
    totalSpent: number;
}

interface AuthStore {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    setAuth: (user: User, token: string, refreshToken: string) => void;
    clearAuth: () => void;
    setLoading: (v: boolean) => void;
    isAdmin: () => boolean;
    isSuperAdmin: () => boolean;
    isManager: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            isLoading: false,

            setAuth: (user, token, refreshToken) => set({ user, token, refreshToken }),

            clearAuth: () => {
                // Clear the httpOnly cookie via API call (best-effort)
                fetch("/api/auth/logout", { method: "POST" }).catch(() => { });
                set({ user: null, token: null, refreshToken: null });
            },

            setLoading: (v) => set({ isLoading: v }),

            // Case-insensitive role checks
            isAdmin: () => {
                const role = (get().user?.role || "").toUpperCase();
                return ["ADMIN", "SUPERADMIN", "MANAGER"].includes(role);
            },

            isSuperAdmin: () => (get().user?.role || "").toUpperCase() === "SUPERADMIN",

            isManager: () => {
                const role = (get().user?.role || "").toUpperCase();
                return ["MANAGER", "ADMIN", "SUPERADMIN"].includes(role);
            },
        }),
        { name: "ww-auth" }
    )
);
