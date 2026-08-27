import {
  detectApplicablePatterns,
  type PatternSuggestion,
} from "@/lib/detect-applicable-patterns";

export type AlternativePatternDetail = PatternSuggestion & {
  reason: string;
  evidence: string;
};

const ALTERNATIVE_COPY: Record<string, { reason: string; evidence: string }> = {
  "deferred-detail": {
    reason: "Resolution leaves some details open for later",
    evidence: "Tracks what was decided now vs deferred",
  },
  "convergence-point": {
    reason: "Multiple agents need an explicit convergence step",
    evidence: "Shows how conflict was resolved and what was adopted",
  },
};

export function getAlternativePatternDetails(
  workspace: Record<string, unknown>,
  excludeSlug?: string,
): AlternativePatternDetail[] {
  return detectApplicablePatterns(workspace, excludeSlug).map((suggestion) =>
    toAlternativeDetail(suggestion),
  );
}

function toAlternativeDetail(suggestion: PatternSuggestion): AlternativePatternDetail {
  const copy = ALTERNATIVE_COPY[suggestion.slug];
  return {
    ...suggestion,
    reason: copy?.reason ?? suggestion.description,
    evidence: copy?.evidence ?? suggestion.description,
  };
}

