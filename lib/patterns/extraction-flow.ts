import {
  extractAgents,
  convergenceFormToWorkspace,
  workspaceToConvergenceForm,
} from "@/components/patterns/edit/convergence-point-extractor";
import {
  CONVERGENCE_AGENT_THRESHOLD,
  CONVERGENCE_WARNING_MESSAGES,
} from "@/lib/convergence-point-instructions";
import { getUniqueAgentCount } from "@/lib/convergence-timeline-from-workspace";
import { getPattern } from "@/lib/patterns";
import { defaultWorkspaceForSlug, mergeWorkspaceForSlug } from "@/lib/workspace-defaults";
import { applyExtractionAnswer } from "./extractors";
import { markFieldAnswered, stripExtractionMeta } from "./extraction-state";
import { loadPatternInstructions, getFieldGuide } from "./loader";
import {
  fieldIsFilledInWorkspace,
  validatePatternWorkspace,
} from "./validator";
import type { PatternInstructions, PatternValidationResult } from "./types";

export type ExtractionStep = {
  field: string;
  question: string;
  optional?: boolean;
  index: number;
};

export function workspaceToInstructionSnapshot(
  slug: string,
  workspace: Record<string, unknown>,
): Record<string, unknown> {
  const instructions = loadPatternInstructions(slug);
  if (!instructions) return workspace;

  const snapshot: Record<string, unknown> = {};
  for (const [instructionField, workspaceKey] of Object.entries(
    instructions.workspaceFieldMap,
  )) {
    snapshot[instructionField] = workspace[workspaceKey];
  }
  return snapshot;
}

export function instructionSnapshotToWorkspace(
  slug: string,
  snapshot: Record<string, unknown>,
  baseWorkspace?: Record<string, unknown>,
): Record<string, unknown> {
  const instructions = loadPatternInstructions(slug);
  const workspace = {
    ...defaultWorkspaceForSlug(slug),
    ...(baseWorkspace ?? {}),
  };
  if (!instructions) return workspace;

  for (const [instructionField, value] of Object.entries(snapshot)) {
    const workspaceKey = instructions.workspaceFieldMap[instructionField];
    if (workspaceKey && value !== undefined && value !== "") {
      workspace[workspaceKey] = value;
    }
  }
  return workspace;
}

export function getNextExtractionQuestion(
  slug: string,
  workspace: Record<string, unknown>,
): ExtractionStep | null {
  const instructions = loadPatternInstructions(slug);
  if (!instructions) return null;

  const normalized = mergeWorkspaceForSlug(slug, workspace);
  const requiredFields = new Set(
    instructions.requiredFields.map((field) => field.key),
  );

  for (let index = 0; index < instructions.extractionQuestions.length; index += 1) {
    const step = instructions.extractionQuestions[index]!;
    if (step.optional) continue;
    if (!fieldIsFilledInWorkspace(instructions, normalized, step.field)) {
      return { ...step, index };
    }
  }

  for (let index = 0; index < instructions.extractionQuestions.length; index += 1) {
    const step = instructions.extractionQuestions[index]!;
    if (!step.optional) continue;
    if (
      requiredFields.has(step.field) &&
      !fieldIsFilledInWorkspace(instructions, normalized, step.field)
    ) {
      return { ...step, index };
    }
    if (
      !requiredFields.has(step.field) &&
      !fieldIsFilledInWorkspace(instructions, normalized, step.field)
    ) {
      return { ...step, index };
    }
  }

  return null;
}

export function formatExtractionQuestionMessage(
  slug: string,
  step: ExtractionStep,
): string {
  const tip = getPatternFieldTip(slug, step.field);
  if (!tip) return step.question;
  return `${step.question}\n\nTip: ${tip}`;
}

export function buildExtractionIntroMessage(slug: string): string {
  const instructions = loadPatternInstructions(slug);
  const firstStep = instructions?.extractionQuestions[0];

  if (!firstStep) {
    const patternName = getPattern(slug)?.title ?? slug.replace(/-/g, " ");
    return `I've created an instance of ${patternName}. Review the preview, then click Customise when you're ready to fill in your scenario.`;
  }

  return firstStep.question;
}

function manyAgentsExtractionNote(
  slug: string,
  workspace: Record<string, unknown>,
  answeredField?: string,
): string | null {
  if (slug !== "convergence-point" || answeredField !== "agentRoster") {
    return null;
  }

  const count = getUniqueAgentCount(
    mergeWorkspaceForSlug(slug, workspace) as Parameters<
      typeof getUniqueAgentCount
    >[0],
  );

  if (count < CONVERGENCE_AGENT_THRESHOLD) {
    return null;
  }

  return CONVERGENCE_WARNING_MESSAGES.agentCount_high;
}

export function buildExtractionFollowUp(
  slug: string,
  workspace: Record<string, unknown>,
  answeredField?: string,
): string | null {
  const normalized = mergeWorkspaceForSlug(slug, workspace);
  const next = getNextExtractionQuestion(slug, normalized);

  const parts: string[] = ["Got it."];

  const agentsNote = manyAgentsExtractionNote(slug, normalized, answeredField);
  if (agentsNote) {
    parts.push(agentsNote);
  }

  if (next) {
    parts.push(next.question);
    return parts.join("\n\n");
  }

  return "Your instance is ready. Review the preview, then Customise → Save when it looks right.";
}

export function mergeExtractionIntoWorkspace(
  slug: string,
  workspace: Record<string, unknown>,
  text: string,
): { nextWorkspace: Record<string, unknown>; found: string[] } {
  const instructions = loadPatternInstructions(slug);
  const next = getNextExtractionQuestion(slug, workspace);
  if (!instructions || !next) {
    return { nextWorkspace: workspace, found: [] };
  }

  let nextWorkspace = applyExtractionAnswer(
    slug as import("./types").PatternSlug,
    workspace,
    next.field,
    text,
  );

  if (slug === "convergence-point" && next.field === "agentRoster") {
    const agents = extractAgents(text);
    if (agents.length > 0) {
      const synced = convergenceFormToWorkspace({
        ...workspaceToConvergenceForm(nextWorkspace),
        agentRoster: agents,
      });
      nextWorkspace = markFieldAnswered(
        {
          ...nextWorkspace,
          ...synced,
        },
        next.field,
      );
    }
  }

  return { nextWorkspace, found: [next.field] };
}

export function isExtractionInProgress(
  slug: string,
  workspace: Record<string, unknown>,
): boolean {
  if (!hasExtractionFlow(slug)) return false;
  return getNextExtractionQuestion(slug, workspace) !== null;
}

export function validatePatternForm(
  slug: string,
  workspace: Record<string, unknown>,
): PatternValidationResult | null {
  const instructions = loadPatternInstructions(slug);
  if (!instructions) return null;
  const normalized = mergeWorkspaceForSlug(
    slug,
    stripExtractionMeta(workspace),
  );
  return validatePatternWorkspace(instructions, normalized);
}

export function getPatternGuidanceMessages(
  slug: string,
  workspace: Record<string, unknown>,
): string[] {
  return (
    validatePatternForm(slug, mergeWorkspaceForSlug(slug, workspace))
      ?.guidanceMessages ?? []
  );
}

export function getPatternFieldTip(
  slug: string,
  instructionField: string,
): string | undefined {
  return getFieldGuide(slug, instructionField);
}

export function hasExtractionFlow(slug: string): boolean {
  const instructions = loadPatternInstructions(slug);
  return Boolean(instructions && instructions.extractionQuestions.length > 0);
}

export type { PatternInstructions, PatternValidationResult };
