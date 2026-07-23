import Link from "next/link";
import { getAdjacentPatterns } from "@/lib/patterns";

function GridIcon() {
  return (
    <svg
      className="pattern-pager__icon"
      width="14"
      height="14"
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

export function PatternPager({
  slug,
  themed = false,
}: {
  slug: string;
  themed?: boolean;
}) {
  const { prev, next } = getAdjacentPatterns(slug);
  const patternBase = themed ? "/gallery/patterns" : "/patterns";
  const gridHref = themed ? "/gallery" : "/";

  return (
    <nav className="pattern-pager" aria-label="Pattern navigation">
      <div className="pattern-pager__adjacent">
        {prev ? (
          <Link
            href={`${patternBase}/${prev.slug}`}
            className="pattern-pager__btn"
          >
            <span className="pattern-pager__arrow" aria-hidden>
              ‹
            </span>
            {prev.title}
          </Link>
        ) : null}
        {next ? (
          <Link
            href={`${patternBase}/${next.slug}`}
            className="pattern-pager__btn"
          >
            {next.title}
            <span className="pattern-pager__arrow" aria-hidden>
              ›
            </span>
          </Link>
        ) : null}
      </div>
      <Link href={gridHref} className="pattern-pager__all-btn">
        <GridIcon />
        All patterns
      </Link>
    </nav>
  );
}
