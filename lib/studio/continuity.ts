import type { ContinuityGap, Decision, Entity, PatternElement } from "@/lib/studio/types";

function entityIdsPresentIn(decision: Decision, patternElements: PatternElement[]): Set<string> {
  const ids = new Set<string>();
  for (const elementId of decision.elementsPresent) {
    const element = patternElements.find((el) => el.id === elementId);
    if (element?.entityId) ids.add(element.entityId);
  }
  return ids;
}

/**
 * Live continuity check: once an entity is placed in one encounter, every
 * other encounter the content team has declared it relevant to
 * (`entity.appearsInEncounterIds`) gets checked. Two distinct findings:
 *   - "not_designed"  — that encounter has no decision at all yet.
 *   - "not_reachable" — that encounter has a decision, but none of its
 *     present elements carry this entity. The harder finding: the encounter
 *     looks done, but the entity silently doesn't survive there.
 * An entity that hasn't been placed anywhere yet produces no gaps — there's
 * nothing to check continuity against.
 */
export function findContinuityGaps(
  entities: Entity[],
  patternElements: PatternElement[],
  decisions: Decision[],
): ContinuityGap[] {
  const decisionByEncounterId = new Map(decisions.map((d) => [d.encounterId, d]));
  const gaps: ContinuityGap[] = [];

  for (const entity of entities) {
    const placedInEncounterIds: string[] = [];
    for (const decision of decisions) {
      if (entityIdsPresentIn(decision, patternElements).has(entity.id)) {
        placedInEncounterIds.push(decision.encounterId);
      }
    }
    if (placedInEncounterIds.length === 0) continue; // not placed anywhere yet — nothing to check

    for (const targetEncounterId of entity.appearsInEncounterIds) {
      if (placedInEncounterIds.includes(targetEncounterId)) continue; // already reachable there

      const targetDecision = decisionByEncounterId.get(targetEncounterId);
      const kind: ContinuityGap["kind"] = targetDecision ? "not_reachable" : "not_designed";

      gaps.push({
        entityId: entity.id,
        sourceEncounterId: placedInEncounterIds[0],
        targetEncounterId,
        kind,
      });
    }
  }

  return gaps;
}
