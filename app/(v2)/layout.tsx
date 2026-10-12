import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { V2Header } from "@/components/v2/V2Header";
import "../v2.css";

export const metadata: Metadata = {
  title: "HAX 2.0 patterns, v2",
  description:
    "A research-grounded library of interaction patterns and behavior specs for agents working with people and with each other.",
};

export default function V2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="v2 flex flex-1 flex-col">
      {/* A revealed section is server-rendered at opacity 0 and brought in on
          scroll. With scripting off there is nothing to bring it in, so the
          page would be blank below the hero, this hands it straight back. */}
      <noscript>
        <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
      </noscript>

      {/* The header sits inside the provider so it can reach the Lenis
          instance for in-page jumps. Root mode renders no wrapper element,
          so this changes the DOM not at all and sticky still sticks. */}
      <SmoothScroll>
        <V2Header />
        <div className="flex flex-1 flex-col">{children}</div>
      </SmoothScroll>

      {/* How the catalog was built is a real question, and not the first one,
          so it lives here rather than in a tab competing with the four that
          answer what someone came for. */}
      <footer className="v2-footer">
        <div className="osh-container">
          <nav aria-label="Footer">
            <Link href="/v2/patterns">Patterns</Link>
            <Link href="/v2/modes">What agents do</Link>
            <Link href="/v2/studio">Studio</Link>
            <Link href="/v2/mcp-server">MCP server</Link>
            <Link href="/v2/methodology">How we built this</Link>
          </nav>
          <span>HAX, by Outshift</span>
        </div>
      </footer>

    </div>
  );
}
