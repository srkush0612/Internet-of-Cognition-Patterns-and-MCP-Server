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
 * Live continuity check: once an entity is placed in one situation, every
 * other situation the content team has declared it relevant to
 * (`entity.appearsInSituationIds`) gets checked. Two distinct findings:
 *   - "not_designed"  — that situation has no decision at all yet.
 *   - "not_reachable" — that situation has a decision, but none of its
 *     present elements carry this entity. The harder finding: the situation
 *     looks done, but the entity silently doesn't survive there.
 * An entity that hasn't been placed anywhere yet produces no gaps — there's
 * nothing to check continuity against.
 */
export function findContinuityGaps(
  entities: Entity[],
  patternElements: PatternElement[],
  decisions: Decision[],
): ContinuityGap[] {
  const decisionBySituationId = new Map(decisions.map((d) => [d.situationId, d]));
  const gaps: ContinuityGap[] = [];

  for (const entity of entities) {
    const placedInSituationIds: string[] = [];
    for (const decision of decisions) {
      if (entityIdsPresentIn(decision, patternElements).has(entity.id)) {
        placedInSituationIds.push(decision.situationId);
      }
    }
    if (placedInSituationIds.length === 0) continue; // not placed anywhere yet — nothing to check

    for (const targetSituationId of entity.appearsInSituationIds) {
      if (placedInSituationIds.includes(targetSituationId)) continue; // already reachable there

      const targetDecision = decisionBySituationId.get(targetSituationId);
      const kind: ContinuityGap["kind"] = targetDecision ? "not_reachable" : "not_designed";

      gaps.push({
        entityId: entity.id,
        sourceSituationId: placedInSituationIds[0],
        targetSituationId,
        kind,
      });
    }
  }

  return gaps;
}
