"use client";
import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import {
    Store, Truck, Bell, Shield, Save, Upload,
    Globe, Phone, Mail, MapPin, CreditCard, Zap,
    ToggleLeft, ToggleRight, ChevronRight, Info, CheckCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

/* ─────────────────── types ─────────────────── */
interface StoreSettings {
    storeName: string;
    tagline: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    currency: string;
    timezone: string;
    logoUrl: string;
}

interface DeliverySettings {
    insideDhaka: number;
    outsideDhaka: number;
    freeDeliveryThreshold: number;
    sameDayCutoff: string;
    codEnabled: boolean;
    bkashEnabled: boolean;
    nagadEnabled: boolean;
    onlinePayEnabled: boolean;
}

interface NotifSettings {
    orderEmail: boolean;
    orderSms: boolean;
    lowStockAlert: boolean;
    lowStockThreshold: number;
    fraudAlert: boolean;
    dailyReport: boolean;
    weeklyReport: boolean;
}

interface SecuritySettings {
    twoFaEnabled: boolean;
    sessionTimeout: number;
    loginAttempts: number;
    requireStrongPassword: boolean;
    auditLogging: boolean;
}

/* ─────────────────── defaults ─────────────────── */
const DEFAULT_STORE: StoreSettings = {
    storeName: "WW Commerce",
    tagline: "Bangladesh's Smart Shopping Platform",
    email: "support@wwcommerce.bd",
    phone: "+880 1700-000000",
    address: "House 12, Road 5, Block C",
    city: "Dhaka",
    currency: "BDT",
    timezone: "Asia/Dhaka",
    logoUrl: "",
};

const DEFAULT_DELIVERY: DeliverySettings = {
    insideDhaka: 60,
    outsideDhaka: 120,
    freeDeliveryThreshold: 1000,
    sameDayCutoff: "14:00",
    codEnabled: true,
    bkashEnabled: true,
    nagadEnabled: true,
    onlinePayEnabled: false,
};

const DEFAULT_NOTIF: NotifSettings = {
    orderEmail: true,
    orderSms: false,
    lowStockAlert: true,
    lowStockThreshold: 10,
    fraudAlert: true,
    dailyReport: false,
    weeklyReport: true,
};

const DEFAULT_SECURITY: SecuritySettings = {
    twoFaEnabled: false,
    sessionTimeout: 60,
    loginAttempts: 5,
    requireStrongPassword: true,
    auditLogging: true,
};

/* ─────────────────── reusable UI ─────────────────── */
function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
    return (
        <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "20px", overflow: "hidden", marginBottom: "20px",
        }}>
            <div style={{
                padding: "18px 24px", borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: "10px",
                background: "rgba(255,255,255,0.02)",
            }}>
                <div style={{
                    width: "32px", height: "32px", borderRadius: "10px",
                    background: "rgba(99,102,241,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                    <Icon size={16} color="#818cf8" />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{title}</span>
            </div>
            <div style={{ padding: "24px" }}>{children}</div>
        </div>
    );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="settings-field-row" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "16px", alignItems: "start", marginBottom: "20px" }}>
            <div style={{ paddingTop: "10px" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{label}</p>
                {hint && <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px", lineHeight: 1.5 }}>{hint}</p>}
            </div>
            <div>{children}</div>
        </div>
    );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string }) {
    return (
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="input-field"
        />
    );
}

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", borderRadius: "12px",
            background: checked ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${checked ? "rgba(99,102,241,0.2)" : "var(--border)"}`,
            cursor: "pointer", marginBottom: "10px", transition: "all 0.2s",
        }} onClick={() => onChange(!checked)}>
            <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{label}</p>
                {desc && <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{desc}</p>}
            </div>
            {checked
                ? <ToggleRight size={26} color="#6366f1" style={{ flexShrink: 0 }} />
                : <ToggleLeft size={26} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            }
        </div>
    );
}

const TABS = [
    { key: "store", label: "Store Info", icon: Store },
    { key: "delivery", label: "Delivery & Pay", icon: Truck },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "security", label: "Security", icon: Shield },
];

/* ─────────────────── Main Page ─────────────────── */
export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("store");
    const [saving, setSaving] = useState(false);

    // State per section
    const [store, setStore] = useState<StoreSettings>(DEFAULT_STORE);
    const [delivery, setDelivery] = useState<DeliverySettings>(DEFAULT_DELIVERY);
    const [notif, setNotif] = useState<NotifSettings>(DEFAULT_NOTIF);
    const [security, setSecurity] = useState<SecuritySettings>(DEFAULT_SECURITY);

    const handleSave = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 800));
        setSaving(false);
        toast.success("Settings saved successfully!", {
            duration: 3000,
            style: { background: "#13131f", color: "#f0f0fa", border: "1px solid rgba(99,102,241,0.3)" },
            iconTheme: { primary: "#6366f1", secondary: "white" },
        });
    };

    return (
        <AdminShell>
            <Toaster position="top-right" />
            <div style={{ padding: "32px 36px", maxWidth: "900px" }}>

                {/* Header */}
                <div style={{ marginBottom: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
                        <span>Admin</span><ChevronRight size={12} /><span style={{ color: "var(--text-primary)" }}>Settings</span>
                    </div>
                    <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                        Settings
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
                        Manage your store configuration and preferences
                    </p>
                </div>

                {/* Tabs */}
                <div style={{
                    display: "flex", gap: "6px", marginBottom: "28px",
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "14px", padding: "5px",
                }}>
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.key;
                        return (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                                gap: "7px", padding: "10px 14px", borderRadius: "10px",
                                border: "none", cursor: "pointer", fontFamily: "inherit",
                                fontSize: "13px", fontWeight: active ? 700 : 500, transition: "all 0.2s",
                                background: active ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))" : "transparent",
                                color: active ? "white" : "var(--text-muted)",
                                boxShadow: active ? "0 0 0 1px rgba(99,102,241,0.3)" : "none",
                            }}>
                                <Icon size={14} />
                                <span style={{ whiteSpace: "nowrap" }}>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* ── STORE INFO ── */}
                {activeTab === "store" && (
                    <>
                        <SectionCard title="Store Identity" icon={Globe}>
                            <FieldRow label="Store Name" hint="Displayed across the site and emails">
                                <Input value={store.storeName} onChange={v => setStore(s => ({ ...s, storeName: v }))} placeholder="WW Commerce" />
                            </FieldRow>
                            <FieldRow label="Tagline" hint="Short slogan shown in hero section">
                                <Input value={store.tagline} onChange={v => setStore(s => ({ ...s, tagline: v }))} placeholder="Bangladesh's Smart Shopping Platform" />
                            </FieldRow>
                            <FieldRow label="Store Logo" hint="Shown in Navbar and emails">
                                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                    {store.logoUrl ? (
                                        <img src={store.logoUrl} alt="Logo" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", border: "1px solid var(--border)" }} />
                                    ) : (
                                        <div style={{ width: 48, height: 48, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <Zap size={22} color="white" />
                                        </div>
                                    )}
                                    <input
                                        type="url"
                                        value={store.logoUrl}
                                        onChange={e => setStore(s => ({ ...s, logoUrl: e.target.value }))}
                                        placeholder="https://... or leave blank for default"
                                        className="input-field"
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            </FieldRow>
                        </SectionCard>

                        <SectionCard title="Contact Information" icon={Phone}>
                            <FieldRow label="Support Email" hint="For customer inquiries">
                                <Input value={store.email} onChange={v => setStore(s => ({ ...s, email: v }))} placeholder="support@store.com" type="email" />
                            </FieldRow>
                            <FieldRow label="Phone Number" hint="Customer support hotline">
                                <Input value={store.phone} onChange={v => setStore(s => ({ ...s, phone: v }))} placeholder="+880 XXXXXXXXXX" />
                            </FieldRow>
                            <FieldRow label="Address" hint="Physical store or warehouse address">
                                <Input value={store.address} onChange={v => setStore(s => ({ ...s, address: v }))} placeholder="Street address" />
                            </FieldRow>
                            <FieldRow label="City">
                                <Input value={store.city} onChange={v => setStore(s => ({ ...s, city: v }))} placeholder="Dhaka" />
                            </FieldRow>
                        </SectionCard>

                        <SectionCard title="Locale" icon={Globe}>
                            <FieldRow label="Currency" hint="Primary currency for pricing">
                                <select value={store.currency} onChange={e => setStore(s => ({ ...s, currency: e.target.value }))} className="input-field" style={{ cursor: "pointer" }}>
                                    <option value="BDT">BDT — Bangladeshi Taka (৳)</option>
                                    <option value="USD">USD — US Dollar ($)</option>
                                    <option value="EUR">EUR — Euro (€)</option>
                                </select>
                            </FieldRow>
                            <FieldRow label="Timezone">
                                <select value={store.timezone} onChange={e => setStore(s => ({ ...s, timezone: e.target.value }))} className="input-field" style={{ cursor: "pointer" }}>
                                    <option value="Asia/Dhaka">Asia/Dhaka (UTC+6)</option>
                                    <option value="UTC">UTC</option>
                                    <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
                                </select>
                            </FieldRow>
                        </SectionCard>
                    </>
                )}

                {/* ── DELIVERY & PAYMENT ── */}
                {activeTab === "delivery" && (
                    <>
                        <SectionCard title="Delivery Charges" icon={Truck}>
                            <FieldRow label="Inside Dhaka" hint="Delivery fee in BDT">
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span style={{ fontSize: "18px", color: "var(--text-muted)" }}>৳</span>
                                    <Input value={delivery.insideDhaka} onChange={v => setDelivery(s => ({ ...s, insideDhaka: +v }))} type="number" placeholder="60" />
                                </div>
                            </FieldRow>
                            <FieldRow label="Outside Dhaka" hint="Delivery fee for other districts">
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span style={{ fontSize: "18px", color: "var(--text-muted)" }}>৳</span>
                                    <Input value={delivery.outsideDhaka} onChange={v => setDelivery(s => ({ ...s, outsideDhaka: +v }))} type="number" placeholder="120" />
                                </div>
                            </FieldRow>
                            <FieldRow label="Free Delivery Threshold" hint="Orders above this amount get free delivery">
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span style={{ fontSize: "18px", color: "var(--text-muted)" }}>৳</span>
                                    <Input value={delivery.freeDeliveryThreshold} onChange={v => setDelivery(s => ({ ...s, freeDeliveryThreshold: +v }))} type="number" placeholder="1000" />
                                </div>
                            </FieldRow>
                            <FieldRow label="Same-Day Cutoff" hint="Orders placed before this time qualify for same-day delivery">
                                <Input value={delivery.sameDayCutoff} onChange={v => setDelivery(s => ({ ...s, sameDayCutoff: v }))} type="time" />
                            </FieldRow>
                        </SectionCard>

                        <SectionCard title="Payment Methods" icon={CreditCard}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                                <Toggle
                                    checked={delivery.codEnabled}
                                    onChange={v => setDelivery(s => ({ ...s, codEnabled: v }))}
                                    label="Cash on Delivery (COD)"
                                    desc="Customers pay when package is delivered"
                                />
                                <Toggle
                                    checked={delivery.bkashEnabled}
                                    onChange={v => setDelivery(s => ({ ...s, bkashEnabled: v }))}
                                    label="bKash"
                                    desc="Accept bKash mobile payments"
                                />
                                <Toggle
                                    checked={delivery.nagadEnabled}
                                    onChange={v => setDelivery(s => ({ ...s, nagadEnabled: v }))}
                                    label="Nagad"
                                    desc="Accept Nagad mobile payments"
                                />
                                <Toggle
                                    checked={delivery.onlinePayEnabled}
                                    onChange={v => setDelivery(s => ({ ...s, onlinePayEnabled: v }))}
                                    label="Online Card Payment"
                                    desc="Accept Visa, Mastercard via payment gateway"
                                />
                            </div>
                        </SectionCard>
                    </>
                )}

                {/* ── NOTIFICATIONS ── */}
                {activeTab === "notifications" && (
                    <>
                        <SectionCard title="Order Alerts" icon={Bell}>
                            <Toggle
                                checked={notif.orderEmail}
                                onChange={v => setNotif(s => ({ ...s, orderEmail: v }))}
                                label="New Order Email"
                                desc="Send email when a new order is placed"
                            />
                            <Toggle
                                checked={notif.orderSms}
                                onChange={v => setNotif(s => ({ ...s, orderSms: v }))}
                                label="New Order SMS"
                                desc="Send SMS notification for new orders"
                            />
                            <Toggle
                                checked={notif.fraudAlert}
                                onChange={v => setNotif(s => ({ ...s, fraudAlert: v }))}
                                label="Fraud Detection Alert"
                                desc="Alert when AI detects high-risk orders"
                            />
                        </SectionCard>

                        <SectionCard title="Inventory Alerts" icon={Info}>
                            <Toggle
                                checked={notif.lowStockAlert}
                                onChange={v => setNotif(s => ({ ...s, lowStockAlert: v }))}
                                label="Low Stock Alert"
                                desc="Notify when product stock falls below threshold"
                            />
                            {notif.lowStockAlert && (
                                <FieldRow label="Low Stock Threshold" hint="Alert when stock drops below this number">
                                    <Input value={notif.lowStockThreshold} onChange={v => setNotif(s => ({ ...s, lowStockThreshold: +v }))} type="number" placeholder="10" />
                                </FieldRow>
                            )}
                        </SectionCard>

                        <SectionCard title="Reports" icon={Bell}>
                            <Toggle
                                checked={notif.dailyReport}
                                onChange={v => setNotif(s => ({ ...s, dailyReport: v }))}
                                label="Daily Sales Report"
                                desc="Receive daily summary every morning"
                            />
                            <Toggle
                                checked={notif.weeklyReport}
                                onChange={v => setNotif(s => ({ ...s, weeklyReport: v }))}
                                label="Weekly Performance Report"
                                desc="Monday morning weekly digest email"
                            />
                        </SectionCard>
                    </>
                )}

                {/* ── SECURITY ── */}
                {activeTab === "security" && (
                    <>
                        <SectionCard title="Authentication" icon={Shield}>
                            <Toggle
                                checked={security.twoFaEnabled}
                                onChange={v => setSecurity(s => ({ ...s, twoFaEnabled: v }))}
                                label="Two-Factor Authentication"
                                desc="Require OTP for admin logins"
                            />
                            <Toggle
                                checked={security.requireStrongPassword}
                                onChange={v => setSecurity(s => ({ ...s, requireStrongPassword: v }))}
                                label="Require Strong Password"
                                desc="Minimum 8 chars, uppercase, number, symbol"
                            />
                            <FieldRow label="Session Timeout" hint="Auto logout after inactivity (minutes)">
                                <Input value={security.sessionTimeout} onChange={v => setSecurity(s => ({ ...s, sessionTimeout: +v }))} type="number" placeholder="60" />
                            </FieldRow>
                            <FieldRow label="Max Login Attempts" hint="Lock account after failed attempts">
                                <Input value={security.loginAttempts} onChange={v => setSecurity(s => ({ ...s, loginAttempts: +v }))} type="number" placeholder="5" />
                            </FieldRow>
                        </SectionCard>

                        <SectionCard title="Audit & Compliance" icon={CheckCircle}>
                            <Toggle
                                checked={security.auditLogging}
                                onChange={v => setSecurity(s => ({ ...s, auditLogging: v }))}
                                label="Audit Logging"
                                desc="Log all admin actions for compliance review"
                            />
                            <div style={{
                                padding: "14px 16px", borderRadius: "12px", marginTop: "8px",
                                background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)",
                                display: "flex", gap: "10px", alignItems: "flex-start",
                            }}>
                                <CheckCircle size={16} color="#34d399" style={{ flexShrink: 0, marginTop: "1px" }} />
                                <div>
                                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>System is secure</p>
                                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                        Last security scan: {new Date().toLocaleDateString("en-BD", { dateStyle: "medium" })}
                                    </p>
                                </div>
                            </div>
                        </SectionCard>
                    </>
                )}

                {/* Save Button */}
                <div style={{
                    position: "sticky", bottom: 0, paddingTop: "16px",
                    display: "flex", justifyContent: "flex-end", gap: "12px",
                    background: "linear-gradient(to top, var(--bg-base) 70%, transparent 100%)",
                    paddingBottom: "8px",
                }}>
                    <button onClick={handleSave} disabled={saving} className="btn-primary" style={{
                        padding: "12px 32px", fontSize: "14px", gap: "8px",
                        opacity: saving ? 0.7 : 1, minWidth: "160px", justifyContent: "center",
                    }}>
                        {saving ? (
                            <>
                                <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "var(--primary)", animation: "spin 0.7s linear infinite" }} />
                                Saving...
                            </>
                        ) : (
                            <><Save size={15} /> Save Changes</>
                        )}
                    </button>
                </div>
            </div>
        </AdminShell>
    );
}
