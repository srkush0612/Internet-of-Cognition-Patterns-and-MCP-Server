"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  patterns,
  type BackingStrength,
  type Pattern,
} from "@/lib/patterns";
import {
  partitionPatternsByReady,
  PATTERN_READY_SLUGS,
} from "@/lib/pattern-ready";

type SortOption = "az" | "backing" | "newest";

const BACKING_RANK: Record<BackingStrength, number> = {
  Strong: 4,
  Moderate: 3,
  Thin: 2,
  None: 1,
};

const BACKING_FILTERS: BackingStrength[] = [
  "Strong",
  "Moderate",
  "Thin",
  "None",
];

function backingBadgeClass(strength?: BackingStrength): string {
  switch (strength) {
    case "Strong":
      return "bg-emerald-100 text-emerald-800 ring-emerald-200";
    case "Moderate":
      return "bg-amber-100 text-amber-800 ring-amber-200";
    case "Thin":
      return "bg-slate-100 text-muted ring-slate-200";
    default:
      return "bg-[var(--color-tag-bg)] text-accent-h ring-[var(--color-tag-border)]";
  }
}

function BackingIcon({ strength }: { strength?: BackingStrength }) {
  if (strength === "Strong") {
    return <ShieldCheck className="h-3.5 w-3.5" />;
  }
  if (strength === "Moderate") {
    return <Shield className="h-3.5 w-3.5" />;
  }
  return <ShieldAlert className="h-3.5 w-3.5" />;
}

const READY_TAG =
  "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200";

const COMING_SOON_TAG =
  "inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted ring-1 ring-slate-200";

function sortPatterns(list: Pattern[], sort: SortOption): Pattern[] {
  return [...list].sort((a, b) => {
    if (sort === "backing") {
      const rankA = BACKING_RANK[a.backingStrength ?? "None"];
      const rankB = BACKING_RANK[b.backingStrength ?? "None"];
      return rankB - rankA || a.title.localeCompare(b.title);
    }

    if (sort === "newest") {
      return patterns.indexOf(b) - patterns.indexOf(a);
    }

    return a.title.localeCompare(b.title);
  });
}

function PatternCard({
  pattern,
  ready,
}: {
  pattern: Pattern;
  ready: boolean;
}) {
  const sourceCount = pattern.evidence?.length ?? 0;

  return (
    <Link
      href={`/patterns/${pattern.slug}`}
      className={`group osh-card flex h-full flex-col p-6 ${
        ready ? "" : "opacity-95"
      }`}
    >
      <div className="mb-2">
        <span className={ready ? READY_TAG : COMING_SOON_TAG}>
          {ready ? "Ready" : "Coming soon"}
        </span>
      </div>

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-ink transition group-hover:text-accent-h">
          {pattern.title}
        </h3>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-subtle transition group-hover:text-accent" />
      </div>

      <div className="mt-3 flex-1 rounded-xl border border-line bg-hover px-3.5 py-3">
        <p className="text-sm leading-relaxed text-muted line-clamp-3">
          {pattern.oneliner || pattern.explanation}
        </p>
      </div>

      <div className="mt-3 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2">
        <p className="text-xs font-medium text-muted">
          <span
            className={`mr-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${backingBadgeClass(pattern.backingStrength)}`}
          >
            {pattern.backingStrength ?? "None"}
          </span>
          {sourceCount} source{sourceCount === 1 ? "" : "s"}
        </p>
      </div>

      <span className="mt-4 text-sm font-semibold text-accent">
        View Pattern
      </span>
    </Link>
  );
}

export function PatternGallery() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<BackingStrength>>(
    new Set(),
  );
  const [sort, setSort] = useState<SortOption>("az");

  useEffect(() => {
    const slug = searchParams.get("pattern");
    if (slug && patterns.some((pattern) => pattern.slug === slug)) {
      router.replace(`/patterns/${slug}`);
    }
  }, [searchParams, router]);

  const toggleFilter = (strength: BackingStrength) => {
    setActiveFilters((current) => {
      const next = new Set(current);
      if (next.has(strength)) {
        next.delete(strength);
      } else {
        next.add(strength);
      }
      return next;
    });
  };

  const { ready: readyPatterns, pending: pendingPatterns, total } =
    useMemo(() => {
      let result = [...patterns];

      if (query.trim()) {
        const normalized = query.trim().toLowerCase();
        result = result.filter(
          (pattern) =>
            pattern.title.toLowerCase().includes(normalized) ||
            pattern.slug.toLowerCase().includes(normalized) ||
            pattern.oneliner.toLowerCase().includes(normalized) ||
            pattern.explanation.toLowerCase().includes(normalized),
        );
      }

      if (activeFilters.size > 0) {
        result = result.filter((pattern) =>
          activeFilters.has(pattern.backingStrength ?? "None"),
        );
      }

      const { ready, pending } = partitionPatternsByReady(result);

      return {
        ready: sortPatterns(ready, sort),
        pending: sortPatterns(pending, sort),
        total: result.length,
      };
    }, [query, activeFilters, sort]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="osh-container py-12">
        <div className="max-w-3xl">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            All {patterns.length} Patterns
          </h1>
          <p className="mt-3 text-lg text-muted">
            {PATTERN_READY_SLUGS.length} ready to use ·{" "}
            {patterns.length - PATTERN_READY_SLUGS.length} coming soon
          </p>
        </div>

        <div className="mt-10 space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search patterns by name or keyword…"
              className="w-full rounded-xl border border-line py-3 pl-10 pr-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-[var(--color-tag-bg)]"
            />
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {BACKING_FILTERS.map((strength) => {
                const active = activeFilters.has(strength);
                return (
                  <button
                    key={strength}
                    type="button"
                    onClick={() => toggleFilter(strength)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                      active
                        ? backingBadgeClass(strength)
                        : "bg-white text-muted ring-slate-200 hover:bg-hover"
                    }`}
                  >
                    {strength}
                  </button>
                );
              })}
            </div>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-muted outline-none focus:border-accent focus:ring-2 focus:ring-[var(--color-tag-bg)]"
            >
              <option value="az">A–Z</option>
              <option value="backing">Most backed</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          <p className="text-sm text-subtle">
            {total} pattern{total === 1 ? "" : "s"} match
          </p>
        </div>

        {total === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-line-md bg-white p-12 text-center">
            <p className="font-heading text-lg font-semibold text-ink">
              No patterns found
            </p>
            <p className="mt-2 text-sm text-subtle">
              Try a different search term or clear your filters.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {readyPatterns.length > 0 ? (
              <section aria-labelledby="gallery-ready-heading">
                <h2
                  id="gallery-ready-heading"
                  className="font-heading text-xl font-bold text-ink"
                >
                  Ready
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Live patterns you can explore and use in chat today.
                </p>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {readyPatterns.map((pattern) => (
                    <PatternCard key={pattern.slug} pattern={pattern} ready />
                  ))}
                </div>
              </section>
            ) : null}

            {readyPatterns.length > 0 && pendingPatterns.length > 0 ? (
              <div
                className="border-t border-line"
                role="separator"
                aria-hidden
              />
            ) : null}

            {pendingPatterns.length > 0 ? (
              <section aria-labelledby="gallery-coming-soon-heading">
                <h2
                  id="gallery-coming-soon-heading"
                  className="font-heading text-xl font-bold text-ink"
                >
                  Coming soon
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Research-backed patterns still in development.
                </p>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pendingPatterns.map((pattern) => (
                    <PatternCard
                      key={pattern.slug}
                      pattern={pattern}
                      ready={false}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
