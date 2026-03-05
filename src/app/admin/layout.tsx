import type { Metadata } from "next";

export const metadata: Metadata = {
    title: { default: "Admin Panel", template: "%s | WW Commerce Admin" },
    description: "WW Commerce Admin Control Center",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
