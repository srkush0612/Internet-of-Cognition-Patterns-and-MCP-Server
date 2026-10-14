import { CHANNEL_LABEL } from "./levels";
import { specFromPattern, type SpecDraft } from "./spec";
import type { Channel, Pattern } from "./types";

export type GeneratedUiModel = {
  channel: Channel;
  trigger: string;
  agentName: string;
  title: string;
  output: string;
  rationale: string;
  evidence: Array<{ label: string; value: string }>;
  confidence?: string;
  reveal: "inline" | "on_request" | "expand";
  order: "output_first" | "evidence_first";
  approval: boolean;
  actions: string[];
};

export type GeneratedUiChanges = {
  trigger: boolean;
  mode: boolean;
  audience: boolean;
  level: boolean;
  channel: boolean;
  reveal: boolean;
  order: boolean;
  approval: boolean;
  addedActions: string[];
  removedActions: string[];
  labels: string[];
};

const SCENES: Record<string, Pick<GeneratedUiModel, "agentName" | "title" | "output" | "rationale" | "evidence" | "confidence">> = {
  "inline-rationale": {
    agentName: "Triage agent",
    title: "Restart payments-svc",
    output: "Triage recommends restarting payments-svc to clear the stuck retry queue.",
    rationale: "The 5xx spike matches a retry storm, and a restart clears the queue without a deploy.",
    evidence: [
      { label: "Signal", value: "5xx errors rose 4× in three minutes" },
      { label: "Likely cause", value: "Checkout retry loop" },
      { label: "Reversible", value: "Yes, restart only" },
    ],
    confidence: "68% confidence",
  },
  "pre-action-handshake": {
    agentName: "Triage agent",
    title: "Before I act",
    output: "Pause the retry job and scale payments replicas from 3 to 6.",
    rationale: "The 5xx spike points to a checkout retry storm. I want your read before I change the service.",
    evidence: [
      { label: "Observed", value: "payments-svc 5xx errors rose 4×" },
      { label: "Interpretation", value: "A retry storm, not a capacity shortfall" },
      { label: "Plan", value: "Pause retries, then scale replicas" },
    ],
  },
  "convergence-point": {
    agentName: "Triage + Deploy",
    title: "Two agents reached different answers",
    output: "The incident diagnosis needs a shared decision.",
    rationale: "Triage points to the checkout retry loop; Deploy points to replica saturation.",
    evidence: [
      { label: "Triage agent", value: "Retry loop · error logs, 03:08–03:12" },
      { label: "Deploy agent", value: "Capacity shortfall · saturation dashboard" },
    ],
  },
  "memory-commitment-review": {
    agentName: "Memory agent",
    title: "Review a belief before it is kept",
    output: "The churn baseline changed from 12% to 41%.",
    rationale: "Customer Success validated the revised baseline across 1,200 accounts. The earlier 12% value is marked stale.",
    evidence: [
      { label: "Earlier belief", value: "12% churn baseline · stale" },
      { label: "Updated belief", value: "41% churn baseline · validated" },
    ],
  },
};

function behaviorSignals(instruction: string) {
  return {
    onRequest: /\b(asks? why|ask for (?:a |the )?reason|when asked|on request|only.*(?:asks?|clicks?))\b/.test(instruction),
    expand: /\b(expand|reveal|show more|click to (?:see|show)|on demand|collaps(?:e|ible))\b/.test(instruction),
    evidenceFirst: /\b(evidence|sources?|reason(?:ing)?)\b.{0,55}\bbefore\b|\bbefore\b.{0,55}\b(recommend|result|action)\b/.test(instruction),
    approval: /\b(confirm|approval|approve|permission|ask before acting|wait for (?:a |the )?decision)\b/.test(instruction),
  };
}

/** Guard the local interpreter from claiming a canvas update it cannot render. */
export function canRenderBehaviorNote(note: string): boolean {
  return Object.values(behaviorSignals(note.toLowerCase())).some(Boolean);
}

/** Turns the current behavior draft into a renderable interaction, not a prose summary. */
export function buildStudioGeneratedUi(pattern: Pattern, draft: SpecDraft, notes: string[]): GeneratedUiModel {
  const scene = SCENES[pattern.id] ?? {
    agentName: "Agent",
    title: pattern.name,
    output: pattern.example ?? pattern.summary,
    rationale: pattern.interactionSteps?.[1]?.description ?? pattern.whatItSolves ?? pattern.summary,
    evidence: (pattern.interactionSteps ?? []).slice(0, 3).map((step) => ({ label: step.title, value: step.description })),
  };
  const instruction = notes.join(" ").toLowerCase();
  const signals = behaviorSignals(instruction);
  const approval = pattern.id === "pre-action-handshake" || signals.approval;
  const channel = draft.channel ?? pattern.channels[0] ?? "chat_ui";
  return {
    ...scene,
    channel,
    trigger: draft.trigger || pattern.triggers[0] || "The interaction begins",
    reveal: signals.onRequest ? "on_request" : signals.expand ? "expand" : "inline",
    order: signals.evidenceFirst ? "evidence_first" : "output_first",
    approval,
    actions: draft.responses,
  };
}

export function generatedSurfaceName(channel: Channel): string {
  return channel === "chat_ui" ? "Conversation" : channel === "shared_ui" ? "Shared workspace" : channel === "settings_panel" ? "Agent setup" : CHANNEL_LABEL[channel];
}

/** Compare rendered behavior with the catalog baseline, rather than counting chat messages. */
export function getStudioGeneratedChanges(pattern: Pattern, draft: SpecDraft, notes: string[]): GeneratedUiChanges {
  const original = specFromPattern(pattern);
  const before = buildStudioGeneratedUi(pattern, original, []);
  const after = buildStudioGeneratedUi(pattern, draft, notes);
  const changes = {
    trigger: after.trigger !== before.trigger,
    mode: draft.mode !== original.mode,
    audience: draft.audience !== original.audience,
    level: draft.level !== original.level,
    channel: after.channel !== before.channel,
    reveal: after.reveal !== before.reveal,
    order: after.order !== before.order,
    approval: after.approval !== before.approval,
    addedActions: after.actions.filter((action) => !before.actions.includes(action)),
    removedActions: before.actions.filter((action) => !after.actions.includes(action)),
  };
  const labels = [
    changes.trigger && "Timing",
    changes.mode && "Agent move",
    changes.audience && "Receiver",
    changes.level && "Participants",
    changes.channel && "Surface",
    changes.reveal && "Reveal",
    changes.order && "Content order",
    changes.approval && "Approval",
    (changes.addedActions.length > 0 || changes.removedActions.length > 0) && "Choices",
  ].filter((label): label is string => Boolean(label));
  return { ...changes, labels };
}
