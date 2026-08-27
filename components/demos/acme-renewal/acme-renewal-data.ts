export const INTENT_MET = {
  headline:
    "Acme discount finalized at 20%, evidence-grounded and within governance.",
  bullets: [
    "Grounded in evidence, not a guess",
    "Protect margin target while keeping the deal",
    "Director approved at the gate",
    "CRM and forecast updated",
  ],
  convergence: 100,
};

export const SHARED_REASONING = [
  {
    agent: "Customer Success",
    tone: "cs" as const,
    text: "Validated churn correlation: 3.4× baseline",
  },
  {
    agent: "Salesforce",
    tone: "sf" as const,
    text: "$150K expansion tied to this contract",
  },
  {
    agent: "Finance",
    tone: "fin" as const,
    text: "Recomputed: 41% churn → 20% justified",
  },
  {
    agent: "Finance",
    tone: "fin" as const,
    text: "Gate: exceeds 15% self-approval ceiling",
  },
  {
    agent: "Director",
    tone: "dir" as const,
    text: "Approved at the gate",
  },
];

export const COGNITION_ENGINES = ["Semantic", "Cost"];
export const GUARDRAILS = ["Policy", "Risk"];

export const BEATS = [
  { id: 1, label: "Human Kickoff" },
  { id: 2, label: "Mission Triggered" },
  { id: 3, label: "Positions Forming" },
  { id: 4, label: "Estimate Disputed" },
  { id: 5, label: "Shared Evidence" },
  { id: 6, label: "Approval Gate" },
  { id: 7, label: "Emergent Outcome" },
];

export const ACTIVE_BEAT = 7;

export type ChatAgentTone = "fin" | "sf";

export type ChatMessage =
  | {
      id: string;
      kind: "agent";
      initials: string;
      tone: ChatAgentTone;
      author: string;
      badge: string;
      time: string;
      text: string;
      tag: string;
      tagChecked?: boolean;
      tagDoubleChecked?: boolean;
      confidence: number;
      risk?: "med";
      why?: boolean;
      buildsOn?: string;
      routeNote?: string;
    }
  | {
      id: string;
      kind: "gate";
      initials: string;
      tone: ChatAgentTone;
      author: string;
      badge: string;
      time: string;
      text: string;
      tag: string;
      tagChecked?: boolean;
      confidence: number;
      actions: string[];
    }
  | {
      id: string;
      kind: "system";
      text: string;
    };

export const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "fin-assess",
    kind: "agent",
    initials: "FIN",
    tone: "fin",
    author: "Finance Agent",
    badge: "Assess margin",
    time: "10:10",
    text: "Recomputing off your multiplier, not the sample: 12% baseline × 3.4 = 41% churn probability. Expected loss = 41% of ($400K + $150K) ≈ $225K. That justifies a bigger number than I've offered: 20%, not 15%.",
    tag: "discount: 20%",
    tagChecked: true,
    confidence: 88,
    risk: "med",
    why: true,
    buildsOn: "builds on Customer Success's validated correlation",
    routeNote:
      "20% exceeds Finance's self-approval ceiling, so it's routed to the Director for sign-off.",
  },
  {
    id: "fin-gate",
    kind: "gate",
    initials: "FIN",
    tone: "fin",
    author: "Finance Agent",
    badge: "Human approval gate",
    time: "10:11",
    text: "20% is above my own 15% ceiling, so this needs your sign-off. The case is solid: a validated multiplier, not a guess, plus real expansion exposure. Over to you, Priya.",
    tag: "gate: awaiting Director",
    tagChecked: true,
    confidence: 88,
    actions: ["Approve discount", "Hold", "Ask a question"],
  },
  {
    id: "system-approved",
    kind: "system",
    text: "Approved 20% discount applied · Salesforce record updated · renewal closing today · learning saved to Cognitive Fabric",
  },
  {
    id: "sf-analyze",
    kind: "agent",
    initials: "SF",
    tone: "sf",
    author: "Salesforce Agent",
    badge: "Analyze",
    time: "10:12",
    text: "Done, Jordan. 20% applied to the renewal. Acme's contract updated, expected to close today. Full reasoning trail attached to the opportunity record.",
    tag: "discount applied",
    tagDoubleChecked: true,
    confidence: 93,
    why: true,
  },
];
