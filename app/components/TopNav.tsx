"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PremiumButton } from "./PremiumButton";

type NavItem = { href: string; label: string; match?: "exact" | "prefix" };

export default function TopNav() {
  const pathname = usePathname() || "/";
  const isTipsRoute = pathname === "/tips" || pathname.startsWith("/tips/");

  const items: NavItem[] = [
    { href: "/", label: "Home", match: "exact" },
    { href: "/dashboard", label: "Dashboard", match: "prefix" },
    { href: "/quiz", label: "Practice", match: "prefix" },
    { href: "/tips", label: "Tips", match: "prefix" },
  ];

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
          className="no-underline hover:no-underline focus:no-underline"
          aria-current={isActive(item) ? "page" : undefined}
        >
          <PremiumButton
            type="button"
            size="sm"
            variant={!isTipsRoute && isActive(item) ? "indigo" : "neutral"}
            className={isTipsRoute ? (isActive(item) ? "tips-nav-btn tips-nav-btn-active" : "tips-nav-btn") : ""}
          >
            {item.label}
          </PremiumButton>
        </Link>
      ))}
    </nav>
  );
}
