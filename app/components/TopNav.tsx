"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; match?: "exact" | "prefix" };

export default function TopNav() {
  const pathname = usePathname() || "/";

  const items: NavItem[] = [
    { href: "/", label: "Home", match: "exact" },
    { href: "/dashboard", label: "Dashboard", match: "prefix" },
    { href: "/quiz", label: "Practice", match: "prefix" },
  ];

  const base =
    "px-3 py-1.5 text-sm rounded-md border border-white/15 bg-white/10 text-white " +
    "hover:bg-white/20 hover:border-white/25 transition";

  const active =
    "px-3 py-1.5 text-sm rounded-md border border-blue-300/40 bg-blue-500/25 text-white " +
    "hover:bg-blue-500/30 transition";

  function isActive(item: NavItem) {
    if (item.match === "exact") return pathname === item.href;
    // prefix match (e.g. /dashboard, /dashboard/settings)
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  return (
    <nav className="flex items-center gap-2 shrink-0">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={isActive(item) ? active : base}
          aria-current={isActive(item) ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
