"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Patterns", match: (path: string) => !path.startsWith("/gallery") },
  {
    href: "/gallery",
    label: "Design system",
    match: (path: string) => path.startsWith("/gallery"),
  },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="Site sections">
      {TABS.map((tab) => {
        const active = tab.match(pathname);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="site-nav__link"
            data-active={active ? "true" : undefined}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
