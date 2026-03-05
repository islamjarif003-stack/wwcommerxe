"use client";
import { usePathname } from "next/navigation";
import LiveSupportChat from "./LiveSupportChat";

export function LiveSupportWrapper() {
    const pathname = usePathname();
    if (pathname?.startsWith("/admin")) return null;
    return <LiveSupportChat />;
}
