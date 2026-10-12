"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/gallery", label: "Patterns" },
  { href: "/advisor", label: "Chat" },
  { href: "/studio", label: "Studio" },
  { href: "/setup", label: "MCP server" },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string): boolean {
    if (href === "/gallery") {
      return pathname.startsWith("/gallery") || pathname.startsWith("/patterns/");
    }
    if (href === "/v1") return pathname === "/v1";
    return pathname.startsWith(href);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="osh-site-header sticky top-0 z-50">
      <div className="osh-container flex h-[4.5rem] items-center justify-between gap-4">
        {/* The wordmark goes to v1's own front page. `/` is the version
            picker now, and "Switch version" on the right is the way back. */}
        <Link href="/v1" className="flex items-baseline gap-2" onClick={closeMenu}>
          <span className="text-lg font-semibold text-ink sm:text-xl">
            HAX 2.0
          </span>
          <span className="hidden text-xl font-extralight text-muted sm:inline">
            patterns
          </span>
          <span className="v1-badge ml-1">v1</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="osh-nav-link"
              data-active={isActive(href)}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Shown from the same breakpoint as the nav, so there is never a
              width where v1 has a header but no way back to the picker. */}
          <Link href="/" className="osh-cta-outline hidden text-sm md:inline-flex">
            Switch version
          </Link>
          <Link
            href="/advisor"
            className="osh-cta-solid hidden text-sm sm:inline-flex md:hidden lg:inline-flex"
          >
            Chat with Agent
          </Link>

          <button
            type="button"
            className="relative flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-line md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span
              className={`block h-0.5 w-5 rounded bg-ink transition ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 rounded bg-ink transition ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 rounded bg-ink transition ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          className="border-t border-line bg-bg px-6 py-4 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-muted transition hover:bg-hover hover:text-ink"
                  data-active={isActive(href)}
                  onClick={closeMenu}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="flex flex-col gap-2 pt-2">
              <Link
                href="/advisor"
                className="osh-cta-solid w-full text-sm"
                onClick={closeMenu}
              >
                Chat with Agent
              </Link>
              <Link
                href="/"
                className="osh-cta-outline w-full text-sm"
                onClick={closeMenu}
              >
                Switch version
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
