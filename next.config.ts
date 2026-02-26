import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Images ───────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.imgbb.com" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 3600, // 1 hour
  },

  // ── Security Headers ─────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/(.*)\\.(ico|png|jpg|jpeg|webp|avif|svg|woff|woff2|ttf|otf)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // API — no cache by default
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },

  // ── Redirects ────────────────────────────────────────────
  async redirects() {
    return [
      // www → non-www canonical redirect (uncomment on production)
      // { source: "/:path*", has: [{ type: "host", value: "www.yourdomain.com" }], destination: "https://yourdomain.com/:path*", permanent: true },
    ];
  },

  // ── Rewrites (optional CDN proxy) ────────────────────────
  // async rewrites() { return []; },

  // ── Compression ──────────────────────────────────────────
  compress: true,

  // ── Output ───────────────────────────────────────────────
  // output: "standalone", // Uncomment for Docker deployment

  // ── Experimental ─────────────────────────────────────────
  experimental: {
    serverActions: {
      allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : ["localhost:3000"],
    },
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "recharts", "@tanstack/react-query"],
  },

  // ── ESLint / TypeScript ───────────────────────────────────────────────────
  // @ts-ignore — valid in Next.js 16, types may lag
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },


  // ── Environment ──────────────────────────────────────────
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "WW Commerce",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  // ── Logging ──────────────────────────────────────────────
  logging: {
    fetches: { fullUrl: process.env.NODE_ENV === "development" },
  },
};

export default nextConfig;
