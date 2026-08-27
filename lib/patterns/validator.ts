import {
  getConvergenceGuidanceMessages,
  isVagueDisagreement,
  validateConvergencePoint,
  type ConvergenceFormSnapshot,
} from "@/lib/convergence-point-validation";
import { getWorkspaceKey } from "./field-mappers";
import { detectPatternMistakes } from "./mistake-detection";
import {
  isInstructionFieldAnswered,
} from "./extraction-state";
import type {
  InstructionFieldDef,
  PatternFieldErrors,
  PatternInstructions,
  PatternSlug,
  PatternValidationResult,
} from "./types";

function asTrimmedString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,;\n]+/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

function readWorkspaceValue(
  workspace: Record<string, unknown>,
  workspaceKey: string,
): unknown {
  return workspace[workspaceKey];
}

function getFieldValue(
  instructions: PatternInstructions,
  workspace: Record<string, unknown>,
  instructionField: string,
): unknown {
  const workspaceKey = getWorkspaceKey(instructions.slug, instructionField);
  return readWorkspaceValue(workspace, workspaceKey);
}

function validateInstructionField(
  field: InstructionFieldDef,
  value: unknown,
): { error?: string; warning?: string } {
  if (field.kind === "array" || field.key.includes("roster") || field.key === "phases") {
    const items = asStringArray(value);
    const minItems = field.minItems ?? 2;
    if (items.length < minItems) {
      return { error: field.emptyError ?? `Add at least ${minItems} entries` };
    }
    return {};
  }

  const text = asTrimmedString(value);
  if (!text) {
    if (field.emptyError) return { error: field.emptyError };
    if (field.missingWarning) return { warning: field.missingWarning };
    return {};
  }

  const minLength = field.minLength ?? 0;
  if (minLength > 0 && text.length < minLength) {
    if (field.vagueError) return { error: field.vagueError };
    return { error: field.emptyError ?? "Please add more detail" };
  }

  return {};
}

function validateConvergenceWorkspace(
  workspace: Record<string, unknown>,
): PatternValidationResult {
  const roster = asStringArray(workspace.agentRoster);
  const snapshot: ConvergenceFormSnapshot = {
    agentRoster: roster,
    disagreementDimension: asTrimmedString(workspace.disagreement),
    resolutionMechanism: asTrimmedString(workspace.resolutionMechanism),
    outcome: asTrimmedString(workspace.decision),
  };
  const result = validateConvergencePoint(snapshot);
  const errors: PatternFieldErrors = {};
  if (result.errors.agents) errors.agentRoster = result.errors.agents;
  if (result.errors.disagreement) errors.disagreement = result.errors.disagreement;
  if (result.errors.outcome) errors.decision = result.errors.outcome;

  return {
    errors,
    warnings: result.warnings,
    suggestions: result.suggestions,
    canSave: result.canSave,
    guidanceMessages: getConvergenceGuidanceMessages(snapshot),
  };
}

function validateGenericPattern(
  instructions: PatternInstructions,
  workspace: Record<string, unknown>,
): PatternValidationResult {
  const errors: PatternFieldErrors = {};
  const warnings: string[] = [];
  const suggestions: string[] = [];

  for (const field of instructions.requiredFields) {
    const value = getFieldValue(instructions, workspace, field.key);
    const workspaceKey = getWorkspaceKey(instructions.slug, field.key);
    const outcome = validateInstructionField(field, value);
    if (outcome.error && !errors[workspaceKey]) {
      errors[workspaceKey] = outcome.error;
    }
  }

  for (const field of instructions.recommendedFields) {
    const value = getFieldValue(instructions, workspace, field.key);
    const outcome = validateInstructionField(field, value);
    if (outcome.warning) {
      warnings.push(outcome.warning);
    } else if (!asTrimmedString(value) && !Array.isArray(value)) {
      const msg =
        field.missingWarning ??
        instructions.warningMessages[field.key] ??
        instructions.warningMessages[
          field.key.replace(/([A-Z])/g, "_$1").toLowerCase()
        ];
      if (msg) warnings.push(msg.startsWith("💡") ? msg : `💡 ${msg}`);
    }
  }

  const uniqueWarnings = warnings.filter(
    (item, index) => warnings.indexOf(item) === index,
  );
  const uniqueSuggestions = suggestions.filter(
    (item, index) => suggestions.indexOf(item) === index,
  );

  const mistakes = detectPatternMistakes(instructions.slug, workspace);

  return {
    errors,
    warnings: uniqueWarnings,
    suggestions: [...uniqueSuggestions, ...mistakes].filter(
      (item, index, arr) => arr.indexOf(item) === index,
    ),
    canSave: Object.keys(errors).length === 0,
    guidanceMessages: [...uniqueSuggestions, ...mistakes, ...uniqueWarnings].filter(
      (item, index, arr) => arr.indexOf(item) === index,
    ),
  };
}

function applyPatternSpecificRules(
  slug: PatternSlug,
  workspace: Record<string, unknown>,
  result: PatternValidationResult,
): PatternValidationResult {
  if (slug === "decision-ledger") {
    const decision = asTrimmedString(workspace.decision);
    const chosen = asTrimmedString(workspace.chosen);
    const reasoning = asTrimmedString(workspace.reasoning);
    const alternatives = asTrimmedString(workspace.alternatives);

    if (!decision) {
      result.errors.decision = "What decision needed to be made?";
      result.canSave = false;
    }
    if (!chosen) {
      result.errors.chosen = "Which option was chosen?";
      result.canSave = false;
    }
    if (!reasoning) {
      result.errors.reasoning = "Why was this option chosen?";
      result.canSave = false;
    }
    if (reasoning.length > 0 && reasoning.length < 5 && !alternatives) {
      result.warnings.push(
        "Reasoning is sparse. Add context (constraints? trade-offs?) to make the decision clearer.",
      );
    }
  }

  if (slug === "assumption-surface") {
    const assumptions = asTrimmedString(workspace.agents_and_assumptions);
    if (assumptions.length > 0 && assumptions.length < 20) {
      result.warnings.push(
        "Sparse assumptions. Add what each agent believed about constraints, scale, risk, timeline, etc.",
      );
    }
  }

  if (slug === "presence-boundary") {
    const combined = [
      asTrimmedString(workspace.initial_state),
      asTrimmedString(workspace.escalation_triggers),
      asTrimmedString(workspace.information_progression),
    ].join(" ");
    if (combined && !/\b(day|hour|week|month|q[1-4]|phase)\b/i.test(combined)) {
      result.warnings.push(
        "Use time/day markers (Day 1, Hour 4, etc.) to show when agents entered.",
      );
    }
  }

  if (slug === "deferred-detail") {
    const phases = asStringArray(workspace.phases);
    if (phases.length === 1) {
      result.errors.phases =
        "Deferred Detail requires 2+ phases. If single decision, use Decision Ledger.";
      result.canSave = false;
    }
    const combined = [
      asTrimmedString(workspace.overall_goal),
      ...phases,
      asTrimmedString(workspace.handoff_points),
    ].join(" ");
    if (combined && !/\b(q[1-4]|phase|month|week|stage)\b/i.test(combined)) {
      result.warnings.push(
        "Use time markers (Q1, Phase 1, Month 2, etc.) to show sequence clearly.",
      );
    }
  }

  result.guidanceMessages = [
    ...Object.values(result.errors),
    ...result.suggestions,
    ...result.warnings,
  ].filter((item, index, arr) => arr.indexOf(item) === index);
  result.warnings = result.warnings.filter(
    (item, index) => result.warnings.indexOf(item) === index,
  );

  return result;
}

export function validatePatternWorkspace(
  instructions: PatternInstructions,
  workspace: Record<string, unknown>,
): PatternValidationResult {
  if (instructions.slug === "convergence-point") {
    return validateConvergenceWorkspace(workspace);
  }

  const base = validateGenericPattern(instructions, workspace);
  return applyPatternSpecificRules(instructions.slug, workspace, base);
}

export function getGuidanceMessages(
  instructions: PatternInstructions,
  workspace: Record<string, unknown>,
): string[] {
  return validatePatternWorkspace(instructions, workspace).guidanceMessages;
}

export function fieldIsFilledInWorkspace(
  instructions: PatternInstructions,
  workspace: Record<string, unknown>,
  instructionField: string,
): boolean {
  if (isInstructionFieldAnswered(workspace, instructionField)) {
    return true;
  }

  const value = getFieldValue(instructions, workspace, instructionField);
  const fieldDef =
    instructions.requiredFields.find((f) => f.key === instructionField) ??
    instructions.recommendedFields.find((f) => f.key === instructionField);

  if (!fieldDef) {
    return Boolean(asTrimmedString(value)) || asStringArray(value).length > 0;
  }

  if (fieldDef.kind === "array" || instructionField.includes("roster") || instructionField === "phases") {
    const min = fieldDef.minItems ?? (instructionField === "phases" ? 2 : 1);
    return asStringArray(value).length >= min;
  }

  const text = asTrimmedString(value);
  if (!text) return false;
  if (fieldDef.minLength && text.length < fieldDef.minLength) return false;

  if (instructions.slug === "convergence-point" && instructionField === "disagreementDimension") {
    return !isVagueDisagreement(text);
  }

  return true;
}

export function getFieldTip(
  instructions: PatternInstructions,
  instructionField: string,
): string | undefined {
  return (
    instructions.fieldTips[instructionField] ??
    instructions.fieldTips[instructionField.replace(/_/g, "")]
  );
}
