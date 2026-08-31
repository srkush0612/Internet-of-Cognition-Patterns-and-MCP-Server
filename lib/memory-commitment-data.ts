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

export type BeliefDecision = "committed" | "rejected" | "pending";

export type BeliefScope = "Personal" | "Project" | "Team";

export type BeliefKeep = "Permanent" | "Expires 30d" | "Session";

export type Belief = {
  id: string;
  statement: string;
  confidence: "High" | "Medium" | "Low";
  source: string;
  timestamp?: string;
  context?: string;
  sourceNote?: string;
  quote?: string;
  scope?: BeliefScope;
  keep?: BeliefKeep;
  decision?: BeliefDecision;
  flag?: "Possible conflict" | "Sensitive";
};

export const MOCK_BELIEFS: Belief[] = [
  {
    id: "1",
    statement: "New services deploy to the us-east-1 EKS cluster by default.",
    confidence: "High",
    source: "#platform-eng",
    context: "Deploy review",
    timestamp: "2h ago",
    quote:
      "...standardizing all new service deploys on the us-east-1 EKS cluster.",
    scope: "Team",
    keep: "Permanent",
    decision: "pending",
  },
  {
    id: "2",
    statement: "Marc schedules network maintenance windows after 10pm ET.",
    confidence: "Medium",
    source: "Change requests",
    context: "pattern over 8 weeks",
    quote:
      "Inferred from 5 change requests, all with windows starting 10pm–1am ET.",
    scope: "Personal",
    keep: "Permanent",
    decision: "pending",
  },
  {
    id: "3",
    statement:
      "NorthBank's site-to-site VPN rotates its pre-shared key every 30 days.",
    confidence: "High",
    source: "Customer onboarding runbook",
    timestamp: "Yesterday",
    quote:
      "...rotate the site-to-site VPN pre-shared key every 30 days as part of onboarding.",
    scope: "Team",
    keep: "Permanent",
    decision: "pending",
  },
  {
    id: "4",
    statement: "The Q3 core-router firmware target is IOS-XE 17.9.2.",
    confidence: "Medium",
    source: "Network upgrade plan",
    sourceNote: "a newer revision may supersede this",
    quote: "...upgrade edge routers to IOS-XE 17.9.2 this quarter.",
    scope: "Project",
    keep: "Expires 30d",
    decision: "pending",
    flag: "Possible conflict",
  },
];

export const PLATFORM_RUNBOOK_HIGHLIGHTS = ["1", "4"] as const;
