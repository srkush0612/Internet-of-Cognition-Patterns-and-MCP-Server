/**
 * Studio as a behaviour simulator (docs/studio-simulator-prompt.md).
 *
 * A pattern is a behaviour spec; the canvas is an agent running against it. This
 * module is the deterministic interpreter: given a pattern and the spec as the
 * user has shaped it, it produces the run, the cast the level implies, the
 * ordered steps the agent moves through, and, when the edit takes the spec
 * somewhere the pattern cannot go, the break and the way out.
 *
 * No model calls. Everything here is the catalog data read back as behaviour.
 */

import { getMode } from "./modes";
import { LEVEL_LABEL } from "./levels";
import type { SpecDraft } from "./spec";
import type { Situation } from "./situations";
import type { Level, Pattern } from "./types";

/** The three casts the simulator renders. L4 is held for later. */
export type Cast = "L1" | "L2" | "L3";

export type RunActor = "agent" | "agent-a" | "agent-b" | "person" | "system";

export type RunStep = {
  id: string;
  actor: RunActor;
  /** The move, in a few plain words. */
  label: string;
  /** Optional second line, what it rests on, or what it means. */
  detail?: string;
  /** Marks the step that surfaces the choices, so the UI can wire controls. */
  kind?: "trigger" | "open" | "responses" | "settle";
};

export type BreakKind =
  /** A required response was removed; the mode can no longer do its job. */
  | "incoherent"
  /** The level changed to one this pattern does not serve. */
  | "wrong-level";

export type RunBreak = {
  kind: BreakKind;
  /** Said in place, in the agent's voice. */
  message: string;
  /** For incoherent: what to put back. */
  restore?: string[];
  /** For wrong-level: other patterns that serve the new mode and level. */
  alternates?: Pattern[];
  /** True when nothing in the library serves it, a real gap, not a near-miss. */
  gap?: boolean;
};

export type Run = {
  cast: Cast | null;
  /** Null when the spec cannot run at all; steps is then empty. */
  steps: RunStep[];
  break?: RunBreak;
};

/** The levels a pattern actually serves, read from its notes plus its primary. */
export function reachableLevels(pattern: Pattern): Level[] {
  const set = new Set<Level>([pattern.level.primary]);
  for (const level of Object.keys(pattern.level.notes) as Level[]) set.add(level);
  return (["L1", "L2", "L3", "L4"] as Level[]).filter((l) => set.has(l));
}

export function reachesLevel(pattern: Pattern, level: Level): boolean {
  return level === pattern.level.primary || level in pattern.level.notes;
}

/**
 * Other patterns that serve the spec's current mode at the given level, the
 * alternates to offer when the current pattern no longer fits. Driven by the
 * catalog, never a hardcoded list.
 */
export function alternatesFor(
  draft: SpecDraft,
  level: Level,
  catalog: Pattern[],
  excludeId: string,
): Pattern[] {
  return catalog.filter((pattern) => {
    if (pattern.id === excludeId) return false;
    if (draft.mode && pattern.mode.primary !== draft.mode) return false;
    return reachesLevel(pattern, level);
  });
}

/** Patterns the current one pairs with, for adding capability, not replacing. */
export function composesWith(pattern: Pattern, catalog: Pattern[]): Pattern[] {
  return pattern.composes_with
    .map((id) => catalog.find((p) => p.id === id))
    .filter((p): p is Pattern => Boolean(p));
}

/**
 * Build the run for a pattern against the spec as shaped.
 *
 * `draft.level` decides the cast and therefore the whole shape of the run; the
 * remaining responses decide how it resolves. The break cases come first,
 * because a broken spec has no run to show, it has a reaction.
 */
export function buildRun(
  pattern: Pattern,
  draft: SpecDraft,
  catalog: Pattern[],
  situation?: Situation,
): Run {
  const level = (draft.level ?? pattern.level.primary) as Level;
  const cast: Cast | null = level === "L4" ? null : (level as Cast);
  const responses = draft.responses;
  const mode = draft.mode ? getMode(draft.mode) : getMode(pattern.mode.primary);
  const trigger =
    situation?.trigger || draft.trigger.trim() || pattern.triggers[0] || "the trigger fires";

  // --- break 1: the responses no longer let the mode do its job ---------------
  if (responses.length === 0) {
    return {
      cast,
      steps: [],
      break: {
        kind: "incoherent",
        message:
          "Nothing is left to do back. With no responses, the opening carries no information, the receiver has no move, so the exchange cannot form.",
        restore: mode.responses,
      },
    };
  }

  // --- break 2: the level is one this pattern does not serve -------------------
  if (level === "L4" || !reachesLevel(pattern, level)) {
    const alternates = alternatesFor(draft, level, catalog, pattern.id);
    const where = LEVEL_LABEL[level].toLowerCase();
    return {
      cast,
      steps: [],
      break: {
        kind: "wrong-level",
        message:
          alternates.length > 0
            ? `${pattern.name} doesn't run at ${where}, a required participant is missing. Other patterns live here instead.`
            : `${pattern.name} doesn't run at ${where}, and nothing in the library serves ${mode ? mode.id : "this"} here yet. This is one of the gaps.`,
        alternates,
        gap: alternates.length === 0,
      },
    };
  }

  // --- it runs: build the steps for this cast ---------------------------------
  if (level === "L2") {
    return { cast: "L2", steps: l2Exchange(pattern, draft, trigger, situation) };
  }
  // L1 and L3 both put the pattern's own surface in front of a receiver; the
  // difference is who that receiver is. The UI reads `cast` for that.
  return {
    cast: cast as Cast,
    steps: humanFacingRun(pattern, draft, trigger, situation),
  };
}

/**
 * The agents-only exchange. Not a static blob, a short back-and-forth whose
 * moves come from the mode, and whose resolution comes from the responses that
 * remain. Remove "flag impasse" and they can only adopt; remove "adopt" and
 * they can only ever reach impasse.
 */
function l2Exchange(
  pattern: Pattern,
  draft: SpecDraft,
  trigger: string,
  situation?: Situation,
): RunStep[] {
  const responses = draft.responses;
  const canAdopt = responses.some((r) => /adopt/i.test(r));
  const canImpasse = responses.some((r) => /impasse/i.test(r));
  const a = situation?.partyA;
  const b = situation?.partyB;

  const steps: RunStep[] = [
    {
      id: "trigger",
      actor: "system",
      kind: "trigger",
      label: cap(trigger),
      detail: "Two agents reach it at once.",
    },
    {
      id: "assert",
      actor: "agent-a",
      label: a ? `${a.name}: ${a.claim}.` : "States its answer, with what it rests on.",
      detail: a ? `From ${a.basis}.` : undefined,
    },
    {
      id: "counter",
      actor: "agent-b",
      kind: "open",
      label: b
        ? `${b.name}: ${b.claim}.`
        : "States a conflicting answer, with its own sources.",
      detail: b ? `From ${b.basis}.` : undefined,
    },
    {
      id: "responses",
      actor: "system",
      kind: "responses",
      label: "The agents weigh the two.",
      detail: "What they can do next is only what the spec still allows.",
    },
  ];

  if (canAdopt) {
    steps.push({
      id: "settle",
      actor: "agent-a",
      kind: "settle",
      label: situation?.adopt ?? "They adopt one answer.",
      detail: canImpasse
        ? "Its reasoning is attached, so a reader can overturn it."
        : "Impasse was removed from the spec, they are forced to converge, even when they shouldn't.",
    });
  } else {
    steps.push({
      id: "settle",
      actor: "system",
      kind: "settle",
      label: situation?.impasse ?? "They flag an impasse.",
      detail:
        "Adopt was removed from the spec, they can never converge, so every run ends unresolved.",
    });
  }

  return steps;
}

/** The person-in-the-loop (L3) or single-surface (L1) run. */
function humanFacingRun(
  pattern: Pattern,
  draft: SpecDraft,
  trigger: string,
  situation?: Situation,
): RunStep[] {
  const mode = draft.mode ? getMode(draft.mode) : getMode(pattern.mode.primary);
  return [
    {
      id: "trigger",
      actor: "system",
      kind: "trigger",
      label: cap(trigger),
    },
    {
      id: "open",
      actor: "agent",
      kind: "open",
      label: `The agent ${mode.id}s.`,
      detail: situation?.opening ? `"${situation.opening}"` : `"${mode.opens_with}"`,
    },
    {
      id: "responses",
      actor: "agent",
      kind: "responses",
      label: "It surfaces what you can do back.",
      detail: "Only the responses the spec still allows.",
    },
    {
      id: "settle",
      actor: "person",
      kind: "settle",
      label: situation?.waitingOn ?? "You pick one, and the agent acts on it.",
    },
  ];
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* -------------------------------------------------------------- exports ----- */

/**
 * The MCP call that fetches this pattern with the spec as shaped, the real
 * one that points a user's own agents at the server. Carries the shaping:
 * removed responses are gone here too.
 */
export function mcpExport(pattern: Pattern, draft: SpecDraft): string {
  const level = draft.level ?? pattern.level.primary;
  const channel = draft.channel ?? pattern.channels[0];
  const args = {
    id: pattern.id,
    mode: draft.mode ?? pattern.mode.primary,
    level,
    channel,
    responses: draft.responses,
  };
  return [
    "// HAX Studio, " +
      (isShaped(pattern, draft) ? "shaped variant of " : "catalog pattern ") +
      pattern.name,
    `fetch_pattern(${JSON.stringify(args, null, 2)})`,
  ].join("\n");
}

/**
 * The Markdown spec, the file handed to Claude Code or Cursor as the brief for
 * building this pattern. Instructions for an agent, not prose for a human. Still
 * exports for a gap spec: a pattern that does not exist yet is the most valuable
 * brief of all.
 */
export function markdownExport(pattern: Pattern, draft: SpecDraft): string {
  const mode = draft.mode ? getMode(draft.mode) : getMode(pattern.mode.primary);
  const level = (draft.level ?? pattern.level.primary) as Level;
  const shaped = isShaped(pattern, draft);
  const removed = mode.responses.filter((r) => !draft.responses.includes(r));

  const lines = [
    `# ${pattern.name}${shaped ? " (shaped variant)" : ""}`,
    "",
    `> From HAX Studio, ${shaped ? "a shaped variant of" : "the catalog pattern"} ${pattern.name}. This brief carries behaviour, not rendering.`,
    "",
    "## Behaviour spec",
    "",
    draft.trigger.trim()
      ? `When ${lower(draft.trigger.trim())}, the agent ${mode.id}s to ${
          draft.audience ?? "its receiver"
        } in ${LEVEL_LABEL[level].toLowerCase()}, through ${
          draft.channel ?? pattern.channels[0]
        }, and expects ${orList(draft.responses)}.`
      : pattern.spec,
    "",
    "## Rules",
    "",
    `- **What kind of opening:** ${mode.id}, ${mode.definition}`,
    `- **Who is involved:** ${LEVEL_LABEL[level]}.`,
    `- **When it happens:** ${draft.trigger.trim() || pattern.triggers.join("; ")}.`,
    `- **What you can do back:** ${draft.responses.map((r) => `\`${r}\``).join(", ")}.`,
    removed.length
      ? `- **Removed from the default:** ${removed
          .map((r) => `\`${r}\``)
          .join(", ")}, the agent must not offer these.`
      : "- **Responses:** the mode's full set is kept.",
    "- **On no response:** the opening stands; nothing irreversible proceeds.",
  ];

  if (!reachesLevel(pattern, level)) {
    lines.push(
      "",
      "## Gap",
      "",
      `The library has no pattern that serves ${mode.id} at ${LEVEL_LABEL[level]}. This file is a brief for building one that does not exist yet.`,
    );
  }

  return lines.join("\n");
}

/**
 * Whether the draft was actually reshaped, i.e. responses were taken away or
 * put back differently. The level is a read-only view, not an edit, so moving
 * between the levels a pattern reaches is not "shaping"; only the responses are.
 */
export function isShaped(pattern: Pattern, draft: SpecDraft): boolean {
  const defaults = pattern.responses ?? getMode(pattern.mode.primary).responses;
  if (draft.responses.length !== defaults.length) return true;
  return draft.responses.some((r) => !defaults.includes(r));
}

function lower(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function orList(items: string[]): string {
  if (items.length === 0) return "nothing";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}
