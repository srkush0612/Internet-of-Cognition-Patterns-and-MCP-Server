import { describe, expect, it } from "vitest";
import { findContinuityGaps } from "@/lib/studio/continuity";
import type { Decision, Entity, PatternElement } from "@/lib/studio/types";

const entities: Entity[] = [
  { id: "entity-action-item", label: "Action item", appearsInSituationIds: ["sit-1", "sit-2", "sit-3"] },
];

const patternElements: PatternElement[] = [
  { id: "el-1", patternId: "p-1", label: "Action list", hint: "", required: true, entityId: "entity-action-item" },
  { id: "el-2", patternId: "p-2", label: "Note", hint: "", required: false }, // no entity
];

function decision(overrides: Partial<Decision>): Decision {
  return {
    situationId: "sit-1",
    patternId: "p-1",
    elementsPresent: [],
    elementsRemoved: [],
    state: "answered",
    ...overrides,
  };
}

describe("findContinuityGaps", () => {
  it("reports nothing for an entity that hasn't been placed anywhere yet", () => {
    const decisions = [decision({ situationId: "sit-1", elementsPresent: ["el-2"] })];
    expect(findContinuityGaps(entities, patternElements, decisions)).toEqual([]);
  });

  it("flags 'not_designed' when the other situation has no decision at all", () => {
    const decisions = [decision({ situationId: "sit-1", elementsPresent: ["el-1"] })];
    const gaps = findContinuityGaps(entities, patternElements, decisions);
    expect(gaps).toContainEqual({
      entityId: "entity-action-item",
      sourceSituationId: "sit-1",
      targetSituationId: "sit-2",
      kind: "not_designed",
    });
  });

  it("flags 'not_reachable' (the harder finding) when the other situation is designed but doesn't carry the entity", () => {
    const decisions = [
      decision({ situationId: "sit-1", elementsPresent: ["el-1"] }),
      decision({ situationId: "sit-2", patternId: "p-2", elementsPresent: ["el-2"] }),
    ];
    const gaps = findContinuityGaps(entities, patternElements, decisions);
    expect(gaps).toContainEqual({
      entityId: "entity-action-item",
      sourceSituationId: "sit-1",
      targetSituationId: "sit-2",
      kind: "not_reachable",
    });
  });

  it("reports no gap for a situation where the entity is actually reachable", () => {
    const decisions = [
      decision({ situationId: "sit-1", elementsPresent: ["el-1"] }),
      decision({ situationId: "sit-2", elementsPresent: ["el-1"] }),
      decision({ situationId: "sit-3", elementsPresent: ["el-1"] }),
    ];
    expect(findContinuityGaps(entities, patternElements, decisions)).toEqual([]);
  });
});
