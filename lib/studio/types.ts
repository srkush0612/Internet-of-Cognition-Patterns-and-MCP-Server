import type { BackingStrength } from "@/lib/patterns";

export type { BackingStrength };

/**
 * The three intake questions (Studio home). Topology is unchanged — it
 * changes difficulty, not which situations exist. The other two were
 * reworded: duration conflated "how long" with "is anyone watching," and
 * those come apart — an hour-long run someone is watching is a different
 * risk than ten unattended seconds at 3am.
 */
export type Topology = "single" | "handoff" | "orchestrated";
/** "Is someone watching while it works?" */
export type Attendance = "watched" | "sometimes" | "unattended";
/** "Can it do things you cannot take back?" */
export type Irreversibility = "no" | "some" | "yes";

export const TOPOLOGY_LABEL: Record<Topology, string> = {
  single: "One agent",
  handoff: "A few, handing off",
  orchestrated: "Many, orchestrated",
};

export const ATTENDANCE_LABEL: Record<Attendance, string> = {
  watched: "Yes, they are in it",
  sometimes: "Sometimes",
  unattended: "No, they find out afterwards",
};

export const IRREVERSIBILITY_LABEL: Record<Irreversibility, string> = {
  no: "No",
  some: "Some",
  yes: "Yes",
};

/** Map state — derived from whether a Decision exists and whether it has a gap. */
export type SituationState = "unanswered" | "answered" | "answered_with_gap";

/**
 * At-risk is a deterministic lookup over the scenario's attendance/
 * irreversibility answers only (per the intake screen's own "these two
 * decide risk" copy) — not inferred, not touching the chosen pattern.
 */
export type RiskRule = {
  attendances: Attendance[];
  irreversibilities: Irreversibility[];
};

/**
 * A note that appears on a situation only under certain scenario answers, so
 * the intake questions visibly change something. Content-authored with a
 * `cites` line, never inferred: the code reads the condition and shows the
 * label, and has no opinion about which situations deserve one.
 */
export type SituationTension = {
  attendances?: Attendance[];
  irreversibilities?: Irreversibility[];
  topologies?: Topology[];
  label: string;
  cites: string;
};

/**
 * The fixed situation list. Content-authored (content/studio/situations.json) —
 * never invented by code. `patternIds` is many-to-many with the real pattern
 * library (by slug); a situation with an empty list is a library gap, not an error.
 */
export type Situation = {
  id: string;
  order: number;
  /** Two-digit label the agent and the canvas both refer to it by. */
  number: string;
  title: string;
  /** The concrete moment, shown under the title. */
  moment: string;
  /** Plain language: what shaping this situation answers. */
  answers: string;
  example: string;
  patternIds: string[];
  riskRule?: RiskRule;
  difficultyNotes?: Partial<Record<Topology, string>>;
  tensions?: SituationTension[];
};

/** A required/optional slot a pattern needs in the interface, per pattern. */
export type PatternElement = {
  id: string;
  patternId: string;
  label: string;
  hint: string;
  required: boolean;
  entityId?: string;
  evidence?: string;
  backingStrength?: BackingStrength;
  /** Real participant count/description from the library, where it has one (e.g. "3"). */
  participants?: string;
  /** Marker number shown on the embedded component overlay. */
  markerNumber?: number;
  /**
   * How PatternEmbed locates this element's real DOM node inside the
   * component it renders untouched — an exact (trimmed) text match against
   * a rendered node's textContent.
   */
  domMatchText?: string;
};

/**
 * A named failure mode reintroduced by removing a required element.
 * `status` matters because no anti-pattern vocabulary exists in the library
 * yet — every entry ships `"proposed"` until the research backs a name.
 */
export type AntiPattern = {
  id: string;
  name: string;
  status: "proposed" | "in-library";
  description: string;
  evidence: string;
  triggeredByElementIds: string[];
};

/**
 * Something continuity-checking follows across situations — a plan, an
 * action item, a decision, a permission grant.
 */
export type Entity = {
  id: string;
  label: string;
  appearsInSituationIds: string[];
  /**
   * The element whose value is the entity's value. Where a later situation
   * also declares this entity, that value is shown there as carried, read
   * only, with a pointer back to the situation that owns it.
   */
  sourceElementId?: string;
};

/** One situation's resolution within a scenario. */
export type Decision = {
  situationId: string;
  patternId: string;
  reasoning?: string;
  elementsPresent: string[];
  elementsRemoved: string[];
  /** Required reason per removed *required* element — the pushback record. */
  removedElementReasons?: Record<string, string>;
  state: "answered" | "answered_with_gap";
};

export type Scenario = {
  id: string;
  name: string;
  description: string;
  topology: Topology;
  attendance: Attendance;
  irreversibility: Irreversibility;
  isSample?: boolean;
  readOnly?: boolean;
  decisions: Decision[];
  /**
   * What the person has written into each situation, keyed by situation id.
   *
   * For a pattern with an edit schema in lib/editable-fields.ts this is that
   * schema's workspace shape, passed straight to the live component through
   * `resolveLivePreview` — the same pipeline the playground and the pattern
   * pages already use, not a second one built for Studio.
   */
  workspaces?: Record<string, Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
};

/** A continuity gap — the harder finding is `not_reachable`, not `not_designed`. */
export type ContinuityGap = {
  entityId: string;
  sourceSituationId: string;
  targetSituationId: string;
  kind: "not_designed" | "not_reachable";
};

/* ------------------------------------------------------------------------ *
 * The agent pane's script
 *
 * There are no model calls in this build. A typed question is matched
 * against these entries by keyword; an unmatched one gets the honest
 * fallback. Content lives in content/studio/agent-script.json and is
 * unverified placeholder copy, with a `cites` line on every claim that
 * leans on the library.
 * ------------------------------------------------------------------------ */

/** What picking an option actually does. Nothing happens until one is picked. */
export type AgentEffect =
  | { kind: "note" }
  | { kind: "open"; situationId: string }
  | { kind: "recordDecision"; note: string }
  | { kind: "acceptGap"; elementId: string; reason: string }
  /** The reason comes from the person, so the option cannot be taken without one. */
  | { kind: "acceptGapWithReason"; elementId: string; situationId: string };

export type AgentOption = {
  label: string;
  /** Stated on the option itself: what choosing it commits the person to. */
  commits: string;
  /** Exactly one option per recommendation carries this. */
  best?: boolean;
  applies?: AgentEffect;
  /**
   * When set, the option collects a written reason before it can be taken.
   * Accepting a gap goes through this: an accepted gap with no reason on it is
   * the thing the pushback exists to prevent.
   */
  reasonPrompt?: string;
};

export type AgentProposal = {
  head: string;
  why: string;
  cites?: string;
  options: AgentOption[];
};

export type AgentScriptQuestion = {
  id: string;
  /** "*" for scenario-wide, otherwise the situation id it belongs to. */
  scope: string;
  keywords: string[];
  question: string;
  answer?: string;
  cites?: string;
  /** Answer generated from the library instead of authored. */
  computed?: "coverage";
  /** Opens this situation on the canvas when the answer lands. */
  opens?: string;
  /**
   * Situations this answer's own wording refers to. Declared rather than
   * detected, so that hiding a situation retires the answers that talk about
   * it instead of leaving them pointing at nothing.
   */
  mentions?: string[];
  recommendation?: AgentProposal;
  /** A refusal renders like a recommendation, and never carries out the ask. */
  refusal?: AgentProposal;
};

export type AgentScript = {
  unverified: boolean;
  note: string;
  opening: string;
  fallback: string;
  questions: AgentScriptQuestion[];
};

import type { PatternExplanation } from "@/lib/studio/agent";

/** One turn in the thread. */
export type ThreadMessage =
  | { id: string; from: "person"; text: string }
  | {
      id: string;
      from: "agent";
      kind: "answer";
      text: string;
      cites?: string;
      opens?: string;
    }
  | {
      id: string;
      from: "agent";
      kind: "recommendation" | "refusal";
      questionId: string;
      proposal: AgentProposal;
      /** Index of the option taken; undefined until the person picks. */
      taken?: number;
    }
  | { id: string; from: "agent"; kind: "confirmation"; text: string }
  /** Why a pattern is the match, in parts rather than one paragraph. */
  | {
      id: string;
      from: "agent";
      kind: "explanation";
      explanation: PatternExplanation;
    };

/**
 * How much of a situation Studio can actually offer, worked out from the
 * code rather than asserted. See lib/studio/shapeability.ts.
 */
export type Shapeability =
  /** Live component plus an edit schema: editing a field updates it. */
  | "editable"
  /** Live component plus authored element detail, annotated in place. */
  | "annotated"
  /** In the library with its write-up, but no element detail to shape. */
  | "matched_only";
