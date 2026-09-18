import { describe, expect, it } from "vitest";
import { findContinuityGaps } from "@/lib/studio/continuity";
import type { Decision, Entity, PatternElement } from "@/lib/studio/types";

const entities: Entity[] = [
  { id: "entity-action-item", label: "Action item", appearsInEncounterIds: ["enc-1", "enc-2", "enc-3"] },
];

const patternElements: PatternElement[] = [
  { id: "el-1", patternId: "p-1", label: "Action list", hint: "", required: true, entityId: "entity-action-item" },
  { id: "el-2", patternId: "p-2", label: "Note", hint: "", required: false }, // no entity
];

function decision(overrides: Partial<Decision>): Decision {
  return {
    encounterId: "enc-1",
    patternId: "p-1",
    elementsPresent: [],
    elementsRemoved: [],
    state: "answered",
    ...overrides,
  };
}

describe("findContinuityGaps", () => {
  it("reports nothing for an entity that hasn't been placed anywhere yet", () => {
    const decisions = [decision({ encounterId: "enc-1", elementsPresent: ["el-2"] })];
    expect(findContinuityGaps(entities, patternElements, decisions)).toEqual([]);
  });

  it("flags 'not_designed' when the other encounter has no decision at all", () => {
    const decisions = [decision({ encounterId: "enc-1", elementsPresent: ["el-1"] })];
    const gaps = findContinuityGaps(entities, patternElements, decisions);
    expect(gaps).toContainEqual({
      entityId: "entity-action-item",
      sourceEncounterId: "enc-1",
      targetEncounterId: "enc-2",
      kind: "not_designed",
    });
  });

  it("flags 'not_reachable' (the harder finding) when the other encounter is designed but doesn't carry the entity", () => {
    const decisions = [
      decision({ encounterId: "enc-1", elementsPresent: ["el-1"] }),
      decision({ encounterId: "enc-2", patternId: "p-2", elementsPresent: ["el-2"] }),
    ];
    const gaps = findContinuityGaps(entities, patternElements, decisions);
    expect(gaps).toContainEqual({
      entityId: "entity-action-item",
      sourceEncounterId: "enc-1",
      targetEncounterId: "enc-2",
      kind: "not_reachable",
    });
  });

  it("reports no gap for an encounter where the entity is actually reachable", () => {
    const decisions = [
      decision({ encounterId: "enc-1", elementsPresent: ["el-1"] }),
      decision({ encounterId: "enc-2", elementsPresent: ["el-1"] }),
      decision({ encounterId: "enc-3", elementsPresent: ["el-1"] }),
    ];
    expect(findContinuityGaps(entities, patternElements, decisions)).toEqual([]);
  });
});
