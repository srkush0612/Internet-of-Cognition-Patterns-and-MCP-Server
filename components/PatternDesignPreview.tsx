"use client";

import Link from "next/link";
import {
  PATTERN_INBOX,
  PATTERN_STANDALONE,
  hasPatternInbox,
  hasPatternStandalone,
} from "@/components/patterns/pattern-registry";

type PatternDesignPreviewProps = {
  slug: string;
  patternName?: string;
};

export function PatternDesignPreview({
  slug,
  patternName,
}: PatternDesignPreviewProps) {
  const Standalone = PATTERN_STANDALONE[slug];
  const Inbox = PATTERN_INBOX[slug];
  const hasStandalone = hasPatternStandalone(slug);
  const hasInbox = hasPatternInbox(slug);

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <header className="shrink-0 border-b border-line bg-white px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">
          Preview
        </h2>
        <p className="mt-0.5 text-xs text-muted">
          {patternName ?? slug} · reference design from the library
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-auto overscroll-contain p-4">
        {Standalone ? (
          <div className="mx-auto w-full min-w-0 max-w-2xl [&_.pattern-component-card]:max-w-none">
            <Standalone compact />
          </div>
        ) : Inbox ? (
          <div className="mx-auto w-full min-w-0 max-w-2xl">
            <Inbox />
          </div>
        ) : (
          <div className="flex h-full min-h-[12rem] flex-col items-center justify-center rounded-2xl border border-dashed border-line-md bg-white p-8 text-center">
            <p className="font-heading text-sm font-semibold text-ink">
              Design preview coming soon
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted">
              This pattern does not have a live reference component yet. View
              the full pattern page for description and evidence.
            </p>
            <Link
              href={`/patterns/${slug}`}
              className="mt-4 text-sm font-semibold text-accent hover:text-accent-h"
            >
              Open pattern page →
            </Link>
          </div>
        )}
      </div>

      {(hasStandalone || hasInbox) && (
        <footer className="shrink-0 border-t border-line bg-white px-4 py-2.5">
          <Link
            href={`/patterns/${slug}`}
            className="text-xs font-semibold text-accent hover:text-accent-h"
          >
            View full pattern page →
          </Link>
        </footer>
      )}
    </div>
  );
}
