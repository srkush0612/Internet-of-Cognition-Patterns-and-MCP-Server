"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/v2/patterns", label: "Patterns" },
  { href: "/v2/studio", label: "Studio" },
  { href: "/v2/mcp-server", label: "MCP server" },
] as const;

export function V3Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="v3-hax-header">
      <div className="v3-container v3-hax-header__row">
        <Link href="/v3" className="v3-hax-mark" onClick={() => setOpen(false)} aria-label="HAX home">
          <strong>HAX</strong><span>by Outshift Design</span>
        </Link>

        <nav className="v3-hax-header__links" aria-label="Main navigation">
          {NAV.map(({ href, label }) => <Link href={href} key={href} aria-current={pathname.startsWith(href) ? "page" : undefined}>{label}</Link>)}
        </nav>

        <Link href="/v2/mcp-server" className="v3-hax-header__cta">Connect MCP <span aria-hidden="true">↗</span></Link>

        <button className="v3-hax-header__menu" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="v3-mobile-nav" onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
      </div>

      <nav className="v3-hax-header__mobile" id="v3-mobile-nav" aria-label="Mobile navigation" hidden={!open}>
        {NAV.map(({ href, label }) => <Link href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link href="/v2/mcp-server" className="v3-hax-header__mobile-cta" onClick={() => setOpen(false)}>Connect MCP ↗</Link>
      </nav>
    </header>
  );
}
