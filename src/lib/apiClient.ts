import { useAuthStore } from "@/store/authStore";

const BASE_URL = "/api";

async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = useAuthStore.getState().token;
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();

    if (!res.ok) throw new Error(`Request failed for ${endpoint}: ${data.message || "Unknown error"}`);
    return data;
}

export const api = {
    get: (url: string) => apiFetch(url),
    post: (url: string, body: unknown) => apiFetch(url, { method: "POST", body: JSON.stringify(body) }),
    put: (url: string, body: unknown) => apiFetch(url, { method: "PUT", body: JSON.stringify(body) }),
    delete: (url: string) => apiFetch(url, { method: "DELETE" }),

    // Auth
    auth: {
        login: (credentials: { email: string; password: string }) =>
            apiFetch("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
        register: (data: { name: string; email: string; password: string; phone?: string }) =>
            apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }),
        setupAdmin: (data: { name: string; email: string; password: string; setupKey: string }) =>
            apiFetch("/auth/setup-admin", { method: "POST", body: JSON.stringify(data) }),
    },

    // Products
    products: {
        list: (params?: Record<string, string>) => {
            const qs = params ? "?" + new URLSearchParams(params).toString() : "";
            return apiFetch(`/products${qs}`);
        },
        get: (slug: string) => apiFetch(`/products/${slug}`),
    },

    // Categories
    categories: {
        list: () => apiFetch("/categories"),
    },

    // Orders
    orders: {
        create: (data: unknown) => apiFetch("/orders", { method: "POST", body: JSON.stringify(data) }),
        myOrders: () => apiFetch("/orders"),
        track: (orderNumber: string, phone: string) =>
            apiFetch(`/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`),
    },

    // Delivery
    delivery: {
        calculate: (district: string, total: number) =>
            apiFetch(`/delivery/calculate?district=${district}&total=${total}`),
    },

    // Behavior
    behavior: {
        track: (event: { sessionId: string; type: string; data?: unknown; url?: string; userId?: string }) =>
            apiFetch("/behavior", { method: "POST", body: JSON.stringify(event) }),
    },

    // Admin
    admin: {
        dashboard: () => apiFetch("/admin/dashboard"),
        products: {
            list: (params?: Record<string, string>) => {
                const qs = params ? "?" + new URLSearchParams(params).toString() : "";
                return apiFetch(`/admin/products${qs}`);
            },
            create: (data: unknown) => apiFetch("/admin/products", { method: "POST", body: JSON.stringify(data) }),
            update: (id: string, data: unknown) => apiFetch(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
            delete: (id: string) => apiFetch(`/admin/products/${id}`, { method: "DELETE" }),
        },
        orders: {
            list: (params?: Record<string, string>) => {
                const qs = params ? "?" + new URLSearchParams(params).toString() : "";
                return apiFetch(`/admin/orders${qs}`);
            },
            update: (id: string, data: unknown) => apiFetch(`/admin/orders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
            get: (id: string) => apiFetch(`/admin/orders/${id}`),
        },
        deliveryZones: {
            list: () => apiFetch("/admin/delivery-zones"),
            create: (data: unknown) => apiFetch("/admin/delivery-zones", { method: "POST", body: JSON.stringify(data) }),
        },
        aiSuggestions: {
            list: (params?: Record<string, string>) => {
                const qs = params ? "?" + new URLSearchParams(params).toString() : "";
                return apiFetch(`/admin/ai-suggestions${qs}`);
            },
            run: () => apiFetch("/admin/ai-suggestions", { method: "POST", body: JSON.stringify({}) }),
            approve: (id: string, action: "approve" | "reject") =>
                apiFetch(`/admin/ai-suggestions/${id}`, { method: "PUT", body: JSON.stringify({ action }) }),
            refresh: (limit = 500) =>
                apiFetch("/admin/ai-suggestions/refresh", { method: "POST", body: JSON.stringify({ limit }) }),
        },

        featureFlags: {
            list: () => apiFetch("/admin/feature-flags"),
            create: (data: unknown) => apiFetch("/admin/feature-flags", { method: "POST", body: JSON.stringify(data) }),
            update: (id: string, data: unknown) => apiFetch(`/admin/feature-flags/${id}`, { method: "PUT", body: JSON.stringify(data) }),
            delete: (id: string) => apiFetch(`/admin/feature-flags/${id}`, { method: "DELETE" }),
        },
        auditLogs: {
            list: (params?: Record<string, string>) => {
                const qs = params ? "?" + new URLSearchParams(params).toString() : "";
                return apiFetch(`/admin/audit-logs${qs}`);
            },
        },
        users: {
            list: () => apiFetch("/admin/users"),
        },
    },
};
