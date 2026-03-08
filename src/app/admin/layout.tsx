import type { Metadata } from "next";

export const metadata: Metadata = {
    title: { default: "Admin Panel", template: "%s | Moon IT Shop Admin" },
    description: "Moon IT Shop Admin Control Center",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
