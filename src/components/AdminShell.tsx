"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Package, ShoppingBag, Truck, Users,
    Zap, LogOut, Settings, Flag, BookOpen, Brain, ChevronRight,
    Menu, Bell, TrendingUp, Shield, FolderTree
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/apiClient";
import { MessageSquare } from "lucide-react";

const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Products", icon: Package, href: "/admin/products" },
    { label: "Categories", icon: FolderTree, href: "/admin/categories" },
    { label: "Orders", icon: ShoppingBag, href: "/admin/orders" },
    { label: "Live Support", icon: MessageSquare, href: "/admin/support" },
    { label: "Delivery Zones", icon: Truck, href: "/admin/delivery" },
    { label: "AI Intelligence", icon: Brain, href: "/admin/ai" },
    { label: "Feature Flags", icon: Flag, href: "/admin/flags" },
    { label: "Audit Logs", icon: BookOpen, href: "/admin/audit" },
    { label: "Users", icon: Users, href: "/admin/users" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, clearAuth, isAdmin } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    // Hydration-safe: Zustand persist restores state after mount
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (user && isAdmin()) {
            // Load pending AI suggestions count
            api.admin.aiSuggestions.list({ status: "pending" })
                .then((res) => setPendingCount(res.data?.length || 0))
                .catch(() => { });
        }
    }, [mounted, user]);

    // Before hydration, show a loading state (not a redirect)
    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
                <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Zap size={24} className="text-white" />
                    </div>
                    <p className="text-[var(--text-muted)]">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    // After hydration, check auth
    if (!user || !isAdmin()) {
        // Push redirect in a timeout to avoid render-phase navigation
        setTimeout(() => router.replace("/auth/login?redirect=/admin"), 100);
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
                <div className="text-center">
                    <Shield size={48} className="mx-auto mb-4 text-[var(--danger)]" />
                    <p className="text-[var(--text-primary)] font-semibold mb-1">Access Denied</p>
                    <p className="text-[var(--text-muted)] text-sm">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        clearAuth();
        router.push("/");
    };

    return (
        <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""} z-50 flex flex-col`}>
                {/* Logo */}
                <div className="p-5 border-b border-[var(--border)]">
                    <Link href="/admin" className="flex items-center gap-2">
                        <img
                            src="/logo_transparent.png"
                            alt="Moon IT Shop"
                            className="w-10 h-10 object-contain mr-1"
                        />
                        <div>
                            <p className="font-bold text-[var(--text-primary)] text-sm">Moon IT Shop</p>
                            <p className="text-xs text-[var(--text-muted)]">Admin Panel</p>
                        </div>
                    </Link>
                </div>

                {/* User */}
                <div className="p-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--text-primary)] font-bold text-sm flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
                            <span className="badge badge-primary text-[10px]">{user.role}</span>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 overflow-y-auto">
                    <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider px-3 mb-2">Main Menu</p>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all group ${isActive
                                    ? "bg-[var(--primary-glow)] text-[var(--primary)] border border-[var(--border-accent)]"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                                    }`}
                            >
                                <item.icon size={17} className={isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--primary)]"} />
                                <span className="flex-1">{item.label}</span>
                                {item.href === "/admin/ai" && pendingCount > 0 && (
                                    <span className="w-5 h-5 bg-[var(--warn)] text-[var(--text-primary)] text-xs font-bold rounded-full flex items-center justify-center">
                                        {pendingCount}
                                    </span>
                                )}
                                {isActive && <ChevronRight size={14} className="text-[var(--primary)]" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="p-3 border-t border-[var(--border)]">
                    <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] mb-1">
                        <TrendingUp size={17} className="text-[var(--text-muted)]" />
                        View Store
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--danger)] hover:bg-[rgba(179,74,64,0.1)] transition-all"
                    >
                        <LogOut size={17} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="admin-content">
                {/* Top bar */}
                <div className="sticky top-0 z-30 bg-[var(--bg-surface)] border-b border-[var(--border)] px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="hidden sm:block">
                            <p className="text-sm font-semibold text-[var(--text-primary)] capitalize">
                                {NAV_ITEMS.find((n) => n.href === pathname || (n.href !== "/admin" && pathname.startsWith(n.href)))?.label || "Admin"}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">Moon IT Shop Control Center</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {pendingCount > 0 && (
                            <Link href="/admin/ai" className="relative p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--warn)] transition-all">
                                <Bell size={18} />
                                <span className="absolute top-0 right-0 w-4 h-4 bg-[var(--warn)] text-[var(--text-primary)] text-[10px] font-bold rounded-full flex items-center justify-center">{pendingCount}</span>
                            </Link>
                        )}
                        <Link href="/" className="btn-secondary text-xs py-1.5 px-3 hidden sm:flex">
                            ← Store
                        </Link>
                    </div>
                </div>

                {/* Page content */}
                <div className="p-6 md:p-8">{children}</div>
            </div>
        </div>
    );
}
