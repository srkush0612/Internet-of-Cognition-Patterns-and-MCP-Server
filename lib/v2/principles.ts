/** Outshift's five guiding principles, with short descriptions for HAX V3. */
export const HAX_PRINCIPLES = [
  { id: "control", name: "Control", description: "Let people set an agent's scope and decide when it may act.", examplePatternId: "pre-action-handshake" },
  { id: "clarity", name: "Clarity", description: "Make an agent's reasoning, context, and uncertainty legible.", examplePatternId: "inline-rationale" },
  { id: "recovery", name: "Recovery", description: "Give people a clear way to correct mistakes and guide the next attempt.", examplePatternId: "review-as-dialogue" },
  { id: "collaboration", name: "Collaboration", description: "Show shared work, contributions, and who owns the next decision.", examplePatternId: "convergence-point" },
  { id: "traceability", name: "Traceability", description: "Keep agent actions and decisions attributable and open to review.", examplePatternId: "activity-record" },
] as const;

export type HaxPrincipleId = (typeof HAX_PRINCIPLES)[number]["id"];

type PrincipleConnection = { id: HaxPrincipleId; why: string };
export type PatternPrinciples = {
  primary: PrincipleConnection;
  secondary?: PrincipleConnection;
};

/** Each reason describes an observable part of that pattern's authored behavior. */
export const PATTERN_PRINCIPLES = {
  "presence-boundary": {
    primary: { id: "control", why: "The person can pause the agent or change what it may observe and act on." },
    secondary: { id: "clarity", why: "The current activity and access boundary stay visible as they change." },
  },
  "activity-record": {
    primary: { id: "traceability", why: "Actions, assumptions, tool calls, and results stay in a time-ordered record." },
    secondary: { id: "clarity", why: "The person can see what the agent did and what still needs attention." },
  },
  "inline-rationale": {
    primary: { id: "clarity", why: "The reason for an output appears beside that output, where the person evaluates it." },
  },
  "structured-finding": {
    primary: { id: "clarity", why: "A finding separates its claim, confidence, and evidence for inspection." },
    secondary: { id: "traceability", why: "Named sources let the receiver check what supports the conclusion." },
  },
  "source-attribution": {
    primary: { id: "clarity", why: "The receiver can see which source supports a particular claim." },
    secondary: { id: "traceability", why: "The claim retains a checkable path back to its source." },
  },
  "deferred-detail": {
    primary: { id: "control", why: "A decision stays open until the required evidence allows the next phase to begin." },
    secondary: { id: "clarity", why: "The view names what is pending, why it must wait, and who owns the next gate." },
  },
  "certainty-boundary": {
    primary: { id: "clarity", why: "The workflow distinguishes fixed rules, agent choice, and generated work." },
    secondary: { id: "control", why: "A person can inspect or revise the steps that require review." },
  },
  "details-dashboard": {
    primary: { id: "clarity", why: "The changing state of one entity or process is visible in a single place." },
  },
  "capability-manifest": {
    primary: { id: "control", why: "A person can use declared capabilities and limits to set the agent's scope." },
    secondary: { id: "clarity", why: "Connection, availability, and approval requirements are visible before work starts." },
  },
  "credential-boundary": {
    primary: { id: "control", why: "Access stays scoped instead of being pooled across agents." },
    secondary: { id: "collaboration", why: "Agents coordinate across the boundary while the operator resolves access gaps." },
  },
  "convergence-point": {
    primary: { id: "collaboration", why: "Agents bring conflicting answers together for an adopted answer or an impasse." },
    secondary: { id: "traceability", why: "The operator can review the evidence and reasoning behind that result." },
  },
  "pre-action-handshake": {
    primary: { id: "control", why: "The agent waits for consent, correction, decline, or deferral before acting." },
    secondary: { id: "clarity", why: "It states what it noticed, how it interpreted the signal, and what it proposes." },
  },
  "assumption-surface": {
    primary: { id: "clarity", why: "The exchange shows what each agent saw, assumed, and concluded." },
    secondary: { id: "collaboration", why: "That shared view gives agents and people a basis for resolving disagreement." },
  },
  "decision-record": {
    primary: { id: "traceability", why: "The committed action keeps the agent's reason and any operator amendment." },
    secondary: { id: "control", why: "The operator can amend the reason before the record is sealed." },
  },
  "review-as-dialogue": {
    primary: { id: "recovery", why: "A declined draft can return as a clarified, marked revision for another decision." },
    secondary: { id: "collaboration", why: "The person and agent exchange focused feedback instead of ending at rejection." },
  },
  "memory-commitment-review": {
    primary: { id: "recovery", why: "A person can restore or revoke a changed belief before it becomes durable memory." },
    secondary: { id: "control", why: "The person decides which beliefs the agent may keep across sessions." },
  },
  "disclosure-gradient": {
    primary: { id: "clarity", why: "The result leads, while rationale, coordination, and the full trace remain available on request." },
  },
  "co-editing-surface": {
    primary: { id: "collaboration", why: "A person and several agents revise the same document in one shared workspace." },
    secondary: { id: "traceability", why: "Each contribution remains attributed to its author." },
  },
  "concurrent-workspace-awareness": {
    primary: { id: "collaboration", why: "Agents interpret live human edits as feedback, override, or unrelated work." },
    secondary: { id: "control", why: "A person's edit can redirect the agent's work in progress." },
  },
  "authority-gradient": {
    primary: { id: "control", why: "A person sets a separate autonomy level for each workflow area." },
  },
  "lineage-view": {
    primary: { id: "traceability", why: "Claims, artifacts, and decisions can be traced back through their dependencies." },
    secondary: { id: "clarity", why: "A questioned source reveals which downstream work needs review." },
  },
  "shared-cognitive-state": {
    primary: { id: "collaboration", why: "People and agents coordinate around shared goals, assumptions, conflicts, and open questions." },
    secondary: { id: "clarity", why: "The common view makes those working assumptions visible to the participants." },
  },
  "workshop-card": {
    primary: { id: "collaboration", why: "A group can see who is attending a session and where each participant stands." },
  },
} satisfies Record<string, PatternPrinciples>;

export function getPatternPrinciples(patternId: string): PatternPrinciples {
  const principles = PATTERN_PRINCIPLES[patternId as keyof typeof PATTERN_PRINCIPLES];
  if (!principles) throw new Error(`Missing principle mapping for ${patternId}`);
  return principles;
}

export function getHaxPrinciple(id: HaxPrincipleId) {
  return HAX_PRINCIPLES.find((principle) => principle.id === id)!;
}
