import { editableFieldsForSlug } from "@/lib/editable-fields";
import convergenceMd from "../pattern-instructions/convergence-point.md";
import decisionLedgerMd from "../pattern-instructions/decision-ledger.md";
import assumptionSurfaceMd from "../pattern-instructions/assumption-surface.md";
import credentialBoundaryMd from "../pattern-instructions/credential-boundary.md";
import presenceBoundaryMd from "../pattern-instructions/presence-boundary.md";
import deferredDetailMd from "../pattern-instructions/deferred-detail.md";
import {
  INSTRUCTION_SUPPLEMENTS,
  WORKSPACE_FIELD_MAPS,
} from "./field-mappers";
import { parsePatternInstructions } from "./parse-instructions";
import type { PatternInstructions, PatternSlug } from "./types";

const MARKDOWN_BY_SLUG: Record<PatternSlug, string> = {
  "convergence-point": convergenceMd,
  "decision-ledger": decisionLedgerMd,
  "assumption-surface": assumptionSurfaceMd,
  "credential-boundary": credentialBoundaryMd,
  "presence-boundary": presenceBoundaryMd,
  "deferred-detail": deferredDetailMd,
};

const instructionCache = new Map<PatternSlug, PatternInstructions>();

function mergeInstructions(
  parsed: PatternInstructions,
  slug: PatternSlug,
): PatternInstructions {
  const supplement = INSTRUCTION_SUPPLEMENTS[slug];
  if (!supplement) return parsed;

  return {
    ...parsed,
    extractionQuestions:
      supplement.extractionQuestions && supplement.extractionQuestions.length > 0
        ? supplement.extractionQuestions
        : parsed.extractionQuestions,
    errorMessages: { ...parsed.errorMessages, ...supplement.errorMessages },
    warningMessages: { ...parsed.warningMessages, ...supplement.warningMessages },
    fieldTips: { ...parsed.fieldTips, ...supplement.fieldTips },
    mistakeSuggestions: {
      ...parsed.mistakeSuggestions,
      ...supplement.mistakeSuggestions,
    },
    recommendation: supplement.recommendation
      ? { ...parsed.recommendation, ...supplement.recommendation }
      : parsed.recommendation,
    workspaceFieldMap: WORKSPACE_FIELD_MAPS[slug],
  };
}

export function loadPatternInstructions(slug: string): PatternInstructions | null {
  if (!(slug in MARKDOWN_BY_SLUG)) {
    return null;
  }

  const patternSlug = slug as PatternSlug;
  if (!instructionCache.has(patternSlug)) {
    const parsed = parsePatternInstructions(
      MARKDOWN_BY_SLUG[patternSlug],
      patternSlug,
      WORKSPACE_FIELD_MAPS[patternSlug],
    );
    instructionCache.set(patternSlug, mergeInstructions(parsed, patternSlug));
  }

  return instructionCache.get(patternSlug) ?? null;
}

export function loadAllPatternInstructions(): PatternInstructions[] {
  return (Object.keys(MARKDOWN_BY_SLUG) as PatternSlug[]).map(
    (slug) => loadPatternInstructions(slug)!,
  );
}

export function getExtractionQuestions(slug: string) {
  return loadPatternInstructions(slug)?.extractionQuestions ?? [];
}

export function getFieldGuide(slug: string, field: string): string | undefined {
  const instructions = loadPatternInstructions(slug);
  const fromInstructions = instructions?.fieldTips[field]?.trim();
  if (fromInstructions) return fromInstructions;

  const editable = editableFieldsForSlug(slug).parameters.find(
    (item) => item.key === field,
  );
  return editable?.description?.trim() || undefined;
}

export function getRecommendationCopy(slug: string) {
  return loadPatternInstructions(slug)?.recommendation ?? null;
}

export type { PatternInstructions, PatternSlug } from "./types";
export { PATTERN_INSTRUCTION_SLUGS } from "./types";
