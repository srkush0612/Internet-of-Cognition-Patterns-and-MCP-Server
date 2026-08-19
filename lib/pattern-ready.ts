import type { Pattern } from "@/lib/patterns";

/** Patterns with reference designs — shown first as Ready. */
export const PATTERN_READY_SLUGS = [
  "assumption-surface",
  "convergence-point",
  "credential-boundary",
  "decision-ledger",
  "deferred-detail",
  "presence-boundary",
] as const;

const readySet = new Set<string>(PATTERN_READY_SLUGS);

export function isPatternReady(slug: string): boolean {
  return readySet.has(slug);
}

export function partitionPatternsByReady(patterns: Pattern[]): {
  ready: Pattern[];
  pending: Pattern[];
} {
  const bySlug = new Map(patterns.map((pattern) => [pattern.slug, pattern]));

  const ready = PATTERN_READY_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (pattern): pattern is Pattern => pattern !== undefined,
  );

  const pending = patterns
    .filter((pattern) => !readySet.has(pattern.slug))
    .sort((a, b) => a.title.localeCompare(b.title));

  return { ready, pending };
}
