/**
 * The Studio chat, scripted from the catalog, no model calls.
 *
 * It answers questions about the pattern on the canvas from the pattern's own
 * fields, and turns a few plain commands ("remove consent", "show it with a
 * person") into edits the simulator applies. Where the data has no answer, it
 * says so rather than inventing one.
 */

import { LEVEL_LABEL } from "./levels";
import { getMode } from "./modes";
import type { SpecDraft } from "./spec";
import type { Level, Pattern } from "./types";

export type ChatEffect =
  | { kind: "remove"; response: string }
  | { kind: "add"; response: string }
  | { kind: "view"; level: Level };

export type ChatResult = { reply: string; effect?: ChatEffect };

export function answerAboutPattern(
  pattern: Pattern,
  draft: SpecDraft,
  message: string,
): ChatResult {
  const text = message.toLowerCase().trim();
  const mode = getMode(pattern.mode.primary);
  const current = draft.responses;
  const all = pattern.responses ?? mode.responses;

  /* ---- edits ------------------------------------------------------------- */

  // "remove <response>" / "drop <response>" / "take out <response>"
  if (/\b(remove|drop|take out|without)\b/.test(text)) {
    const hit = all.find((r) => text.includes(r.toLowerCase()));
    if (hit && current.includes(hit)) {
      return {
        reply: `Done, ${hit} is gone. Watch the run and the canvas: the agent can no longer offer it.`,
        effect: { kind: "remove", response: hit },
      };
    }
    if (hit) {
      return { reply: `${hit} is already out of the spec.` };
    }
    return {
      reply: `I can only remove a response the pattern has: ${orList(all)}.`,
    };
  }

  // "add <response>" / "put back <response>" / "restore"
  if (/\b(add|put back|restore|bring back)\b/.test(text)) {
    const hit = all.find((r) => text.includes(r.toLowerCase()));
    if (hit && !current.includes(hit)) {
      return {
        reply: `Added ${hit} back.`,
        effect: { kind: "add", response: hit },
      };
    }
    if (hit) return { reply: `${hit} is already in the spec.` };
    return { reply: `This pattern's responses are: ${orList(all)}.` };
  }

  // "show it agents only" / "with a person" / "one agent"
  const levelEffect = detectLevel(text, pattern);
  if (levelEffect) {
    return {
      reply: `Showing it ${LEVEL_LABEL[levelEffect].toLowerCase()}. The cast on the canvas changes to match.`,
      effect: { kind: "view", level: levelEffect },
    };
  }

  /* ---- questions --------------------------------------------------------- */

  if (/\b(solve|solves|problem|why does this exist|point of)\b/.test(text)) {
    return { reply: pattern.whatItSolves ?? pattern.summary };
  }

  if (/\b(how|work|works|interaction|happen on screen)\b/.test(text)) {
    return {
      reply:
        pattern.interactionModel ??
        `The agent ${mode.id}s: "${mode.opens_with}". ${mode.definition}`,
    };
  }

  if (/\b(when|trigger|triggers|fires|kicks? in)\b/.test(text)) {
    return {
      reply: `It happens when: ${pattern.triggers.map((t) => lower(t)).join("; ")}.`,
    };
  }

  if (/\b(who|involved|level|people|agents?)\b/.test(text)) {
    const reach = (["L1", "L2", "L3", "L4"] as Level[]).filter(
      (l) => l === pattern.level.primary || l in pattern.level.notes,
    );
    const notes = reach
      .map((l) => `${LEVEL_LABEL[l]}, ${pattern.level.notes[l] ?? "where it belongs"}`)
      .join("; ");
    return { reply: `Who's involved: ${notes}.` };
  }

  if (/\b(do back|respond|response|responses|options?|choices?)\b/.test(text)) {
    return {
      reply: `Right now you can: ${orList(current)}. Remove one and the agent drops it, just say "remove ${current[0] ?? "…"}".`,
    };
  }

  if (/\b(example|for instance|e\.g\.)\b/.test(text)) {
    return {
      reply: pattern.example ?? "No worked example is recorded for this one yet.",
    };
  }

  if (/\b(export|mcp|markdown|take it|clipboard|download)\b/.test(text)) {
    return {
      reply:
        "Open Customise, the exports are at the bottom: the MCP call, a Markdown brief, and a .md download. Each carries the spec exactly as you've shaped it.",
    };
  }

  /* ---- fallback ---------------------------------------------------------- */

  return {
    reply:
      "I can tell you what this pattern solves, how it works, when it happens, who's involved, or what you can do back, or change it: try \"remove " +
      (current[0] ?? "a response") +
      '" or "show it agents only".',
  };
}

function detectLevel(text: string, pattern: Pattern): Level | null {
  const reach = (["L1", "L2", "L3", "L4"] as Level[]).filter(
    (l) => l === pattern.level.primary || l in pattern.level.notes,
  );
  let want: Level | null = null;
  if (/agents? only|no person|headless/.test(text)) want = "L2";
  else if (/one agent|single agent|just one/.test(text)) want = "L1";
  else if (/with a person|one person|in the loop|a human/.test(text)) want = "L3";
  else if (/many people|several|teams?/.test(text)) want = "L4";
  if (want && reach.includes(want)) return want;
  return null;
}

function lower(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function orList(items: string[]): string {
  if (items.length === 0) return "nothing";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}
