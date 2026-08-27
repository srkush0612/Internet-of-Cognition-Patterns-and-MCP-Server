import { extractConvergencePoint, convergenceFormToWorkspace } from "@/components/patterns/edit/convergence-point-extractor";
import {
  CONVERGENCE_AGENT_THRESHOLD,
  CONVERGENCE_EXTRACTION_QUESTIONS,
  CONVERGENCE_WARNING_MESSAGES,
  type ExtractionQuestion,
} from "@/lib/convergence-point-instructions";
import type { ConvergenceFieldKey } from "@/lib/convergence-point-instructions";
import {
  fieldIsFilled,
  type ConvergenceFormSnapshot,
} from "@/lib/convergence-point-validation";

export type ConvergenceExtractionStep = ExtractionQuestion & {
  index: number;
};

export function workspaceToConvergenceSnapshot(
  workspace: Record<string, unknown>,
): ConvergenceFormSnapshot {
  const roster = Array.isArray(workspace.agentRoster)
    ? (workspace.agentRoster as string[])
    : Array.isArray(workspace.positions)
      ? (workspace.positions as { agent?: string }[])
          .map((row) => row.agent?.trim())
          .filter(Boolean)
      : [];

  return {
    agentRoster: roster as string[],
    disagreementDimension: String(workspace.disagreement ?? ""),
    resolutionMechanism: String(
      workspace.resolutionMechanism ?? workspace.resolutionRationale ?? "",
    ),
    outcome: String(workspace.decision ?? workspace.outcome ?? ""),
  };
}

export function getNextExtractionQuestion(
  state: ConvergenceFormSnapshot,
): ConvergenceExtractionStep | null {
  const required: ConvergenceFieldKey[] = [
    "agentRoster",
    "disagreementDimension",
  ];
  const recommended: ConvergenceFieldKey[] = [
    "resolutionMechanism",
    "outcome",
  ];

  for (let index = 0; index < CONVERGENCE_EXTRACTION_QUESTIONS.length; index += 1) {
    const step = CONVERGENCE_EXTRACTION_QUESTIONS[index]!;
    if (required.includes(step.field) && !fieldIsFilled(state, step.field)) {
      return { ...step, index };
    }
  }

  for (let index = 0; index < CONVERGENCE_EXTRACTION_QUESTIONS.length; index += 1) {
    const step = CONVERGENCE_EXTRACTION_QUESTIONS[index]!;
    if (recommended.includes(step.field) && !fieldIsFilled(state, step.field)) {
      return { ...step, index };
    }
  }

  return null;
}

export function getOptionalExtractionQuestions(
  _state: ConvergenceFormSnapshot,
): ConvergenceExtractionStep[] {
  return [];
}

export function buildExtractionIntroMessage(): string {
  return CONVERGENCE_EXTRACTION_QUESTIONS[0]!.question;
}

export function buildExtractionFollowUp(
  state: ConvergenceFormSnapshot,
  answeredField?: string,
): string | null {
  const next = getNextExtractionQuestion(state);
  const parts: string[] = ["Got it."];

  if (
    answeredField === "agentRoster" &&
    (state.agentRoster?.length ?? 0) >= CONVERGENCE_AGENT_THRESHOLD
  ) {
    parts.push(CONVERGENCE_WARNING_MESSAGES.agentCount_high);
  }

  if (next) {
    parts.push(next.question);
    return parts.join("\n\n");
  }

  return "Your instance is ready. Review the preview, then Customise → Save when it looks right.";
}

export function mergeExtractionIntoSnapshot(
  state: ConvergenceFormSnapshot,
  text: string,
): { nextState: ConvergenceFormSnapshot; found: string[] } {
  const { extracted, found } = extractConvergencePoint(text);
  const nextState: ConvergenceFormSnapshot = { ...state };

  if (extracted.agentRoster?.length) {
    const synced = convergenceFormToWorkspace({
      ...nextState,
      agentRoster: extracted.agentRoster,
    });
    Object.assign(nextState, synced);
  }
  if (extracted.disagreementDimension) {
    nextState.disagreementDimension = extracted.disagreementDimension;
  }
  if (extracted.resolutionMechanism) {
    nextState.resolutionMechanism = extracted.resolutionMechanism;
  }
  if (extracted.outcome) {
    nextState.outcome = extracted.outcome;
  }

  return { nextState, found };
}
