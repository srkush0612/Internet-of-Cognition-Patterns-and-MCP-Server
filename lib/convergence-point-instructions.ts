/** Structured guidance from pattern-instructions-convergence-point.md */

export type ConvergenceFieldKey =
  | "agentRoster"
  | "disagreementDimension"
  | "resolutionMechanism"
  | "outcome"
  | "timeline"
  | "evidence";

export type ExtractionQuestion = {
  field: ConvergenceFieldKey;
  question: string;
  optional?: boolean;
};

export const CONVERGENCE_REQUIRED_FIELDS: ConvergenceFieldKey[] = [
  "agentRoster",
  "disagreementDimension",
];

export const CONVERGENCE_RECOMMENDED_FIELDS: ConvergenceFieldKey[] = [
  "resolutionMechanism",
  "outcome",
];

export const CONVERGENCE_ERROR_MESSAGES = {
  agentRoster_empty: "Add at least 2 agents to show disagreement",
  agentRoster_tooFew: "Minimum 2 agents required for conflict visualization",
  disagreementDimension_empty:
    "What are they disagreeing on? (e.g., 'Policy wants X. Legal wants Y.')",
  disagreementDimension_tooVague:
    "Be specific: tell me what each agent wanted, not just that they disagreed",
} as const;

export const CONVERGENCE_WARNING_MESSAGES = {
  resolutionMechanism_empty:
    "💡 Add how it was resolved (who decided? authority, voting, compromise?) for richer visualization",
  outcome_empty: "💡 Final outcome adds closure to the narrative (what was actually chosen?)",
  agentCount_high:
    "💡 You have 5+ agents. Timeline works for 2–4. Try Conflict Network or Decision Tree for better visualization of this complexity.",
} as const;

export const CONVERGENCE_FIELD_TIPS: Record<
  "agents" | "disagreement" | "resolution" | "outcome",
  string
> = {
  agents:
    "Add 2+ agent names. Timeline works best with 2–4 agents. With 5+, try Conflict Network or Decision Tree views.",
  disagreement:
    "Be specific about positions. ✓ Good: 'Policy wanted X. Legal wanted Y.' ❌ Avoid: 'We disagreed'",
  resolution:
    "How was it decided? By authority (who?), voting, compromise, consensus, or escalation? Include the reasoning.",
  outcome:
    "What was actually chosen? Not just 'approved' but the specific decision or action taken.",
};

export const CONVERGENCE_EXTRACTION_QUESTIONS: ExtractionQuestion[] = [
  {
    field: "agentRoster",
    question:
      "How many agents are involved? (Need at least 2 for conflict visualization — e.g., policy, legal, compliance)",
  },
  {
    field: "disagreementDimension",
    question:
      "What did they disagree on? Be specific: '[Agent A] wanted X. [Agent B] wanted Y.'",
  },
  {
    field: "resolutionMechanism",
    question:
      "How was it resolved? Who decided? (Authority, voting, compromise, consensus, or escalation)",
  },
  {
    field: "outcome",
    question:
      "What was the final outcome? Be specific — not 'approved' but what was actually done.",
  },
];

export const CONVERGENCE_RECOMMENDATION_COPY = {
  subtitle: "Recommended based on your scenario",
  researchLabel: "Research shows this is needed when:",
  researchQuote:
    "Users need to see convergence mechanics: what was adopted, what was flagged as impasse, and why.",
  defaultReasons: [
    "You have multiple agents with different positions",
    "Clear disagreement detected",
    "Shows how conflict was resolved (not just what was decided)",
  ],
};

export const CONVERGENCE_MISTAKE_SUGGESTIONS = {
  disagreementMissing:
    "Convergence Point shows how disagreement was resolved. What did each agent want? For example: 'Team A wanted rollout. Team B feared downtime. Team C wanted gates.'",
  resolutionHidden:
    "How was it decided? Who had the final say? (Authority: who decided? Voting? Compromise? Consensus?)",
  outcomeVague:
    "What does that actually mean in practice? Be specific: 'No rollout until GDPR audit' or 'Staged rollout with legal review before each phase'.",
  tooManyAgents:
    "You have 5+ agents! Timeline can get crowded. Try Conflict Network (who disagrees with whom) or Decision Tree (how branches narrow to resolution).",
  wrongPattern:
    "This sounds like collaboration without disagreement. Convergence Point is for conflicts that needed resolution. Try Credential Boundary or Deferred Detail instead — or tell me what each side wanted.",
} as const;

export const CONVERGENCE_AGENT_THRESHOLD = 5;
