import {
  CONVERGENCE_AGENT_THRESHOLD,
  CONVERGENCE_ERROR_MESSAGES,
  CONVERGENCE_MISTAKE_SUGGESTIONS,
  CONVERGENCE_WARNING_MESSAGES,
  type ConvergenceFieldKey,
} from "@/lib/convergence-point-instructions";

export type ConvergenceFormSnapshot = {
  agentRoster?: string[];
  disagreementDimension?: string;
  resolutionMechanism?: string;
  outcome?: string;
};

export type ConvergenceFieldErrors = Partial<
  Record<"agents" | "disagreement" | "resolution" | "outcome", string>
>;

export type ConvergenceValidationResult = {
  errors: ConvergenceFieldErrors;
  warnings: string[];
  suggestions: string[];
  canSave: boolean;
  agentCount: number;
  showAlternativeViews: boolean;
};

const VAGUE_DISAGREEMENT =
  /^(we\s+)?(disagreed|had\s+(a\s+)?conflict|different\s+opinions|there\s+was\s+conflict|conflict)$/i;

const VAGUE_OUTCOME =
  /^(approved|accepted|resolved|decided|we\s+went\s+with\s+\w+\.?)$/i;

const MIN_DISAGREEMENT_LENGTH = 10;

function normalizeRoster(roster?: string[]): string[] {
  return (roster ?? []).map((item) => item.trim()).filter(Boolean);
}

export function isVagueDisagreement(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < MIN_DISAGREEMENT_LENGTH) return true;
  return VAGUE_DISAGREEMENT.test(trimmed);
}

export function isVagueOutcome(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.length < 20) return VAGUE_OUTCOME.test(trimmed);
  return false;
}

export function isCollaborationNotConflict(text: string): boolean {
  const lower = text.toLowerCase();
  const hasCollaboration =
    /\b(worked together|collaborated|teamwork|succeeded together|all aligned|unanimous)\b/.test(
      lower,
    );
  const hasConflict =
    /\b(disagree|conflict|vs\.?|versus|debate|split|tension|flagged|opposed|wanted|pushed back)\b/.test(
      lower,
    );
  return hasCollaboration && !hasConflict;
}

export function detectConvergenceMistakes(
  state: ConvergenceFormSnapshot,
): string[] {
  const suggestions: string[] = [];
  const roster = normalizeRoster(state.agentRoster);
  const disagreement = state.disagreementDimension?.trim() ?? "";
  const resolution = state.resolutionMechanism?.trim() ?? "";
  const outcome = state.outcome?.trim() ?? "";

  if (roster.length >= 2 && !disagreement) {
    suggestions.push(CONVERGENCE_MISTAKE_SUGGESTIONS.disagreementMissing);
  }

  if (disagreement && !resolution) {
    suggestions.push(CONVERGENCE_MISTAKE_SUGGESTIONS.resolutionHidden);
  }

  if (resolution && (!outcome || isVagueOutcome(outcome))) {
    suggestions.push(CONVERGENCE_MISTAKE_SUGGESTIONS.outcomeVague);
  }

  if (roster.length >= CONVERGENCE_AGENT_THRESHOLD) {
    suggestions.push(CONVERGENCE_MISTAKE_SUGGESTIONS.tooManyAgents);
  }

  if (disagreement && isCollaborationNotConflict(disagreement)) {
    suggestions.push(CONVERGENCE_MISTAKE_SUGGESTIONS.wrongPattern);
  }

  return suggestions;
}

/** Non-blocking tips and warnings for chat guidance (deduplicated). */
export function getConvergenceGuidanceMessages(
  state: ConvergenceFormSnapshot,
): string[] {
  const { suggestions, warnings } = validateConvergencePoint(state);
  const combined = [...suggestions, ...warnings];
  return combined.filter(
    (item, index) => combined.indexOf(item) === index,
  );
}

export function validateConvergencePoint(
  state: ConvergenceFormSnapshot,
): ConvergenceValidationResult {
  const errors: ConvergenceFieldErrors = {};
  const warnings: string[] = [];
  const roster = normalizeRoster(state.agentRoster);
  const agentCount = roster.length;
  const disagreement = state.disagreementDimension?.trim() ?? "";
  const resolution = state.resolutionMechanism?.trim() ?? "";
  const outcome = state.outcome?.trim() ?? "";

  if (agentCount === 0) {
    errors.agents = CONVERGENCE_ERROR_MESSAGES.agentRoster_empty;
  } else if (agentCount < 2) {
    errors.agents = CONVERGENCE_ERROR_MESSAGES.agentRoster_tooFew;
  }

  if (!disagreement) {
    errors.disagreement = CONVERGENCE_ERROR_MESSAGES.disagreementDimension_empty;
  } else if (isVagueDisagreement(disagreement)) {
    errors.disagreement = CONVERGENCE_ERROR_MESSAGES.disagreementDimension_tooVague;
  }

  if (!resolution) {
    warnings.push(CONVERGENCE_WARNING_MESSAGES.resolutionMechanism_empty);
  }

  if (!outcome) {
    warnings.push(CONVERGENCE_WARNING_MESSAGES.outcome_empty);
  } else if (isVagueOutcome(outcome)) {
    warnings.push(CONVERGENCE_MISTAKE_SUGGESTIONS.outcomeVague);
  }

  if (agentCount >= CONVERGENCE_AGENT_THRESHOLD) {
    warnings.push(CONVERGENCE_WARNING_MESSAGES.agentCount_high);
  }

  const suggestions = detectConvergenceMistakes(state);

  return {
    errors,
    warnings,
    suggestions,
    canSave: Object.keys(errors).length === 0,
    agentCount,
    showAlternativeViews: agentCount >= CONVERGENCE_AGENT_THRESHOLD,
  };
}

export function fieldIsFilled(
  state: ConvergenceFormSnapshot,
  field: ConvergenceFieldKey,
): boolean {
  switch (field) {
    case "agentRoster":
      return normalizeRoster(state.agentRoster).length >= 2;
    case "disagreementDimension":
      return (
        Boolean(state.disagreementDimension?.trim()) &&
        !isVagueDisagreement(state.disagreementDimension ?? "")
      );
    case "resolutionMechanism":
      return Boolean(state.resolutionMechanism?.trim());
    case "outcome":
      return Boolean(state.outcome?.trim()) && !isVagueOutcome(state.outcome ?? "");
    case "timeline":
    case "evidence":
      return false;
    default:
      return false;
  }
}
