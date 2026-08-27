import { loadPatternInstructions } from "./loader";
import {
  isInstructionFieldAnswered,
  markFieldAnswered,
} from "./extraction-state";
import type { PatternSlug } from "./types";

function asTags(text: string): string[] {
  return text
    .split(/[,;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

const TAG_FIELDS = new Set(["phases", "deferred_details", "agentRoster", "deferredFields"]);

/** Apply one extraction answer to workspace for the active instruction field */
export function applyExtractionAnswer(
  slug: PatternSlug,
  workspace: Record<string, unknown>,
  instructionField: string,
  text: string,
): Record<string, unknown> {
  const trimmed = text.trim();
  if (!trimmed) return workspace;

  const instructions = loadPatternInstructions(slug);
  if (!instructions) return workspace;

  const workspaceKey = instructions.workspaceFieldMap[instructionField] ?? instructionField;
  let next = { ...workspace };

  if (TAG_FIELDS.has(workspaceKey) || TAG_FIELDS.has(instructionField)) {
    next = { ...next, [workspaceKey]: asTags(trimmed) };
  } else {
    next = { ...next, [workspaceKey]: trimmed };
  }

  return markFieldAnswered(next, instructionField);
}

export function mergeGenericExtraction(
  slug: PatternSlug,
  workspace: Record<string, unknown>,
  text: string,
  activeField: string,
): { nextWorkspace: Record<string, unknown>; found: string[] } {
  return {
    nextWorkspace: applyExtractionAnswer(slug, workspace, activeField, text),
    found: [activeField],
  };
}

export { isInstructionFieldAnswered };
