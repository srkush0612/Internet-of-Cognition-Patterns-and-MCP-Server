import type { PatternSlug } from "@/lib/patterns/types";

export type ScenarioLandingPill = {
  slug: PatternSlug;
  /** User-facing scenario — derived from Typical scenario in instruction markdown. */
  label: string;
};

/** All landing-ready pills (rotate featured subset from this list). */
export const ALL_SCENARIO_LANDING_PILLS: ScenarioLandingPill[] = [
  {
    slug: "convergence-point",
    label: "Disagreement evolved as info surfaced. How was it resolved?",
  },
  {
    slug: "decision-ledger",
    label: "Made a choice between options. Want to remember why this one won",
  },
  {
    slug: "assumption-surface",
    label: "Teams disagreed. Want to surface the beliefs that caused it",
  },
  {
    slug: "credential-boundary",
    label:
      "Decision needed multiple people with different expertise. Why each was needed?",
  },
  {
    slug: "presence-boundary",
    label: "Information surfaced at different times. Document who knew what when",
  },
  {
    slug: "deferred-detail",
    label: "Complex process in phases. Document how each enabled the next",
  },
];

/** Featured on landing — keep to 3–4 most common; rotate as the library grows. */
export const FEATURED_SCENARIO_LANDING_PILLS: ScenarioLandingPill[] = [
  ALL_SCENARIO_LANDING_PILLS[0], // convergence-point
  ALL_SCENARIO_LANDING_PILLS[1], // decision-ledger
  ALL_SCENARIO_LANDING_PILLS[2], // assumption-surface
  ALL_SCENARIO_LANDING_PILLS[5], // deferred-detail
];

/** @deprecated Use FEATURED_SCENARIO_LANDING_PILLS for landing UI. */
export const SCENARIO_LANDING_PILLS = FEATURED_SCENARIO_LANDING_PILLS;
