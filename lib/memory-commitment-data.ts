export type CommitAgent = "FINANCE" | "CUSTOMER SUCCESS" | "SALESFORCE" | "DIRECTOR";

export type CommitChoice = "acknowledge" | "restore" | "revoke";

export type BeliefWeight = "stale" | "evidence" | "operative";

export type StandaloneBelief = {
  id: string;
  agent: CommitAgent;
  weight: BeliefWeight;
  text: string;
};

export type CommitBelief = {
  id: string;
  agent: CommitAgent;
  text: string;
  stale?: boolean;
};

export const STANDALONE_SCENARIO = {
  title: "Pricing negotiation · mid-size customer",
  shiftNote:
    "12% baseline displaced by Customer Success's validated book-wide correlation",
};

export const STANDALONE_BELIEFS: StandaloneBelief[] = [
  {
    id: "baseline-stale",
    agent: "FINANCE",
    weight: "stale",
    text: "Baseline churn = 12% from recent renewals → justifies 8% off",
  },
  {
    id: "correlation-evidence",
    agent: "CUSTOMER SUCCESS",
    weight: "evidence",
    text: "3.4× churn correlation validated across 1,200 accounts",
  },
  {
    id: "churn-operative",
    agent: "FINANCE",
    weight: "operative",
    text: "41% churn probability → 20% discount justified off full book evidence",
  },
];

export const COMMIT_BELIEFS: CommitBelief[] = [
  {
    id: "churn-correlation",
    agent: "CUSTOMER SUCCESS",
    text: "3.4× churn correlation validated across 1,200 accounts",
  },
  {
    id: "expansion-exposure",
    agent: "SALESFORCE",
    text: "$150K expansion tied to this renewal contract",
  },
  {
    id: "margin-math",
    agent: "FINANCE",
    text: "41% churn probability → 20% discount justified",
  },
  {
    id: "baseline-superseded",
    agent: "FINANCE",
    text: "12% baseline from recent renewals (superseded)",
    stale: true,
  },
];

export const COMMIT_CHOICE_LABEL: Record<CommitChoice, string> = {
  acknowledge: "Acknowledge",
  restore: "Restore",
  revoke: "Revoke",
};

export const COMMIT_CHOICE_LOG: Record<CommitChoice, string> = {
  acknowledge: "Kept in long-term memory",
  restore: "Prior belief restored to record",
  revoke: "Excluded from long-term memory",
};
