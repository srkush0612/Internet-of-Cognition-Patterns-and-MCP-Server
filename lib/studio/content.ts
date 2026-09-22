import situationsJson from "@/content/studio/situations.json";
import patternElementsJson from "@/content/studio/pattern-elements.json";
import antiPatternsJson from "@/content/studio/anti-patterns.json";
import entitiesJson from "@/content/studio/entities.json";
import sampleScenarioJson from "@/content/studio/sample-scenario.json";
import { isPatternReady } from "@/lib/pattern-ready";
import type {
  AntiPattern,
  Entity,
  PatternElement,
  Scenario,
  Situation,
} from "@/lib/studio/types";

/**
 * The only place Studio content is read from. Every list here ships empty
 * until a content team fills in content/studio/*.json (see the README
 * there) — nothing in this module fabricates a value when a file is empty.
 *
 * There is no worked-example content here on purpose: the canvas embeds each
 * pattern's own live component (components/patterns/pattern-registry.tsx)
 * instead of an authored example, so there's nothing to seed for it.
 */
export const situations: Situation[] = [...(situationsJson as Situation[])].sort(
  (a, b) => a.order - b.order,
);

/**
 * Whether to show situations whose pattern the library has not flagged ready.
 *
 * Set to false for now, which hides three of the nine: 02 (Signal-to-Intent
 * Handshake), 03 (Certainty Boundary) and 07 (Background Work Ledger). Note
 * what goes with them, because it is not obvious: 02 is the only situation
 * with authored element detail, so hiding it also takes away the annotated
 * canvas, the refusal flow on a required element, and the only entity that
 * carries between situations. Flip this to true to get all nine back.
 *
 * Readiness is the library's own flag (lib/pattern-ready.ts). Nothing here
 * decides that a pattern is ready, and a situation with no pattern matched
 * stays visible, because an unmatched situation is a finding.
 */
export const SHOW_NOT_READY_PATTERNS = false;

export const visibleSituations: Situation[] = SHOW_NOT_READY_PATTERNS
  ? situations
  : situations.filter((situation) =>
      situation.patternIds.every((patternId) => isPatternReady(patternId)),
    );

export const patternElements: PatternElement[] = patternElementsJson as PatternElement[];

export const antiPatterns: AntiPattern[] = antiPatternsJson as AntiPattern[];

export const entities: Entity[] = entitiesJson as Entity[];

/** null until content/studio/sample-scenario.json is authored. */
export const sampleScenario: Scenario | null = sampleScenarioJson as Scenario | null;

export function getSituation(id: string): Situation | undefined {
  return situations.find((s) => s.id === id);
}

export function elementsForPattern(patternId: string): PatternElement[] {
  return patternElements.filter((el) => el.patternId === patternId);
}

export function antiPatternsForElement(elementId: string): AntiPattern[] {
  return antiPatterns.filter((ap) => ap.triggeredByElementIds.includes(elementId));
}

export function getElement(id: string): PatternElement | undefined {
  return patternElements.find((el) => el.id === id);
}

export function getEntity(id: string): Entity | undefined {
  return entities.find((e) => e.id === id);
}

/**
 * A situation's `answers` field is a fragment, authored to complete the stem
 * "what this answers". Dropped into a sentence it reads as broken copy:
 * "Shaping it answers make it clear who is working and on what". This is the
 * only place that turns it into a sentence, so there is one thing to fix if the
 * wording of the field ever changes.
 */
/**
 * A situation's `answers` field, for rendering after a label and never inside
 * a sentence.
 *
 * The fragments are not one grammatical shape. Some are verb phrases ("make it
 * clear who is working"), some are conditional clauses ("when two agents
 * disagree, show how the answer was reached"), some carry their own subject
 * ("the agent says why it chose an action"), and one is a noun phrase ("a
 * short surface, with the detail one level down"). Any stem put in front of
 * them breaks on most of them: "situation 3 has to when two agents disagree"
 * was shipped and read as nonsense. After a label and a colon they all work,
 * because that is what they were written to follow.
 */
export function answersFragment(situation: Situation): string {
  return situation.answers;
}

/**
 * What the interface calls a situation: its position in the list on screen,
 * counting from one.
 *
 * `situation.number` is the label the content file authored, so with some
 * situations filtered out the screen showed 01, 04, 05, 06, 08, 09, which
 * reads as arbitrary. Everything the person sees uses this instead, and the
 * content keeps its own numbering.
 */
export function displayNumber(situation: Situation): number {
  const index = visibleSituations.findIndex(
    (candidate) => candidate.id === situation.id,
  );
  return index === -1 ? situation.order : index + 1;
}
