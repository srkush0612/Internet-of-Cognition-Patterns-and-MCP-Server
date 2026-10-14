import {
  AUDIENCE_PHRASE,
  CHANNEL_PHRASE,
  LEVEL_LONG,
  audiencesForLevel,
  channelsForLevel,
} from "./levels";
import { MODE_CONNECTOR, MODE_VERB, getMode } from "./modes";
import type {
  Audience,
  Channel,
  Interaction,
  Level,
  Mode,
  Pattern,
  SpecSlot,
} from "./types";

/**
 * The behavior spec, from `context.md` section 5.
 *
 *   When [trigger], the agent [mode]s to [audience] in [level],
 *   through [channel], and expects [responses].
 *
 * Every pattern in the catalog carries a `spec` string written by hand, because
 * the real sentences read better than anything assembled from parts, the
 * connector shifts, triggers combine, responses get narrowed. `composeSpec`
 * below is for Studio, where a person is building a sentence that has no
 * pattern behind it yet.
 */

export const SPEC_SLOT_ORDER: SpecSlot[] = [
  "trigger",
  "mode",
  "audience",
  "level",
  "channel",
  "responses",
];

export const SPEC_SLOT_LABEL: Record<SpecSlot, string> = {
  trigger: "Trigger",
  mode: "Mode",
  audience: "Audience",
  level: "Level",
  channel: "Channel",
  responses: "Responses",
};

export const SPEC_SLOT_MEANING: Record<SpecSlot, string> = {
  trigger: "The moment that sets it off.",
  mode: "What kind of opening it is.",
  audience: "Who receives it.",
  level: "Who is in the exchange.",
  channel: "Chat, settings, shared UI, or a message between agents.",
  responses: "What the receiver can do back.",
};

/**
 * One CSS custom property per slot. These stand in for Open UI Kit's
 * `accentA`-`accentF`: when the kit is wired up, these six lines in
 * `app/v2.css` are the only place that has to change.
 */
export const SPEC_SLOT_VAR: Record<SpecSlot, string> = {
  trigger: "--v2-slot-trigger",
  mode: "--v2-slot-mode",
  audience: "--v2-slot-audience",
  level: "--v2-slot-level",
  channel: "--v2-slot-channel",
  responses: "--v2-slot-responses",
};

export type SpecDraft = {
  trigger: string;
  mode: Mode | null;
  audience: Audience | null;
  level: Level | null;
  channel: Channel | null;
  /** Defaults to the mode's valid responses; can be narrowed. */
  responses: string[];
};

export const EMPTY_SPEC: SpecDraft = {
  trigger: "",
  mode: null,
  audience: null,
  level: null,
  channel: null,
  responses: [],
};

export function specFromPattern(pattern: Pattern): SpecDraft {
  return {
    trigger: pattern.triggers[0] ?? "",
    mode: pattern.mode.primary,
    audience: pattern.audience[0] ?? null,
    level: pattern.level.primary,
    channel: pattern.channels[0] ?? null,
    responses: pattern.responses ?? getMode(pattern.mode.primary).responses,
  };
}

/**
 * Filling a slot narrows the others. Picking a level filters audiences and
 * channels; picking a mode sets the valid responses. This returns the draft
 * with anything now invalid cleared, rather than silently leaving a stale pick.
 */
export function reconcile(draft: SpecDraft, changed: SpecSlot): SpecDraft {
  let next = { ...draft };

  if (changed === "mode" && next.mode) {
    next.responses = getMode(next.mode).responses;
  }

  if (changed === "level" && next.level) {
    const channels = channelsForLevel(next.level);
    const audiences = audiencesForLevel(next.level);
    if (next.channel && !channels.includes(next.channel)) next.channel = null;
    if (next.audience && !audiences.includes(next.audience))
      next.audience = null;
  }

  return next;
}

function joinList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}

/**
 * The sentence as it reads so far. Unfilled slots come back as `null` in
 * `missing`, so the caller can render the blank rather than a placeholder word
 * that looks like a real answer.
 */
export function composeSpec(draft: SpecDraft): {
  parts: Array<{ slot: SpecSlot | null; text: string; filled: boolean }>;
  missing: SpecSlot[];
  sentence: string | null;
} {
  const missing: SpecSlot[] = [];

  function part(slot: SpecSlot, text: string | null) {
    if (!text) {
      missing.push(slot);
      return { slot, text: SPEC_SLOT_LABEL[slot].toLowerCase(), filled: false };
    }
    return { slot, text, filled: true };
  }

  const connector = draft.mode ? MODE_CONNECTOR[draft.mode] : "to";

  const parts: Array<{ slot: SpecSlot | null; text: string; filled: boolean }> = [
    { slot: null, text: "When", filled: true },
    part("trigger", draft.trigger.trim() ? lowerFirst(draft.trigger.trim()) : null),
    { slot: null, text: ", the agent", filled: true },
    part("mode", draft.mode ? MODE_VERB[draft.mode] : null),
    { slot: null, text: connector, filled: true },
    part("audience", draft.audience ? AUDIENCE_PHRASE[draft.audience] : null),
    { slot: null, text: "in", filled: true },
    part("level", draft.level ? LEVEL_LONG[draft.level] : null),
    { slot: null, text: ", through", filled: true },
    part("channel", draft.channel ? CHANNEL_PHRASE[draft.channel] : null),
    { slot: null, text: ", and expects", filled: true },
    part("responses", draft.responses.length ? joinList(draft.responses) : null),
    { slot: null, text: ".", filled: true },
  ];

  const sentence =
    missing.length === 0
      ? parts
          .map((p) => p.text)
          .join(" ")
          .replace(/ ([,.])/g, "$1")
      : null;

  return { parts, missing, sentence };
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * Patterns whose primary mode and level match the draft. A partial draft
 * matches on whatever is filled, so the list narrows as the sentence is built.
 */
export function matchingPatterns(
  draft: SpecDraft,
  catalog: Pattern[],
): Pattern[] {
  return catalog.filter((pattern) => {
    if (draft.mode && pattern.mode.primary !== draft.mode) return false;
    if (draft.level && pattern.level.primary !== draft.level) return false;
    if (draft.channel && !pattern.channels.includes(draft.channel)) return false;
    if (draft.audience && !pattern.audience.includes(draft.audience))
      return false;
    return true;
  });
}

/** `instantiate`: a spec becomes a live Interaction. */
export function instantiate(
  patternId: string,
  draft: SpecDraft,
  initiator = "agent:studio",
): Interaction | null {
  if (!draft.level || !draft.channel) return null;
  return {
    id: `int_${Math.random().toString(36).slice(2, 10)}`,
    pattern_id: patternId,
    level: draft.level,
    channel: draft.channel,
    initiator,
    audience: draft.audience ? [draft.audience] : [],
    state: { trigger: draft.trigger, expects: draft.responses },
    created_at: new Date().toISOString(),
  };
}
