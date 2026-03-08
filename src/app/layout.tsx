import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import { LiveSupportWrapper } from "@/components/LiveSupportWrapper";

export const metadata: Metadata = {
  title: { default: "Moon IT Shop | Bangladesh's Smart Shopping Platform", template: "%s | Moon IT Shop" },
  description: "Premium ecommerce experience with AI-driven personalization, fast Bangladesh delivery, and exclusive deals.",
  keywords: ["ecommerce", "bangladesh", "online shopping", "dhaka delivery", "Moon IT Shop"],
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: "https://wwcommerce.com",
    siteName: "Moon IT Shop",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                fontFamily: "Inter, sans-serif",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#0a0a0f" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#0a0a0f" } },
            }}
          />
          <LiveSupportWrapper />
        </Providers>
      </body>
    </html>
  );
}
