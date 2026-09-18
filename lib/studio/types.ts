import type { BackingStrength } from "@/lib/patterns";

export type { BackingStrength };

/**
 * The three intake questions (Studio home). Topology is unchanged — it
 * changes difficulty, not which encounters exist. The other two were
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
export type EncounterState = "unanswered" | "answered" | "answered_with_gap";

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
 * The fixed encounter list. Content-authored (content/studio/encounters.json) —
 * never invented by code. `patternIds` is many-to-many with the real pattern
 * library (by slug); an encounter with an empty list is a library gap, not an error.
 */
export type Encounter = {
  id: string;
  order: number;
  title: string;
  example: string;
  patternIds: string[];
  riskRule?: RiskRule;
  difficultyNotes?: Partial<Record<Topology, string>>;
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
 * Something continuity-checking follows across encounters — a plan, an
 * action item, a decision, a permission grant.
 */
export type Entity = {
  id: string;
  label: string;
  appearsInEncounterIds: string[];
};

/** One encounter's resolution within a scenario. */
export type Decision = {
  encounterId: string;
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
  createdAt: string;
  updatedAt: string;
};

/** A continuity gap — the harder finding is `not_reachable`, not `not_designed`. */
export type ContinuityGap = {
  entityId: string;
  sourceEncounterId: string;
  targetEncounterId: string;
  kind: "not_designed" | "not_reachable";
};
