import { patternsAtLevel, patternsInMode } from "./catalog";
import { MODE_LABEL, MODE_ORDER } from "./modes";
import { LEVEL_LABEL, LEVEL_ORDER } from "./levels";
import type { Level, Mode } from "./types";

/**
 * Gaps and judgment calls, from `context.md` sections 8 and 9.
 *
 * Gaps are findings, not absences to hide. The counts below are read from the
 * catalog rather than written down, so adding a Request pattern removes that
 * gap from the UI without anyone editing this file.
 */

/** A mode with no pattern in it at all. */
export type EmptyMode = {
  mode: Mode;
  /** Places in the catalog that already gesture at the missing pattern. */
  hints: string[];
  /** Responses that exist in the mode but have no pattern carrying them. */
  orphanResponses?: string[];
};

const EMPTY_MODE_DETAIL: Partial<Record<Mode, Omit<EmptyMode, "mode">>> = {
  request: {
    hints: [
      "Authority Gradient's \"Ask first\" level",
      "Credential Boundary's \"Grant temporary access\" control",
    ],
  },
  delegate: {
    hints: [
      "The MCP server's `handoff` call",
      "Authority Gradient's \"Escalate to Director\" row",
    ],
    orphanResponses: ["report back", "refuse", "escalate"],
  },
};

export function emptyModes(): EmptyMode[] {
  return MODE_ORDER.filter((mode) => patternsInMode(mode).length === 0).map(
    (mode) => ({ mode, ...(EMPTY_MODE_DETAIL[mode] ?? { hints: [] }) }),
  );
}

/** A named pattern that should exist inside a mode that is otherwise populated. */
export const MISSING_PATTERNS: Array<{
  name: string;
  mode: Mode;
  description: string;
}> = [
  {
    name: "Negotiate",
    mode: "resolve",
    description:
      "Settling scope or resources before a conflict, rather than reconciling conclusions after one.",
  },
];

/** The threshold under which a level counts as thin. Three of four levels sit at 3. */
const THIN_LEVEL_MAX = 3;

export type ThinLevel = { level: Level; count: number; note: string };

const THIN_LEVEL_NOTE: Partial<Record<Level, string>> = {
  L2: "Almost nothing for agents explaining to each other. Only Source Attribution, and only as provenance.",
  L4: "Only Workshop Card communicates to a group. Nothing tailors what different people see by role.",
};

export function thinLevels(): ThinLevel[] {
  return LEVEL_ORDER.map((level) => ({
    level,
    count: patternsAtLevel(level).length,
  }))
    .filter((entry) => entry.count <= THIN_LEVEL_MAX)
    .map((entry) => ({
      ...entry,
      note: THIN_LEVEL_NOTE[entry.level] ?? "",
    }));
}

/**
 * Where the gaps cluster. Stated as a finding in section 8, and worth repeating
 * in the UI because it is the argument for the new thesis rather than a count.
 */
export const GAP_SUMMARY =
  "Most gaps sit on the engaging side, and at the agents-only level. That is the core of the new thesis: agents communicating with each other is the part we have least of.";

/** Section 9: decided by synthesis, not research. */
export const JUDGMENT_CALLS: Array<{
  id: string;
  question: string;
  /** Pattern ids this touches, where it touches specific ones. */
  patterns: string[];
}> = [
  {
    id: "authority-gradient-mode",
    question:
      "Is Authority Gradient primarily a Declare or a Delegate? It states standing permissions, but the thing it states is an ownership transfer.",
    patterns: ["authority-gradient"],
  },
  {
    id: "credential-boundary-mode",
    question:
      "Is Credential Boundary primarily a Coordinate or a Declare? It partitions access, which is a standing fact, but the pattern is the parallel work it makes possible.",
    patterns: ["credential-boundary"],
  },
  {
    id: "authority-gradient-level",
    question:
      "Is Authority Gradient native to one person in the loop, or to agents only? An autonomy ceiling binds the agent whether or not anyone is watching.",
    patterns: ["authority-gradient"],
  },
  {
    id: "details-dashboard-is-a-pattern",
    question:
      "Is Details Dashboard a communication pattern at all, or a utility surface that happens to show agent state?",
    patterns: ["details-dashboard"],
  },
  {
    id: "triggers-and-level-notes",
    question:
      "Every trigger and every level note was written from a pattern description, not observed. All 23 need validating.",
    patterns: [],
  },
  {
    id: "sdk-channels",
    question:
      "Channels for the SDK components are inferred. The IOC ones come from each page's \"Where it embeds\"; the SDK ones come from nowhere but reading.",
    patterns: [
      "inline-rationale",
      "structured-finding",
      "source-attribution",
      "details-dashboard",
      "capability-manifest",
      "co-editing-surface",
      "workshop-card",
    ],
  },
];

/**
 * Phase 4 stubs: entries that exist in the catalog with no design drawn for
 * them. Checked against the rendering registry, so finishing one and this
 * list disagreeing is a test failure rather than stale prose.
 */
export const NO_DESIGN_YET: Array<{ id: string; note: string }> = [
  {
    id: "certainty-boundary",
    note: "A research pattern with no reference design.",
  },
  {
    id: "disclosure-gradient",
    note: "A research pattern with no reference design.",
  },
  {
    id: "review-as-dialogue",
    note: "A research pattern with no reference design.",
  },
  {
    id: "shared-cognitive-state",
    note: "A research pattern with no reference design.",
  },
  {
    id: "concurrent-workspace-awareness",
    note: "A research pattern with no reference design.",
  },
  {
    id: "decision-record",
    note: "Proposed Commits, the open state, was never drawn, only the sealed one was.",
  },
];

export function modeGapLabel(mode: Mode): string {
  return `No ${MODE_LABEL[mode]} pattern yet`;
}

export function levelGapLabel(level: Level): string {
  return `${LEVEL_LABEL[level]} is thin`;
}
