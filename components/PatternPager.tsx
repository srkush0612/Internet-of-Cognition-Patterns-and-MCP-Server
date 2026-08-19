import Link from "next/link";
import { getAdjacentPatterns } from "@/lib/patterns";

function GridIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
    >
      <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

const BTN =
  "inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-accent-h";

export function PatternPager({
  slug,
  themed = false,
}: {
  slug: string;
  themed?: boolean;
}) {
  const { prev, next } = getAdjacentPatterns(slug);
  const patternBase = themed ? "/design-system/patterns" : "/patterns";
  const gridHref = themed ? "/design-system" : "/gallery";

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-4"
      aria-label="Pattern navigation"
    >
      <div className="flex flex-wrap items-center gap-2">
        {prev ? (
          <Link href={`${patternBase}/${prev.slug}`} className={BTN}>
            <span aria-hidden>‹</span>
            {prev.title}
          </Link>
        ) : null}
        {next ? (
          <Link href={`${patternBase}/${next.slug}`} className={BTN}>
            {next.title}
            <span aria-hidden>›</span>
          </Link>
        ) : null}
      </div>
      <Link
        href={gridHref}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-tag-border)] bg-[var(--color-tag-bg)] px-4 py-2 text-sm font-semibold text-accent-h transition hover:bg-accent hover:text-white"
      >
        <GridIcon />
        All patterns
      </Link>
    </nav>
  );
}
