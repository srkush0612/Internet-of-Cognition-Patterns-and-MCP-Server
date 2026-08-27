/**
 * Editable field schemas aligned with pattern-instructions-*.md
 * (Required → recommended → optional, sentence-case labels, field tips)
 */

import type { EditableField, PatternEditableSchema } from "@/lib/editable-fields";

const FILE_ACCEPT = ".pdf,.doc,.docx,.txt,.json,.csv";

const EVIDENCE_FILES: EditableField = {
  key: "evidenceFiles",
  label: "Evidence",
  type: "file",
  section: "parameters",
  group: "optional",
  description: "Supporting documents (optional).",
  accept: FILE_ACCEPT,
};

function f(field: EditableField): EditableField {
  if (field.group) return field;
  if (field.required) return { ...field, group: "required" };
  if (field.key === "evidenceFiles") return { ...field, group: "optional" };
  return field;
}

export const DECISION_LEDGER_INSTRUCTION_FIELDS: EditableField[] = [
  f({
    key: "decision",
    label: "What decision needed to be made?",
    type: "textarea",
    section: "parameters",
    required: true,
    placeholder: "e.g. Choose between immediate rollout vs. delayed rollout with testing",
    description:
      "What choice needed to happen? Not the outcome — the decision itself.",
  }),
  f({
    key: "chosen",
    label: "Which option was chosen?",
    type: "textarea",
    section: "parameters",
    required: true,
    placeholder: "e.g. Delayed rollout with full QA cycle (2 weeks)",
    description: "The specific option that was actually selected.",
  }),
  f({
    key: "reasoning",
    label: "Why was this option chosen?",
    type: "textarea",
    section: "parameters",
    required: true,
    placeholder: "e.g. Risk of production incident outweighs speed-to-market",
    description:
      "Why did this option win? Include constraints, trade-offs, or evidence — not just 'we picked it'.",
  }),
  f({
    key: "alternatives",
    label: "What other options were considered?",
    type: "textarea",
    section: "parameters",
    placeholder: "e.g. Immediate rollout (faster but riskier), phased rollout",
    description: "Name 2+ options you considered. Shows it was a real decision.",
  }),
  f({
    key: "decided_by",
    label: "Who made this decision?",
    type: "text",
    section: "parameters",
    placeholder: "e.g. CTO, Product team consensus",
    description: "Who had authority or consensus to decide?",
  }),
  f({
    key: "constraints",
    label: "What constraints shaped this choice?",
    type: "textarea",
    section: "parameters",
    placeholder: "e.g. Team capacity was 2 weeks. Budget was fixed.",
    description: "Limits that narrowed the options (time, budget, policy, capacity).",
  }),
  f({
    key: "trade_offs",
    label: "What was traded off?",
    type: "textarea",
    section: "parameters",
    group: "optional",
    placeholder: "e.g. Speed traded for reliability",
    description: "Optional: what you gave up to choose this option.",
  }),
  f({
    key: "when_decided",
    label: "When was it decided?",
    type: "text",
    section: "parameters",
    group: "optional",
    placeholder: "e.g. March 2024, Sprint 12",
    description: "Optional timestamp or date range.",
  }),
  EVIDENCE_FILES,
];

export const ASSUMPTION_SURFACE_INSTRUCTION_FIELDS: EditableField[] = [
  f({
    key: "agents_and_assumptions",
    label: "What did each agent assume?",
    type: "textarea",
    section: "parameters",
    required: true,
    placeholder:
      "e.g. Logs team assumed trace volume stays low. Code team assumed 10x growth.",
    description:
      "What did each agent believe about the world? Link agent to assumption.",
  }),
  f({
    key: "disagreement",
    label: "What positions did those assumptions create?",
    type: "textarea",
    section: "parameters",
    required: true,
    placeholder: "e.g. Logs wanted minimal trace. Code wanted comprehensive trace.",
    description: "Conflicting positions that resulted from different assumptions.",
  }),
  f({
    key: "assumption_evidence",
    label: "What evidence backed each assumption?",
    type: "textarea",
    section: "parameters",
    placeholder: "e.g. Logs: current metrics. Code: beta testing at scale.",
    description: "What made each team believe their assumption?",
  }),
  f({
    key: "validated_assumptions",
    label: "Were assumptions later validated or proved wrong?",
    type: "textarea",
    section: "parameters",
    placeholder: "e.g. Code team was right — load grew 8x in 3 months.",
    description: "Which assumptions turned out correct or incorrect?",
  }),
  f({
    key: "resolution",
    label: "How was the disagreement resolved?",
    type: "textarea",
    section: "parameters",
    group: "optional",
    placeholder: "e.g. Adopted comprehensive trace after monitoring gaps found.",
    description: "Optional: how the conflict was resolved, if at all.",
  }),
  f({
    key: "learning",
    label: "What did you learn about assumptions?",
    type: "textarea",
    section: "parameters",
    group: "optional",
    placeholder: "e.g. Projections should inform assumptions, not just current state.",
    description: "Optional takeaway about how your team makes assumptions.",
  }),
  EVIDENCE_FILES,
];

export const CREDENTIAL_BOUNDARY_INSTRUCTION_FIELDS: EditableField[] = [
  f({
    key: "decision",
    label: "What decision required multiple roles?",
    type: "textarea",
    section: "parameters",
    required: true,
    placeholder: "e.g. Plan GDPR compliance rollout",
    description: "The decision that needed multiple perspectives.",
  }),
  f({
    key: "roles_and_contributions",
    label: "What did each role contribute?",
    type: "textarea",
    section: "parameters",
    required: true,
    placeholder:
      "e.g. Legal: GDPR requirements. Finance: $200K budget. Engineering: 6-month timeline.",
    description: "Specific contribution from each role — not just 'teams involved'.",
  }),
  f({
    key: "capability_gaps",
    label: "Why wasn't one role enough?",
    type: "textarea",
    section: "parameters",
    required: true,
    placeholder:
      "e.g. No single role had legal authority AND budget control AND technical feasibility.",
    description: "Capability gaps that required multiple roles at the table.",
  }),
  f({
    key: "decision_authority",
    label: "Who had final authority on each aspect?",
    type: "textarea",
    section: "parameters",
    placeholder: "e.g. Legal veto on GDPR. Finance owned budget. Engineering owned timeline.",
    description: "Which role had final say on each part of the decision?",
  }),
  f({
    key: "if_missing_role",
    label: "What would have broken if a role was missing?",
    type: "textarea",
    section: "parameters",
    placeholder: "e.g. Without legal: missed GDPR requirements ($500K fine).",
    description: "Impact analysis showing why each role was necessary.",
  }),
  f({
    key: "cascade_effects",
    label: "What downstream impacts required this role?",
    type: "textarea",
    section: "parameters",
    group: "optional",
    placeholder: "e.g. Legal decision shaped engineering timeline shaped launch.",
    description: "Optional: cascade of dependencies across roles.",
  }),
  f({
    key: "role_conflicts",
    label: "Where did roles have differing priorities?",
    type: "textarea",
    section: "parameters",
    group: "optional",
    placeholder: "e.g. Legal wanted comprehensive audit. Finance wanted minimal cost.",
    description: "Optional: tension between role priorities.",
  }),
  EVIDENCE_FILES,
];

export const PRESENCE_BOUNDARY_INSTRUCTION_FIELDS: EditableField[] = [
  f({
    key: "initial_state",
    label: "Who initially noticed the problem?",
    type: "textarea",
    section: "parameters",
    required: true,
    placeholder: "e.g. Only Billing aware: duplicate charge detected on card ending 4412.",
    description: "Who knew first, and about what? Other agents were unaware.",
  }),
  f({
    key: "escalation_triggers",
    label: "What brought each agent in?",
    type: "textarea",
    section: "parameters",
    required: true,
    placeholder: "e.g. Day 1: Billing. Day 2: Finance (revenue impact). Day 3: Legal (fraud pattern).",
    description: "Events with time markers that triggered each agent's entry.",
  }),
  f({
    key: "information_progression",
    label: "What information surfaced at each step?",
    type: "textarea",
    section: "parameters",
    required: true,
    placeholder: "e.g. Initially: one anomaly. Then: pattern analysis. Then: processor audit.",
    description: "How the picture changed as new information emerged.",
  }),
  f({
    key: "visibility_gaps",
    label: "What was each agent blind to at first?",
    type: "textarea",
    section: "parameters",
    placeholder: "e.g. Billing didn't see pattern analysis. Finance didn't see fraud indicators.",
    description: "Information each agent lacked before entering.",
  }),
  f({
    key: "decision_impact",
    label: "How did new information change the decision?",
    type: "textarea",
    section: "parameters",
    placeholder: "e.g. Started monitoring → investigate → refund + incident report.",
    description: "How the response evolved as information surfaced.",
  }),
  f({
    key: "final_state",
    label: "Who was involved by the end?",
    type: "textarea",
    section: "parameters",
    group: "optional",
    placeholder: "e.g. Billing, Finance, Legal, and Ops by Day 4.",
    description: "Optional: final set of agents and collective knowledge.",
  }),
  f({
    key: "learning",
    label: "What patterns of visibility matter?",
    type: "textarea",
    section: "parameters",
    group: "optional",
    placeholder: "e.g. Fraud signals need cross-team visibility within 24 hours.",
    description: "Optional: lessons about information flow.",
  }),
  EVIDENCE_FILES,
];

export const DEFERRED_DETAIL_INSTRUCTION_FIELDS: EditableField[] = [
  f({
    key: "overall_goal",
    label: "What was the overall goal?",
    type: "textarea",
    section: "parameters",
    required: true,
    placeholder: "e.g. Migrate from legacy payment system to modern platform",
    description: "The multi-phase effort being pursued across all phases.",
  }),
  f({
    key: "phases",
    label: "What phases happened in sequence?",
    type: "tags",
    section: "parameters",
    required: true,
    placeholder: "Q1: Evaluation, Q2: Pilot, Q3: Rollout",
    description: "List phases in order with time markers (Q1, Phase 1, Month 2).",
  }),
  f({
    key: "deferred_details",
    label: "What was deferred from each phase and why?",
    type: "tags",
    section: "parameters",
    required: true,
    placeholder: "Q1: scale (no data yet), Q2: ops model (needed pilot results)",
    description: "What wasn't decided yet at each phase — usually not enough information.",
  }),
  f({
    key: "handoff_points",
    label: "What triggered each phase transition?",
    type: "textarea",
    section: "parameters",
    placeholder: "e.g. Phase 1 complete → pilot approved. Pilot stable → rollout approved.",
    description: "Gate or event that moved the process to the next phase.",
  }),
  f({
    key: "phase_learnings",
    label: "What did each phase teach you?",
    type: "textarea",
    section: "parameters",
    placeholder: "e.g. Q1: confirmed 20% cost savings. Q2: discovered integration complexity.",
    description: "Learnings that enabled the next phase.",
  }),
  f({
    key: "constraints_by_phase",
    label: "What constraints existed at each phase?",
    type: "textarea",
    section: "parameters",
    group: "optional",
    placeholder: "e.g. Q1: budget cap. Q2: team capacity. Q3: launch deadline.",
    description: "Optional: constraints that differed per phase.",
  }),
  f({
    key: "decision_gates",
    label: "What go/no-go decisions happened?",
    type: "textarea",
    section: "parameters",
    group: "optional",
    placeholder: "e.g. Phase 1→2: savings must be >15% (was 20%, go).",
    description: "Optional: explicit gates at phase boundaries.",
  }),
  EVIDENCE_FILES,
];

export const INSTRUCTION_EDITABLE_SCHEMAS: Record<string, PatternEditableSchema> = {
  "decision-ledger": {
    parameters: DECISION_LEDGER_INSTRUCTION_FIELDS,
    context: [],
  },
  "assumption-surface": {
    parameters: ASSUMPTION_SURFACE_INSTRUCTION_FIELDS,
    context: [],
  },
  "credential-boundary": {
    parameters: CREDENTIAL_BOUNDARY_INSTRUCTION_FIELDS,
    context: [],
  },
  "presence-boundary": {
    parameters: PRESENCE_BOUNDARY_INSTRUCTION_FIELDS,
    context: [],
  },
  "deferred-detail": {
    parameters: DEFERRED_DETAIL_INSTRUCTION_FIELDS,
    context: [],
  },
};
