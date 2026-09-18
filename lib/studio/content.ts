import situationsJson from "@/content/studio/situations.json";
import patternElementsJson from "@/content/studio/pattern-elements.json";
import antiPatternsJson from "@/content/studio/anti-patterns.json";
import entitiesJson from "@/content/studio/entities.json";
import sampleScenarioJson from "@/content/studio/sample-scenario.json";
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
