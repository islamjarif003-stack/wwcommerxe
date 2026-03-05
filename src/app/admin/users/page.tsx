"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { api } from "@/lib/apiClient";
import {
    Users, Search, Shield, ShoppingBag, Star,
    ChevronRight, Crown, User, TrendingUp, Ban,
    MoreVertical, Mail, Phone, Calendar,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { usePrice } from "@/hooks/usePrice";

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
    superadmin: { label: "Super Admin", color: "#f43f5e", bg: "rgba(244,63,94,0.12)" },
    admin: { label: "Admin", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    manager: { label: "Manager", color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
    customer: { label: "Customer", color: "#10b981", bg: "rgba(16,185,129,0.10)" },
    user: { label: "Customer", color: "#10b981", bg: "rgba(16,185,129,0.10)" },
};

const ROLE_ICON: Record<string, any> = {
    superadmin: Crown, admin: Shield, manager: Star, customer: User, user: User,
};

export default function AdminUsersPage() {
    const { formatPrice } = usePrice();
    const [users, setUsers] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    useEffect(() => {
        api.admin.users.list()
            .then(d => {
                const data = d.data || [];
                setUsers(data);
                setFiltered(data);
            })
            .catch(() => {
                setUsers([]);
                setFiltered([]);
            })
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        let result = users;
        if (roleFilter) {
            if (roleFilter === "admin") {
                result = result.filter(u => ["admin", "superadmin", "manager"].includes(u.role?.toLowerCase()));
            } else if (roleFilter === "customer") {
                result = result.filter(u => ["user", "customer"].includes(u.role?.toLowerCase()));
            } else {
                result = result.filter(u => u.role?.toLowerCase() === roleFilter);
            }
        }
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(u =>
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.phone?.toLowerCase().includes(q)
            );
        }
        setFiltered(result);
    }, [search, roleFilter, users]);

    const stats = {
        total: users.length,
        admins: users.filter(u => ["admin", "superadmin", "manager"].includes(u.role?.toLowerCase())).length,
        customers: users.filter(u => ["user", "customer"].includes(u.role?.toLowerCase())).length,
        totalRevenue: users.reduce((s, u) => s + (u.totalSpent || 0), 0),
    };

    return (
        <AdminShell>
            <Toaster position="top-right" />
            <div style={{ padding: "32px 36px" }}>

                {/* Header */}
                <div style={{ marginBottom: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
                        <span>Admin</span><ChevronRight size={12} /><span style={{ color: "var(--text-primary)" }}>Users</span>
                    </div>
                    <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                        Users
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
                        Manage customer accounts and admin access
                    </p>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "28px" }}>
                    {[
                        { label: "Total Users", value: stats.total, icon: Users, color: "#6366f1" },
                        { label: "Admins", value: stats.admins, icon: Shield, color: "#f43f5e" },
                        { label: "Customers", value: stats.customers, icon: User, color: "#10b981" },
                        { label: "Total Revenue", value: formatPrice(stats.totalRevenue.toLocaleString()), icon: TrendingUp, color: "#f59e0b" },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} style={{
                                background: "var(--bg-card)", border: "1px solid var(--border)",
                                borderRadius: "16px", padding: "18px 20px",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                                    <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Icon size={16} color={s.color} />
                                    </div>
                                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{s.label}</span>
                                </div>
                                <p style={{ fontSize: "22px", fontWeight: 900, color: "var(--text-primary)" }}>{s.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                    {/* Search */}
                    <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
                        <Search size={15} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search name, email, phone..."
                            className="input-field"
                            style={{ paddingLeft: "40px", fontSize: "13px" }}
                        />
                    </div>

                    {/* Role filter */}
                    <div style={{
                        display: "flex", gap: "4px",
                        background: "var(--bg-card)", border: "1px solid var(--border)",
                        borderRadius: "12px", padding: "4px",
                    }}>
                        {[
                            { label: "All", value: "" },
                            { label: "Admins", value: "admin" },
                            { label: "Customers", value: "customer" },
                        ].map(f => (
                            <button key={f.value} onClick={() => setRoleFilter(f.value)} style={{
                                padding: "7px 14px", borderRadius: "9px", border: "none",
                                cursor: "pointer", fontFamily: "inherit", fontSize: "12px", fontWeight: 600,
                                background: roleFilter === f.value ? "rgba(99,102,241,0.18)" : "transparent",
                                color: roleFilter === f.value ? "#a5b4fc" : "var(--text-muted)",
                                transition: "all 0.15s",
                            }}>{f.label}</button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "20px", overflow: "hidden",
                }}>
                    {isLoading ? (
                        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} style={{ height: "60px", borderRadius: "12px" }} className="skeleton" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 24px" }}>
                            <Users size={48} style={{ margin: "0 auto 16px", color: "var(--text-muted)", opacity: 0.3 }} />
                            <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "16px", marginBottom: "6px" }}>
                                {users.length === 0 ? "No users yet" : "No results found"}
                            </p>
                            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                                {users.length === 0
                                    ? "Users will appear here after they register."
                                    : "Try adjusting your search or filters."}
                            </p>
                        </div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                    {["User", "Contact", "Role", "Orders", "Spent", "Joined", ""].map(h => (
                                        <th key={h} style={{
                                            padding: "12px 16px", textAlign: "left",
                                            fontSize: "11px", fontWeight: 700, color: "var(--text-muted)",
                                            textTransform: "uppercase", letterSpacing: "0.6px",
                                            whiteSpace: "nowrap",
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((user: any, idx: number) => {
                                    const roleLowerCase = user.role?.toLowerCase() || "customer";
                                    const roleInfo = ROLE_BADGE[roleLowerCase] || ROLE_BADGE.customer;
                                    const RoleIcon = ROLE_ICON[roleLowerCase] || User;
                                    return (
                                        <tr key={user.id} style={{
                                            borderBottom: idx < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none",
                                            transition: "background 0.15s",
                                        }}
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.03)"}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                                        >
                                            {/* User */}
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <div style={{
                                                        width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                                                        background: `linear-gradient(135deg, ${roleInfo.color}30, ${roleInfo.color}15)`,
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontSize: "13px", fontWeight: 800, color: roleInfo.color,
                                                    }}>
                                                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{user.name}</p>
                                                        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
                                                            {user.loyaltyPoints || 0} pts
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact */}
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                        <Mail size={11} color="var(--text-muted)" />
                                                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{user.email}</span>
                                                    </div>
                                                    {user.phone && (
                                                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                            <Phone size={11} color="var(--text-muted)" />
                                                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td style={{ padding: "14px 16px" }}>
                                                <span style={{
                                                    display: "inline-flex", alignItems: "center", gap: "5px",
                                                    padding: "4px 10px", borderRadius: "100px",
                                                    background: roleInfo.bg, color: roleInfo.color,
                                                    fontSize: "11px", fontWeight: 700,
                                                }}>
                                                    <RoleIcon size={11} />
                                                    {roleInfo.label}
                                                </span>
                                            </td>

                                            {/* Orders */}
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <ShoppingBag size={13} color="var(--text-muted)" />
                                                    <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>
                                                        {user.totalOrders || 0}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Spent */}
                                            <td style={{ padding: "14px 16px" }}>
                                                <span style={{ fontSize: "13px", fontWeight: 700, color: (user.totalSpent || 0) > 0 ? "#a5b4fc" : "var(--text-muted)" }}>
                                                    {formatPrice((user.totalSpent || 0).toLocaleString())}
                                                </span>
                                            </td>

                                            {/* Joined */}
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                    <Calendar size={11} color="var(--text-muted)" />
                                                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                                        {new Date(user.createdAt).toLocaleDateString("en-BD", { dateStyle: "medium" })}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ position: "relative" }}>
                                                    <button
                                                        onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                                                        style={{
                                                            background: "none", border: "1px solid var(--border)",
                                                            borderRadius: "8px", cursor: "pointer", padding: "6px 8px",
                                                            color: "var(--text-muted)", display: "flex", alignItems: "center",
                                                            transition: "all 0.15s",
                                                        }}>
                                                        <MoreVertical size={14} />
                                                    </button>
                                                    {openMenu === user.id && (
                                                        <div style={{
                                                            position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 50,
                                                            background: "var(--bg-elevated)", border: "1px solid var(--border)",
                                                            borderRadius: "12px", padding: "6px", minWidth: "160px",
                                                            boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                                                        }}>
                                                            {[
                                                                { label: "View Orders", icon: ShoppingBag, action: () => { setOpenMenu(null); toast(`Viewing orders for ${user.name}`); } },
                                                                { label: "Send Email", icon: Mail, action: () => { setOpenMenu(null); window.open(`mailto:${user.email}`, "_blank"); } },
                                                                { label: "Suspend", icon: Ban, action: () => { setOpenMenu(null); toast.error("Feature coming soon"); }, danger: true },
                                                            ].map(item => {
                                                                const ItemIcon = item.icon;
                                                                return (
                                                                    <button key={item.label} onClick={item.action} style={{
                                                                        width: "100%", display: "flex", alignItems: "center", gap: "8px",
                                                                        padding: "9px 12px", borderRadius: "8px", border: "none",
                                                                        background: "transparent", cursor: "pointer", fontFamily: "inherit",
                                                                        fontSize: "13px", fontWeight: 500,
                                                                        color: (item as any).danger ? "#f87171" : "var(--text-secondary)",
                                                                        transition: "all 0.15s",
                                                                    }}
                                                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = (item as any).danger ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)"}
                                                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                                                                    >
                                                                        <ItemIcon size={13} />
                                                                        {item.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}

                    {/* Footer count */}
                    {filtered.length > 0 && (
                        <div style={{
                            padding: "12px 20px", borderTop: "1px solid var(--border-subtle)",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                Showing {filtered.length} of {users.length} users
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </AdminShell>
    );
}
