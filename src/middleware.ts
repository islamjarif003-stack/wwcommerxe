import { NextRequest, NextResponse } from "next/server";

// Edge middleware — runs before ANY page render or API call
// Admin routes protected by JWT check (Edge-compatible, no full crypto)

const ADMIN_PREFIXES = ["/admin"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isAdminRoute = ADMIN_PREFIXES.some(p => pathname.startsWith(p));

    if (isAdminRoute) {
        // Token can come from:
        // 1. ww-token cookie (set by login API for SSR/middleware access)
        // 2. Authorization header (for API routes)
        const cookieToken = request.cookies.get("ww-token")?.value;
        const headerToken = request.headers.get("authorization")?.replace("Bearer ", "");
        const token = cookieToken || headerToken;

        // If no token → redirect to login (but NOT for the login page itself)
        if (!token) {
            // Allow access if user might have token in localStorage
            // We can't read localStorage in middleware (Edge), so we let the
            // client-side AdminShell guard handle it. Only redirect on hard page loads.
            // Strategy: pass through, let AdminShell redirect if needed.
            return NextResponse.next();
        }

        // Validate token structure
        const parts = token.split(".");
        if (parts.length === 3) {
            try {
                const payload = JSON.parse(
                    Buffer.from(parts[1], "base64url").toString()
                );
                const isExpired = payload.exp && Date.now() / 1000 > payload.exp;
                const role = (payload.role || "").toUpperCase();
                const isAdmin = ["ADMIN", "SUPERADMIN", "MANAGER"].includes(role);

                if (isExpired || !isAdmin) {
                    const url = new URL("/auth/login", request.url);
                    url.searchParams.set("redirect", pathname);
                    const res = NextResponse.redirect(url);
                    res.cookies.delete("ww-token");
                    return res;
                }
            } catch {
                // Bad token — pass through, client-side will handle
            }
        }
    }

    // Strip X-Powered-By on all responses
    const response = NextResponse.next();
    response.headers.delete("X-Powered-By");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
}

export const config = {
    matcher: [
        // Apply to admin routes
        "/admin/:path*",
        // Exclude static files, api routes (they have their own auth), and Next internals
        "/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\..*).*)",
    ],
};
