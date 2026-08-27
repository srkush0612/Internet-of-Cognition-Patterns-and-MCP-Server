import type { PatternSlug } from "./types";

/** Maps instruction field keys → workspace parameter keys in the live app */
export const WORKSPACE_FIELD_MAPS: Record<PatternSlug, Record<string, string>> = {
  "convergence-point": {
    agentRoster: "agentRoster",
    disagreementDimension: "disagreement",
    resolutionMechanism: "resolutionMechanism",
    outcome: "decision",
    timeline: "timeline",
    evidence: "evidenceFiles",
  },
  "decision-ledger": {
    decision: "decision",
    chosen: "chosen",
    reasoning: "reasoning",
    alternatives: "alternatives",
    decided_by: "decided_by",
    constraints: "constraints",
    trade_offs: "trade_offs",
    when_decided: "when_decided",
  },
  "assumption-surface": {
    agents_and_assumptions: "agents_and_assumptions",
    disagreement: "disagreement",
    assumption_evidence: "assumption_evidence",
    validated_assumptions: "validated_assumptions",
    resolution: "resolution",
    learning: "learning",
  },
  "credential-boundary": {
    decision: "decision",
    roles_and_contributions: "roles_and_contributions",
    capability_gaps: "capability_gaps",
    decision_authority: "decision_authority",
    if_missing_role: "if_missing_role",
    cascade_effects: "cascade_effects",
    role_conflicts: "role_conflicts",
  },
  "presence-boundary": {
    initial_state: "initial_state",
    escalation_triggers: "escalation_triggers",
    information_progression: "information_progression",
    visibility_gaps: "visibility_gaps",
    decision_impact: "decision_impact",
    final_state: "final_state",
    learning: "learning",
  },
  "deferred-detail": {
    overall_goal: "overall_goal",
    phases: "phases",
    deferred_details: "deferred_details",
    handoff_points: "handoff_points",
    phase_learnings: "phase_learnings",
    constraints_by_phase: "constraints_by_phase",
    decision_gates: "decision_gates",
  },
};

/** Hand-authored supplements when markdown parsing misses structured blocks */
export const INSTRUCTION_SUPPLEMENTS: Partial<
  Record<
    PatternSlug,
    {
      extractionQuestions?: Array<{
        field: string;
        question: string;
        optional?: boolean;
      }>;
      errorMessages?: Record<string, string>;
      warningMessages?: Record<string, string>;
      fieldTips?: Record<string, string>;
      mistakeSuggestions?: Record<string, string>;
      recommendation?: {
        researchQuote: string;
        defaultReasons: string[];
      };
    }
  >
> = {
  "convergence-point": {
    extractionQuestions: [
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
    ],
    fieldTips: {
      agentRoster:
        "Add 2+ agent names. Timeline works best with 2–4 agents. With 5+, try Conflict Network or Decision Tree views.",
      disagreementDimension:
        "Be specific about positions. ✓ Good: 'Policy wanted X. Legal wanted Y.' ❌ Avoid: 'We disagreed'",
      resolutionMechanism:
        "How was it decided? By authority (who?), voting, compromise, consensus, or escalation? Include the reasoning.",
      outcome:
        "What was actually chosen? Not just 'approved' but the specific decision or action taken.",
    },
    mistakeSuggestions: {
      disagreement_missing:
        "Convergence Point shows how disagreement was resolved. What did each agent want?",
      resolution_hidden:
        "How was it decided? Who had the final say? (Authority: who decided? Voting? Compromise? Consensus?)",
      outcome_vague:
        "What does that actually mean in practice? Be specific: 'No rollout until GDPR audit'.",
      too_many_agents:
        "You have 5+ agents! Timeline can get crowded. Try Conflict Network or Decision Tree.",
      wrong_pattern:
        "This sounds like collaboration without disagreement. Try Credential Boundary or Deferred Detail instead.",
    },
    recommendation: {
      researchQuote:
        "Users need to see convergence mechanics: what was adopted, what was flagged as impasse, and why.",
      defaultReasons: [
        "You have multiple agents with different positions",
        "Clear disagreement detected",
        "Shows how conflict was resolved (not just what was decided)",
      ],
    },
  },
  "decision-ledger": {
    extractionQuestions: [
      { field: "decision", question: "What decision needed to be made?" },
      {
        field: "alternatives",
        question: "What options were you considering?",
        optional: true,
      },
      { field: "chosen", question: "Which option did you choose?" },
      { field: "reasoning", question: "Why was that the best choice?" },
      { field: "decided_by", question: "Who made this decision?", optional: true },
    ],
    errorMessages: {
      decision: "What decision needed to be made?",
      chosen: "Which option was chosen?",
      reasoning: "Why was this option chosen?",
    },
    fieldTips: {
      decision: "What choice needed to happen? Not the outcome — the decision itself. E.g. 'Choose deployment timing'.",
      chosen: "The specific option that was actually selected.",
      reasoning:
        "Why did this option win? Include constraints, trade-offs, or evidence — not just 'we picked it'.",
      alternatives:
        "Name 2+ options you considered. This shows it was a real decision with alternatives.",
      decided_by: "Who had authority or consensus to decide?",
      constraints: "Limits that narrowed the options (time, budget, policy, capacity).",
    },
    warningMessages: {
      alternatives: "What other options were considered?",
      decided_by: "Who made this decision?",
      constraints: "What constraints shaped this choice?",
    },
    recommendation: {
      researchQuote:
        "We need to capture reasoning behind decisions. Six months later, someone asks why we chose X and we've lost the context.",
      defaultReasons: [
        "Single decision documented with reasoning",
        "Clear choice made (not disagreement)",
        "Preserves WHY it was chosen, not just what",
      ],
    },
  },
  "assumption-surface": {
    extractionQuestions: [
      {
        field: "agents_and_assumptions",
        question: "What did each agent assume about the situation?",
      },
      {
        field: "assumption_evidence",
        question: "What different beliefs drove their positions?",
        optional: true,
      },
      {
        field: "disagreement",
        question: "What positions did those different assumptions create?",
      },
    ],
    errorMessages: {
      agents_and_assumptions: "What did each agent assume?",
      disagreement: "What positions did those assumptions create?",
    },
    fieldTips: {
      agents_and_assumptions:
        "What did each agent believe about the world? E.g. 'Logs team assumed low volume. Code team assumed 10x growth.'",
      disagreement:
        "What conflicting positions did those assumptions create? Link beliefs to opposing views.",
      assumption_evidence: "What made each team believe their assumption?",
      validated_assumptions: "Which assumptions turned out correct or incorrect?",
    },
    warningMessages: {
      assumption_evidence: "What evidence backed each assumption?",
      validated_assumptions: "Were assumptions later validated or proved wrong?",
    },
    recommendation: {
      researchQuote:
        "Disagreements often aren't about the decision itself—they're about different beliefs about the world.",
      defaultReasons: [
        "Disagreement stems from different beliefs/assumptions",
        "Shows ROOT CAUSE (not just positions)",
        "Reveals hidden logic behind conflicting views",
      ],
    },
  },
  "credential-boundary": {
    extractionQuestions: [
      { field: "decision", question: "What was the decision?" },
      {
        field: "roles_and_contributions",
        question: "Which roles were involved and why?",
      },
      {
        field: "capability_gaps",
        question: "What capability gaps meant you needed all these roles?",
      },
    ],
    errorMessages: {
      decision: "What decision required multiple roles?",
      roles_and_contributions: "What did each role contribute?",
      capability_gaps: "Why wasn't one role enough?",
    },
    fieldTips: {
      decision: "The decision that needed multiple perspectives.",
      roles_and_contributions:
        "What did each role contribute? E.g. 'Legal: GDPR requirements. Finance: budget. Engineering: timeline.'",
      capability_gaps:
        "Why couldn't one person decide? Name the expertise gaps that required multiple roles.",
      decision_authority: "Which role had final say on each part of the decision?",
      if_missing_role: "Impact analysis showing why each role was necessary.",
    },
    warningMessages: {
      decision_authority: "Who had final authority on each aspect?",
      if_missing_role: "What would have broken if a role was missing?",
    },
    recommendation: {
      researchQuote:
        "Complex decisions need multiple perspectives. One person doesn't have all the context.",
      defaultReasons: [
        "Multiple roles/expertise needed for one decision",
        "No single person had all the context",
        "Shows why the team composition mattered",
      ],
    },
  },
  "presence-boundary": {
    extractionQuestions: [
      { field: "initial_state", question: "Who initially noticed the problem or issue?" },
      {
        field: "escalation_triggers",
        question: "What events or discoveries brought each agent in?",
      },
      {
        field: "information_progression",
        question: "What new information surfaced at each step?",
      },
    ],
    errorMessages: {
      initial_state: "Who initially noticed the problem?",
      escalation_triggers: "What brought each agent in?",
      information_progression: "What information surfaced at each step?",
    },
    fieldTips: {
      initial_state:
        "Who knew first, and about what? E.g. 'Only Billing aware: duplicate charge detected.'",
      escalation_triggers:
        "Use timestamps. E.g. 'Day 1: Billing. Day 2: Finance saw revenue impact. Day 3: Legal found fraud pattern.'",
      information_progression: "How the picture changed as new information emerged.",
      visibility_gaps: "Information each agent lacked before entering.",
      decision_impact: "How the response evolved as information surfaced.",
    },
    warningMessages: {
      visibility_gaps: "What was each agent blind to at first?",
      decision_impact: "How did new information change the decision?",
    },
    recommendation: {
      researchQuote:
        "Decisions change when new information surfaces. We need to show who knew what when.",
      defaultReasons: [
        "Problem/information surfaced over time",
        "Different agents learned at different moments",
        "Decision changed as more information emerged",
      ],
    },
  },
  "deferred-detail": {
    extractionQuestions: [
      { field: "overall_goal", question: "What was the overall goal being pursued?" },
      { field: "phases", question: "What phases happened in sequence?" },
      {
        field: "deferred_details",
        question: "What detail was deferred from each phase and why?",
      },
    ],
    errorMessages: {
      overall_goal: "What was the overall goal?",
      phases: "Add at least 2 phases in sequence.",
      deferred_details: "What was deferred from each phase and why?",
    },
    fieldTips: {
      overall_goal: "What multi-phase effort were you pursuing? E.g. 'Migrate payment platform over 3 quarters.'",
      phases: "List phases in order with markers. E.g. 'Q1: Evaluation. Q2: Pilot. Q3: Rollout.'",
      deferred_details:
        "What wasn't decided yet at each phase, and why? Usually: not enough information yet.",
      handoff_points: "Gate or event that moved the process to the next phase.",
      phase_learnings: "Learnings that enabled the next phase.",
    },
    warningMessages: {
      handoff_points: "What triggered each phase transition?",
      phase_learnings: "What did each phase teach you?",
    },
    recommendation: {
      researchQuote:
        "We don't decide everything upfront. Each phase has different constraints and decisions.",
      defaultReasons: [
        "Multi-phase process that unfolded over time",
        "Detail deferred because you discovered as you went",
        "Shows why each phase couldn't predict the next",
      ],
    },
  },
};

export function getWorkspaceKey(
  slug: PatternSlug,
  instructionField: string,
): string {
  return WORKSPACE_FIELD_MAPS[slug][instructionField] ?? instructionField;
}

export function getInstructionKeyForWorkspace(
  slug: PatternSlug,
  workspaceKey: string,
): string | undefined {
  const map = WORKSPACE_FIELD_MAPS[slug];
  const entry = Object.entries(map).find(([, wsKey]) => wsKey === workspaceKey);
  return entry?.[0];
}
