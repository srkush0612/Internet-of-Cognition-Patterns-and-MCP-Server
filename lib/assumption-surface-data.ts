export type ContextItem = {
  id: string;
  label: string;
  source: string;
};

export type AssumptionBasis =
  | { kind: "derived"; contextId: string; contextLabel: string }
  | { kind: "unfounded" };

export type AssumptionSeed = {
  id: string;
  claim: string;
  basis: AssumptionBasis;
};

export type AgentBranch = {
  id: string;
  agentName: string;
  contextOnly: ContextItem[];
  assumptions: AssumptionSeed[];
  interpretation: {
    conclusion: string;
    restsOnLabel: string;
  };
};

export type AgentBranchHue = {
  /** Full-strength line (no :root token; matches ConvergenceTimeline Prometheus / Themis). */
  line: string;
  /** Soft fill (no :root token). */
  soft: string;
  /** Mid-weight border tint (no :root token). */
  border: string;
};

/** Per-branch trace hues: cool indigo and cool teal, equal weight. Component-local, not :root. */
export const AGENT_BRANCH_HUES: Record<string, AgentBranchHue> = {
  refund: {
    line: "#5B57E0",
    soft: "#EEEDFC",
    border: "#C5C3F0",
  },
  subscriptions: {
    line: "#1F9E86",
    soft: "#E8F6F3",
    border: "#9FD4C8",
  },
};

export const CASE_ID = "BIL-7734";

export const HEADER_LINE =
  "Two agents read the same account and reached opposite conclusions.";

export const SHARED_CONTEXT: ContextItem[] = [
  { id: "ctx-account", label: "Account record", source: "accounts service" },
  { id: "ctx-dispute", label: "Dispute BIL-7734", source: "disputes service" },
  { id: "ctx-charges", label: "Charge history", source: "payments ledger" },
  { id: "ctx-card", label: "Card on file 4412", source: "payments ledger" },
];

export const AGENT_BRANCHES: AgentBranch[] = [
  {
    id: "refund",
    agentName: "Refund agent",
    contextOnly: [
      { id: "ctx-message", label: "Customer message", source: "support inbox" },
      { id: "ctx-thread", label: "Thread history", source: "support inbox" },
    ],
    assumptions: [
      {
        id: "refund-a1",
        claim: "The dispute covers the charge named in the customer message.",
        basis: {
          kind: "derived",
          contextId: "ctx-message",
          contextLabel: "Customer message",
        },
      },
      {
        id: "refund-a2",
        claim: "One disputed charge means one refund.",
        basis: { kind: "unfounded" },
      },
    ],
    interpretation: {
      conclusion: "Refund the charge from 14 July and close the case.",
      restsOnLabel: "Rests on both assumptions above",
    },
  },
  {
    id: "subscriptions",
    agentName: "Subscriptions agent",
    contextOnly: [
      {
        id: "ctx-plan-log",
        label: "Plan change log",
        source: "subscriptions service",
      },
      {
        id: "ctx-renewal",
        label: "Renewal schedule",
        source: "subscriptions service",
      },
    ],
    assumptions: [
      {
        id: "subs-a1",
        claim: "The renewal charged the card on file.",
        basis: {
          kind: "derived",
          contextId: "ctx-card",
          contextLabel: "Card on file 4412",
        },
      },
      {
        id: "subs-a2",
        claim: "The customer disputes the renewal, not the original charge.",
        basis: { kind: "unfounded" },
      },
    ],
    interpretation: {
      conclusion: "Refund the renewal from 2 August and leave the original charge open.",
      restsOnLabel: "Rests on both assumptions above",
    },
  },
];

export const FOOTER_LINE =
  "Correcting an assumption does not settle the case. Adoption happens at Convergence Point.";

export function basisLine(basis: AssumptionBasis): string {
  if (basis.kind === "derived") {
    return `From ${basis.contextLabel}`;
  }
  return "No basis in context";
}

export function basisContextId(basis: AssumptionBasis): string | null {
  return basis.kind === "derived" ? basis.contextId : null;
}
