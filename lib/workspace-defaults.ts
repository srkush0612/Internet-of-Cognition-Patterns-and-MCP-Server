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
  agentReasoning: string;
  operatorContext: string;
  backingStrength: string;
  evidence: string[];
};

export type AssumptionSurfaceWorkspaceState = {
  assumption: string;
  whyWeBelieve: string;
  ifWrong: string;
  howToTest: string;
  testStatus: string;
  result: "confirmed" | "refuted" | "tbd";
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
  scopeA: string;
  scopeB: string;
  boundaryNote: string;
  outcome: string;
};

export type DeferredDetailWorkspaceState = {
  summary: string;
  deferredFields: string[];
  revealWhen: string;
  currentDetail: string;
};

export type PresenceBoundaryWorkspaceState = {
  agentState: string;
  watching: string;
  canActOn: string;
  operatorAction: string;
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

export function getWorkspaceState<T extends Record<string, unknown>>(
  state: Record<string, unknown>,
  defaults: T,
): T {
  const raw = state[WORKSPACE_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return defaults;
  }

  return { ...defaults, ...(raw as T) };
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
  agentReasoning: "",
  operatorContext: "",
  backingStrength: "Moderate",
  evidence: [],
};

export const DEFAULT_ASSUMPTION: AssumptionSurfaceWorkspaceState = {
  assumption: "",
  whyWeBelieve: "",
  ifWrong: "",
  howToTest: "",
  testStatus: "Not started",
  result: "tbd",
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
  scopeA: "",
  scopeB: "",
  boundaryNote: "",
  outcome: "",
};

export const DEFAULT_DEFERRED_DETAIL: DeferredDetailWorkspaceState = {
  summary: "",
  deferredFields: [""],
  revealWhen: "",
  currentDetail: "",
};

export const DEFAULT_PRESENCE_BOUNDARY: PresenceBoundaryWorkspaceState = {
  agentState: "observing",
  watching: "",
  canActOn: "",
  operatorAction: "",
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
