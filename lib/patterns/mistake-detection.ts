import type { PatternSlug } from "./types";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function arr(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return text(value)
    ? text(value)
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

/** Detect common mistakes and return auto-correction guidance messages */
export function detectPatternMistakes(
  slug: PatternSlug,
  workspace: Record<string, unknown>,
): string[] {
  switch (slug) {
    case "decision-ledger":
      return detectDecisionLedgerMistakes(workspace);
    case "assumption-surface":
      return detectAssumptionSurfaceMistakes(workspace);
    case "credential-boundary":
      return detectCredentialBoundaryMistakes(workspace);
    case "presence-boundary":
      return detectPresenceBoundaryMistakes(workspace);
    case "deferred-detail":
      return detectDeferredDetailMistakes(workspace);
    case "convergence-point":
      return [];
    default:
      return [];
  }
}

function detectDecisionLedgerMistakes(workspace: Record<string, unknown>): string[] {
  const suggestions: string[] = [];
  const decision = text(workspace.decision);
  const chosen = text(workspace.chosen);
  const reasoning = text(workspace.reasoning);
  const alternatives = text(workspace.alternatives);
  const combined = `${decision} ${chosen} ${alternatives} ${reasoning}`.toLowerCase();

  if (
    /\b(disagree|disagreement|conflict|vs\.|versus|debate|opposed|3 agents|three agents|multiple agents)\b/.test(
      combined,
    )
  ) {
    suggestions.push(
      "This sounds like multiple agents disagreed and then converged. That's Convergence Point (shows HOW conflict was resolved). Decision Ledger is for single decisions without conflict.",
    );
  }

  if ((chosen || decision) && !reasoning) {
    suggestions.push(
      "Why was that the best choice? What made it win over alternatives? (Cost? Team expertise? Constraints?)",
    );
  }

  if (reasoning.length > 0 && reasoning.length < 15) {
    suggestions.push(
      "Reasoning is sparse. Add context — constraints, trade-offs, or evidence that made this option win.",
    );
  }

  if ((chosen || decision) && !alternatives && !/\b(or|vs|versus|alternative|option)\b/i.test(chosen || decision)) {
    suggestions.push(
      "What other options were considered? Decision Ledger works best when you had real alternatives.",
    );
  }

  return suggestions;
}

function detectAssumptionSurfaceMistakes(workspace: Record<string, unknown>): string[] {
  const suggestions: string[] = [];
  const assumptions = text(workspace.agents_and_assumptions);
  const disagreement = text(workspace.disagreement);

  if (assumptions && assumptions.length < 25) {
    suggestions.push(
      "Add what each agent assumed about the world — constraints, scale, risk, timeline. Example: 'Team A assumed load stays low. Team B assumed 10x growth.'",
    );
  }

  if (assumptions && !disagreement) {
    suggestions.push(
      "What positions resulted from these different assumptions? Link beliefs to conflicting views.",
    );
  }

  if (
    assumptions &&
    !/\b(assumed|believed|thought|expected|forecast)\b/i.test(assumptions)
  ) {
    suggestions.push(
      "Frame each agent's belief explicitly: '[Agent] assumed [belief] because [reason].'",
    );
  }

  return suggestions;
}

function detectCredentialBoundaryMistakes(workspace: Record<string, unknown>): string[] {
  const suggestions: string[] = [];
  const roles = text(workspace.roles_and_contributions);
  const authority = text(workspace.decision_authority);
  const gaps = text(workspace.capability_gaps);

  if (roles && !authority && !gaps) {
    suggestions.push(
      "Why wasn't one role enough? Credential Boundary shows why multiple roles were necessary.",
    );
  }

  if (roles && authority && !gaps) {
    suggestions.push(
      "Why wasn't one role enough? Name the capability gaps that required multiple perspectives.",
    );
  }

  if (roles && /\b(everyone|all teams|multiple teams)\b/i.test(roles) && roles.length < 40) {
    suggestions.push(
      "Be specific about each role's contribution — what knowledge or authority did each bring?",
    );
  }

  return suggestions;
}

function detectPresenceBoundaryMistakes(workspace: Record<string, unknown>): string[] {
  const suggestions: string[] = [];
  const initial = text(workspace.initial_state);
  const escalation = text(workspace.escalation_triggers);
  const combined = `${initial} ${escalation} ${text(workspace.information_progression)}`;

  if (combined && !/\b(day|hour|week|month|q[1-4]|phase|am|pm|\d{1,2}:\d{2})\b/i.test(combined)) {
    suggestions.push(
      "Add time markers (Day 1, Hour 4, etc.) to show when each agent entered and learned new information.",
    );
  }

  if (initial && !escalation) {
    suggestions.push(
      "What events brought other agents in? Presence Boundary tracks escalation as information surfaced.",
    );
  }

  return suggestions;
}

function detectDeferredDetailMistakes(workspace: Record<string, unknown>): string[] {
  const suggestions: string[] = [];
  const phases = arr(workspace.phases);
  const deferred = workspace.deferred_details;
  const deferredCount = Array.isArray(deferred) ? deferred.length : 0;

  if (phases.length === 1) {
    suggestions.push(
      "Deferred Detail needs 2+ phases. If this is a single decision, try Decision Ledger instead.",
    );
  }

  if (phases.length >= 2 && deferredCount === 0) {
    suggestions.push(
      "What wasn't decided at each phase? Deferred Detail shows why detail was postponed until later.",
    );
  }

  const combined = `${text(workspace.overall_goal)} ${phases.join(" ")}`;
  if (combined && !/\b(q[1-4]|phase|month|week|stage|step)\b/i.test(combined)) {
    suggestions.push(
      "Use sequence markers (Q1, Phase 1, Month 2) so the timeline reads clearly.",
    );
  }

  return suggestions;
}
