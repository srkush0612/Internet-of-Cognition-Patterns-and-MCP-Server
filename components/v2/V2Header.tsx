"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { useState } from "react";

/**
 * Four tabs.
 *
 * No chat: this is a catalog and a spec editor, with no advisor behind it, so
 * a "Chat with Agent" tab would be a door onto nothing. Modes are not a tab
 * either, they are the spine of the catalog's grouping, and the full
 * reference hangs off the homepage rather than competing for a tab.
 */
const NAV = [
  { href: "/v2", label: "Home" },
  { href: "/v2/patterns", label: "Patterns" },
  { href: "/v2/studio", label: "Studio" },
  { href: "/v2/mcp-server", label: "MCP server" },
] as const;

export function V2Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const onHome = pathname === "/v2";
  const lenis = useLenis();

  /**
   * Lenis's own `anchors` option never sees this click, something upstream
   * handles the hash first and scrolls natively, which teleports. Driving
   * `scrollTo` by hand is the reliable version, and it falls back to the
   * browser's behaviour if Lenis is absent (reduced motion, or no JS).
   */
  function jumpToConnect(event: React.MouseEvent) {
    if (!lenis) return;
    event.preventDefault();
    // An explicit duration: left to the instance's lerp, scrollTo resolves
    // in a single frame and the jump is indistinguishable from a native one.
    lenis.scrollTo("#connect", {
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });
    history.replaceState(null, "", "#connect");
  }

  function isActive(href: string): boolean {
    if (href === "/v2") return pathname === "/v2";
    return pathname.startsWith(href);
  }

  return (
    <header className="v2-nav">
      <div className="osh-container">
        <Link href="/v2" className="v2-mark" onClick={() => setMenuOpen(false)}>
          <span>HAX</span>
          <span className="v2-mark__by">by Outshift Design</span>
        </Link>

        <nav className="v2-nav__links" aria-label="Main">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} data-active={isActive(href)}>
              {label}
            </Link>
          ))}
        </nav>

        <span className="v2-nav__spacer" />

        {/* Below the nav's breakpoint this moves into the menu, rather than
            wrapping to two lines beside the hamburger.

            A plain anchor when we are already on the homepage: Next's Link
            would intercept the hash and scroll natively, which teleports
            past Lenis. Left to the browser, Lenis picks it up and glides. */}
        {onHome ? (
          <a
            href="#connect"
            className="v2-btn v2-btn--primary v2-btn--small v2-nav__cta"
            onClick={jumpToConnect}
          >
            Connect MCP
          </a>
        ) : (
          <Link
            href="/v2#connect"
            className="v2-btn v2-btn--primary v2-btn--small v2-nav__cta"
          >
            Connect MCP
          </Link>
        )}

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
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              {onHome ? (
                <a
                  href="#connect"
                  className="v2-btn v2-btn--primary w-full"
                  onClick={(event) => {
                    setMenuOpen(false);
                    jumpToConnect(event);
                  }}
                >
                  Connect MCP
                </a>
              ) : (
                <Link
                  href="/v2#connect"
                  className="v2-btn v2-btn--primary w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  Connect MCP
                </Link>
              )}
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
