"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/gallery", label: "Patterns" },
  { href: "/advisor", label: "Chat" },
  { href: "/setup", label: "Setup" },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string): boolean {
    if (href === "/gallery") {
      return pathname.startsWith("/gallery") || pathname.startsWith("/patterns/");
    }
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="osh-site-header sticky top-0 z-50">
      <div className="osh-container flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline gap-2" onClick={closeMenu}>
          <span className="text-lg font-semibold text-ink sm:text-xl">
            Human Agent IoC
          </span>
          <span className="hidden text-xl font-extralight text-muted sm:inline">
            patterns
          </span>
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
          <Link href="/advisor" className="osh-cta-solid hidden text-sm sm:inline-flex">
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
            <li className="pt-2">
              <Link
                href="/advisor"
                className="osh-cta-solid w-full text-sm"
                onClick={closeMenu}
              >
                Chat with Agent
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
