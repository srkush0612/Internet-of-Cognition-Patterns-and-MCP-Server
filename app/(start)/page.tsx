import Link from "next/link";
import type { Metadata } from "next";
import { HeroOrbs } from "@/components/PatternTaxonomy";
import { patterns as v1Patterns } from "@/lib/patterns";
import { patterns as v2Patterns } from "@/lib/v2/catalog";
import { modes } from "@/lib/v2/modes";

export const metadata: Metadata = {
  title: "HAX 2.0 patterns",
  description: "Internal entry point: the current build, and the one it replaces.",
};

/**
 * Internal scaffolding, not a product screen.
 *
 * v2 is the work; v1 is here so the earlier build stays reachable while it is
 * being replaced. Neither card argues for itself against the other, and this
 * page goes away once v1 does.
 */
export default function VersionPicker() {
  return (
    <main className="osh-hero flex flex-1 items-center">
      <HeroOrbs />

      <div className="osh-container relative py-16 sm:py-24">
        <p className="v2-eyebrow">Internal</p>
        <h1 className="mt-3 max-w-[20ch] text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
          HAX 2.0 patterns
        </h1>
        <p className="v2-lede mt-5">
          Two builds are deployed here while the second one is being finished.
          This page is a way in to each of them, and it goes away when the
          earlier build does.
        </p>

        <div className="v2-pick mt-12">
          <div className="v2-pick__card">
            <div className="flex items-center gap-2">
              <span className="v2-badge">v2</span>
              <span className="text-xs text-faint">current</span>
            </div>
            <h2>Modes and behavior specs</h2>
            <p>
              {modes.length} modes, {v2Patterns.length} interaction patterns,
              and one sentence per pattern that says how the agent should
              behave.
            </p>
            <ul className="v2-pick__list">
              <li>Sorted by mode: what the opening asks of the receiver</li>
              <li>Four levels, from one agent to many people</li>
              <li>Studio writes a behavior spec slot by slot</li>
              <li>Gaps in the catalog shown rather than hidden</li>
            </ul>
            <div className="mt-auto flex flex-wrap gap-2.5 pt-2">
              <Link href="/v2" className="osh-cta-solid text-sm">
                Open v2
              </Link>
              <Link href="/v2/patterns" className="osh-cta-outline text-sm">
                Straight to the catalog
              </Link>
            </div>
          </div>

          <div className="v2-pick__card">
            <div className="flex items-center gap-2">
              <span className="v1-badge">v1</span>
              <span className="text-xs text-faint">kept for reference</span>
            </div>
            <h2>Pattern library</h2>
            <p>
              The earlier build, preserved so nothing in it is lost while it is
              being replaced. {v1Patterns.length} patterns from practitioner
              interviews, each with its evidence and a reference design.
            </p>
            <ul className="v2-pick__list">
              <li>Sorted by Autonomy, Legibility, Commitment, Reporting</li>
              <li>Chat with an agent about your own setup</li>
              <li>Studio matches nine incident situations to patterns</li>
              <li>A live MCP server behind it</li>
            </ul>
            <div className="mt-auto flex flex-wrap gap-2.5 pt-2">
              <Link href="/v1" className="osh-cta-outline text-sm">
                Open v1
              </Link>
              <Link href="/gallery" className="osh-cta-outline text-sm">
                Straight to the patterns
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
