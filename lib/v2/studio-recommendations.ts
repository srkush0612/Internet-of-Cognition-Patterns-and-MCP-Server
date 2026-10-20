import type { Pattern } from "./types";

export type StudioRecommendation = {
  patternId: string;
  reason: string;
  match: string;
};

export type StudioRecommendationResponse = {
  behavior: string;
  intro: string;
  items: StudioRecommendation[];
};

type BehaviorSignal = {
  patternId: string;
  cues: RegExp[];
  match: string;
  reason: string;
};

// Small, explicit behavior matches make the conversation useful until a model
// can interpret open-ended use cases. Every suggested ID resolves to the catalog.
const BEHAVIOR_SIGNALS: BehaviorSignal[] = [
  {
    patternId: "pre-action-handshake",
    cues: [/\b(before|pause|hold|wait)\b.{0,55}\b(act|action|restart|deploy|delete|send|rollback|execute|proceed)\b/, /\b(approve|approval|consent|permission|sign.?off)\b/],
    match: "Decision before action",
    reason: "The agent presents what it noticed and proposes, then waits for a person's response before a consequential step.",
  },
  {
    patternId: "convergence-point",
    cues: [/\b(agents?|answers?|findings?)\b.{0,45}\b(disagree|conflict|differ)\b/, /\b(disagree|conflict|differ)\b.{0,45}\b(agents?|answers?|findings?)\b/, /\b(resolve|settle)\b.{0,45}\b(disagreement|conflict)\b/],
    match: "Conflicting agent answers",
    reason: "It compares the agents' evidence and shows how an answer is adopted or an impasse reaches a person.",
  },
  {
    patternId: "assumption-surface",
    cues: [/\b(agents?|teams?)\b.{0,45}\b(assumptions?|disagree)\b/, /\b(assumptions?|disagree)\b.{0,45}\b(agents?|teams?)\b/],
    match: "Different assumptions",
    reason: "It makes the assumptions behind different agent positions visible before a decision is made.",
  },
  {
    patternId: "memory-commitment-review",
    cues: [/\b(belief|memory|learning)\b.{0,55}\b(change|changes|changed|update|updates|save|saved|commit|review)\b/, /\b(save|commit|review|update)\b.{0,55}\b(belief|memory|learning)\b/, /\b(stale|superseded)\b.{0,35}\b(belief|reasoning|memory)\b/],
    match: "Belief becomes durable",
    reason: "A person can review changed beliefs and choose what enters long-term memory.",
  },
  {
    patternId: "inline-rationale",
    cues: [/\b(explain|show|tell)\b.{0,45}\b(why|reason|rationale)\b/, /\b(why|reason|rationale)\b.{0,45}\b(output|result|recommendation|decision|change)\b/],
    match: "Explain an output",
    reason: "It keeps the explanation beside the output or state change it accounts for.",
  },
  {
    patternId: "source-attribution",
    cues: [/\b(source|sources|provenance|citation|citations)\b/, /\b(verify|trace|show)\b.{0,40}\b(evidence|claim|answer)\b/],
    match: "Trace the evidence",
    reason: "It connects a claim to the sources a person needs to inspect or verify it.",
  },
  {
    patternId: "presence-boundary",
    cues: [/\b(pause|monitor|limit|scope)\b.{0,45}\b(agent|activity|access|work)\b/, /\b(agent|activity|access)\b.{0,45}\b(pause|monitor|limit|scope)\b/],
    match: "Live agent boundary",
    reason: "It shows the agent's current activity and scope so a person can pause or change its reach.",
  },
  {
    patternId: "capability-manifest",
    cues: [/\b(capabilities|permissions|tools|can access|allowed to)\b/],
    match: "Available capabilities",
    reason: "It makes the agent's available capabilities and their limits visible before or during use.",
  },
];

function isRecommendationRequest(question: string, hasSignal: boolean): boolean {
  const text = question.toLowerCase();
  if (/\b(recommend|suggest|other|another|more|alternatives?|which patterns?|what patterns?|similar patterns?|else)\b/.test(text)) return true;
  if (/\bthis pattern\b/.test(text)) return false;
  return (hasSignal && /\b(my agent|our agent|our system|we need|we want|i need|i want|what if|suppose|imagine)\b/.test(text)) ||
    /\b(my agent|our agent|our system|we|i)\b.{0,45}\b(needs?|must|should|wants?|has to)\b/.test(text);
}

const COMMON_WORDS = new Set(["about", "agent", "agents", "another", "before", "behavior", "could", "from", "have", "more", "need", "needs", "other", "pattern", "patterns", "person", "recommend", "related", "should", "something", "their", "them", "there", "this", "what", "when", "which", "with", "would"]);

function catalogTextMatches(question: string, selected: Pattern, catalog: Pattern[]): StudioRecommendation[] {
  const words = [...new Set(question.toLowerCase().match(/[a-z]{4,}/g) ?? [])].filter((word) => !COMMON_WORDS.has(word));
  return catalog
    .filter((pattern) => pattern.id !== selected.id)
    .map((pattern) => {
      const authoredText = [pattern.name, pattern.summary, pattern.whatItSolves ?? "", pattern.interactionModel ?? "", ...pattern.triggers].join(" ").toLowerCase();
      return { pattern, score: words.filter((word) => authoredText.includes(word)).length };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.pattern.name.localeCompare(b.pattern.name))
    .slice(0, 3)
    .map(({ pattern }) => ({ patternId: pattern.id, match: "Related catalog behavior", reason: pattern.summary }));
}

/** Returns null when the message is a clarification about the open pattern. */
export function recommendStudioPatterns(
  selected: Pattern,
  question: string,
  catalog: Pattern[],
): StudioRecommendationResponse | null {
  const text = question.toLowerCase().trim();
  const matches = BEHAVIOR_SIGNALS
    .map((signal) => ({ signal, score: signal.cues.filter((cue) => cue.test(text)).length }))
    .filter(({ signal, score }) => score > 0 && signal.patternId !== selected.id)
    .sort((a, b) => b.score - a.score);
  const hasSignal = BEHAVIOR_SIGNALS.some((signal) => signal.cues.some((cue) => cue.test(text)));
  if (!isRecommendationRequest(question, hasSignal)) return null;

  const byId = new Map(catalog.map((pattern) => [pattern.id, pattern]));
  const items: StudioRecommendation[] = matches
    .filter(({ signal }) => byId.has(signal.patternId))
    .slice(0, 3)
    .map(({ signal }) => ({ patternId: signal.patternId, match: signal.match, reason: signal.reason }));

  if (!items.length) items.push(...catalogTextMatches(question, selected, catalog));

  if (!items.length) {
    const related = catalog.filter((pattern) =>
      pattern.id !== selected.id &&
      (selected.composes_with.includes(pattern.id) || pattern.composes_with.includes(selected.id)),
    );
    for (const pattern of related) {
      if (items.length === 3) break;
      if (items.some((item) => item.patternId === pattern.id)) continue;
      items.push({ patternId: pattern.id, match: `Works with ${selected.name}`, reason: pattern.summary });
    }
  }

  if (!items.length) {
    const related = catalog.filter((pattern) => pattern.id !== selected.id &&
      (pattern.mode.primary === selected.mode.primary || pattern.channels.some((channel) => selected.channels.includes(channel))));
    for (const pattern of related.slice(0, 3)) {
      items.push({ patternId: pattern.id, match: "Related catalog behavior", reason: pattern.summary });
    }
  }

  return {
    behavior: question.trim(),
    intro: matches.length
      ? "These patterns address parts of the behavior you described. Open one to inspect its catalog UI."
      : `Here are patterns related to ${selected.name}. Describe when the agent acts and what a person should do for a closer match.`,
    items,
  };
}
