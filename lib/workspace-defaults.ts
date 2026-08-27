export type AgentPosition = {
  agent: string;
  stance: string;
  evidence: string[];
};

export type ConvergencePointItem = {
  label: string;
  checked: boolean;
};

export type StatusUpdate = {
  timestamp: string;
  text: string;
};

export type ConvergencePointWorkspaceState = {
  disagreement: string;
  positions: AgentPosition[];
  convergencePoints: ConvergencePointItem[];
  decision: string;
};

export type DecisionLedgerWorkspaceState = {
  decision: string;
  chosen: string;
  reasoning: string;
  alternatives: string;
  decided_by: string;
  constraints: string;
  trade_offs: string;
  when_decided: string;
  evidenceFiles?: unknown[];
};

export type AssumptionSurfaceWorkspaceState = {
  agents_and_assumptions: string;
  disagreement: string;
  assumption_evidence: string;
  validated_assumptions: string;
  resolution: string;
  learning: string;
  evidenceFiles?: unknown[];
};

export type BackgroundWorkWorkspaceState = {
  workDescription: string;
  startedAt: string;
  targetCompletion: string;
  statusUpdates: StatusUpdate[];
  blockers: string;
};

export type MemoryCommitmentWorkspaceState = {
  recording: string;
  whyItMatters: string;
  verification: string;
  retention: string;
};

export type CredentialBoundaryWorkspaceState = {
  decision: string;
  roles_and_contributions: string;
  capability_gaps: string;
  decision_authority: string;
  if_missing_role: string;
  cascade_effects: string;
  role_conflicts: string;
  evidenceFiles?: unknown[];
};

export type DeferredDetailWorkspaceState = {
  overall_goal: string;
  phases: string[];
  deferred_details: string[];
  handoff_points: string;
  phase_learnings: string;
  constraints_by_phase: string;
  decision_gates: string;
  evidenceFiles?: unknown[];
};

export type PresenceBoundaryWorkspaceState = {
  initial_state: string;
  escalation_triggers: string;
  information_progression: string;
  visibility_gaps: string;
  decision_impact: string;
  final_state: string;
  learning: string;
  evidenceFiles?: unknown[];
};

export type WorkspaceStateBySlug = {
  "convergence-point": ConvergencePointWorkspaceState;
  "decision-ledger": DecisionLedgerWorkspaceState;
  "assumption-surface": AssumptionSurfaceWorkspaceState;
  "background-work-ledger": BackgroundWorkWorkspaceState;
  "memory-commitment-review": MemoryCommitmentWorkspaceState;
  "credential-boundary": CredentialBoundaryWorkspaceState;
  "deferred-detail": DeferredDetailWorkspaceState;
  "presence-boundary": PresenceBoundaryWorkspaceState;
};

const WORKSPACE_KEY = "workspace";

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function tags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,;\n]+/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

/** Map saved instances that still use legacy workspace keys. */
export function normalizeLegacyWorkspace(
  slug: string,
  workspace: Record<string, unknown>,
): Record<string, unknown> {
  switch (slug) {
    case "decision-ledger": {
      const legacy = workspace as Record<string, unknown>;
      if (legacy.chosen !== undefined || legacy.reasoning !== undefined) {
        return workspace;
      }
      return {
        ...workspace,
        decision: str(legacy.decision) || str(legacy.chosen),
        chosen: str(legacy.chosen) || str(legacy.decision),
        reasoning: str(legacy.reasoning) || str(legacy.agentReasoning),
        alternatives: str(legacy.alternatives) || str(legacy.operatorContext),
        decided_by: str(legacy.decided_by),
        constraints: str(legacy.constraints),
        trade_offs: str(legacy.trade_offs),
        when_decided: str(legacy.when_decided),
        evidenceFiles: legacy.evidenceFiles ?? legacy.evidence,
      };
    }
    case "assumption-surface": {
      if (legacyHas(workspace, "agents_and_assumptions")) return workspace;
      return {
        ...workspace,
        agents_and_assumptions:
          str(workspace.agents_and_assumptions) || str(workspace.assumption),
        disagreement: str(workspace.disagreement) || str(workspace.ifWrong),
        assumption_evidence:
          str(workspace.assumption_evidence) || str(workspace.whyWeBelieve),
        validated_assumptions:
          str(workspace.validated_assumptions) ||
          (workspace.result ? String(workspace.result) : ""),
        resolution: str(workspace.resolution) || str(workspace.howToTest),
        learning: str(workspace.learning) || str(workspace.testStatus),
      };
    }
    case "credential-boundary": {
      if (legacyHas(workspace, "roles_and_contributions")) return workspace;
      return {
        ...workspace,
        decision: str(workspace.decision) || str(workspace.outcome),
        roles_and_contributions:
          str(workspace.roles_and_contributions) || str(workspace.scopeA),
        capability_gaps:
          str(workspace.capability_gaps) || str(workspace.boundaryNote),
        decision_authority:
          str(workspace.decision_authority) || str(workspace.scopeB),
        if_missing_role: str(workspace.if_missing_role),
      };
    }
    case "presence-boundary": {
      if (legacyHas(workspace, "initial_state")) return workspace;
      return {
        ...workspace,
        initial_state: str(workspace.initial_state) || str(workspace.watching),
        escalation_triggers:
          str(workspace.escalation_triggers) || str(workspace.operatorAction),
        information_progression:
          str(workspace.information_progression) || str(workspace.canActOn),
        visibility_gaps:
          str(workspace.visibility_gaps) || str(workspace.agentState),
      };
    }
    case "deferred-detail": {
      if (legacyHas(workspace, "overall_goal")) return workspace;
      return {
        ...workspace,
        overall_goal: str(workspace.overall_goal) || str(workspace.summary),
        phases: tags(workspace.phases).length
          ? tags(workspace.phases)
          : tags(workspace.agentRoster),
        deferred_details: tags(workspace.deferred_details).length
          ? tags(workspace.deferred_details)
          : tags(workspace.deferredFields),
        handoff_points:
          str(workspace.handoff_points) || str(workspace.revealWhen),
        phase_learnings:
          str(workspace.phase_learnings) || str(workspace.currentDetail),
      };
    }
    default:
      return workspace;
  }
}

function legacyHas(workspace: Record<string, unknown>, key: string): boolean {
  const value = workspace[key];
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some((item) => String(item).trim());
  return true;
}

export function mergeWorkspaceForSlug(
  slug: string,
  workspace: Record<string, unknown>,
): Record<string, unknown> {
  const defaults = defaultWorkspaceForSlug(slug);
  const normalized = normalizeLegacyWorkspace(slug, workspace);
  return { ...defaults, ...normalized };
}

export function getWorkspaceState<T extends Record<string, unknown>>(
  state: Record<string, unknown>,
  defaults: T,
  slug?: string,
): T {
  const raw = state[WORKSPACE_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return defaults;
  }

  const merged = { ...defaults, ...(raw as T) };
  if (slug) {
    return normalizeLegacyWorkspace(slug, merged) as T;
  }
  return merged;
}

export function workspacePatch<T extends Record<string, unknown>>(
  draft: T,
): Record<string, unknown> {
  return { workspace: draft };
}

export const DEFAULT_CONVERGENCE: ConvergencePointWorkspaceState = {
  disagreement: "",
  positions: [
    { agent: "Prometheus", stance: "", evidence: [""] },
    { agent: "Themis", stance: "", evidence: [""] },
  ],
  convergencePoints: [
    { label: "Both use observability", checked: false },
    { label: "Logging + tracing together", checked: false },
    { label: "Decision: Hybrid approach", checked: false },
  ],
  decision: "",
};

export const DEFAULT_DECISION_LEDGER: DecisionLedgerWorkspaceState = {
  decision: "",
  chosen: "",
  reasoning: "",
  alternatives: "",
  decided_by: "",
  constraints: "",
  trade_offs: "",
  when_decided: "",
};

export const DEFAULT_ASSUMPTION: AssumptionSurfaceWorkspaceState = {
  agents_and_assumptions: "",
  disagreement: "",
  assumption_evidence: "",
  validated_assumptions: "",
  resolution: "",
  learning: "",
};

export const DEFAULT_BACKGROUND_WORK: BackgroundWorkWorkspaceState = {
  workDescription: "",
  startedAt: "",
  targetCompletion: "",
  statusUpdates: [],
  blockers: "",
};

export const DEFAULT_MEMORY_COMMITMENT: MemoryCommitmentWorkspaceState = {
  recording: "",
  whyItMatters: "",
  verification: "",
  retention: "1 year",
};

export const DEFAULT_CREDENTIAL_BOUNDARY: CredentialBoundaryWorkspaceState = {
  decision: "",
  roles_and_contributions: "",
  capability_gaps: "",
  decision_authority: "",
  if_missing_role: "",
  cascade_effects: "",
  role_conflicts: "",
};

export const DEFAULT_DEFERRED_DETAIL: DeferredDetailWorkspaceState = {
  overall_goal: "",
  phases: [],
  deferred_details: [],
  handoff_points: "",
  phase_learnings: "",
  constraints_by_phase: "",
  decision_gates: "",
};

export const DEFAULT_PRESENCE_BOUNDARY: PresenceBoundaryWorkspaceState = {
  initial_state: "",
  escalation_triggers: "",
  information_progression: "",
  visibility_gaps: "",
  decision_impact: "",
  final_state: "",
  learning: "",
};

export function defaultWorkspaceForSlug(slug: string): Record<string, unknown> {
  switch (slug) {
    case "convergence-point":
      return DEFAULT_CONVERGENCE;
    case "decision-ledger":
      return DEFAULT_DECISION_LEDGER;
    case "assumption-surface":
      return DEFAULT_ASSUMPTION;
    case "background-work-ledger":
      return DEFAULT_BACKGROUND_WORK;
    case "memory-commitment-review":
      return DEFAULT_MEMORY_COMMITMENT;
    case "credential-boundary":
      return DEFAULT_CREDENTIAL_BOUNDARY;
    case "deferred-detail":
      return DEFAULT_DEFERRED_DETAIL;
    case "presence-boundary":
      return DEFAULT_PRESENCE_BOUNDARY;
    default:
      return { notes: "" };
  }
}
