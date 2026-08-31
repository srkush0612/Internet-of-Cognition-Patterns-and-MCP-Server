import type { Pattern } from "@/lib/patterns";

/** Patterns with reference designs — shown first as Ready. */
export const PATTERN_READY_SLUGS = [
  "assumption-surface",
  "authority-gradient",
  "convergence-point",
  "credential-boundary",
  "decision-ledger",
  "deferred-detail",
  "memory-commitment-review",
  "presence-boundary",
] as const;

const readySet = new Set<string>(PATTERN_READY_SLUGS);

/** Extra pills shown immediately after the Ready tag on pattern cards. */
export const PATTERN_READY_COMPANION_TAGS: Partial<
  Record<(typeof PATTERN_READY_SLUGS)[number], readonly string[]>
> = {
  "authority-gradient": ["New"],
  "memory-commitment-review": ["New"],
};

export function isPatternReady(slug: string): boolean {
  return readySet.has(slug);
}

export function getPatternReadyCompanionTags(slug: string): readonly string[] {
  return (
    PATTERN_READY_COMPANION_TAGS[
      slug as (typeof PATTERN_READY_SLUGS)[number]
    ] ?? []
  );
}

/** Homepage grid — curated snapshot, not the full ready catalog. */
export const HOMEPAGE_PATTERN_SNAPSHOT = [
  "authority-gradient",
  "memory-commitment-review",
  "convergence-point",
  "decision-ledger",
] as const;

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
