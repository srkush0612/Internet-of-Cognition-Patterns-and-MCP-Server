import { describe, expect, it } from "vitest";
import { patterns } from "./catalog";
import { HAX_PRINCIPLES, PATTERN_PRINCIPLES, getPatternPrinciples, type PatternPrinciples } from "./principles";

describe("HAX guiding principle links", () => {
  it("covers every catalog pattern, including coming-soon entries", () => {
    expect(Object.keys(PATTERN_PRINCIPLES).sort()).toEqual(patterns.map((pattern) => pattern.id).sort());
    for (const pattern of patterns) expect(getPatternPrinciples(pattern.id).primary.why).toBeTruthy();
  });

  it("uses distinct, known principles and real example patterns", () => {
    const ids = new Set(HAX_PRINCIPLES.map((principle) => principle.id));
    const patternIds = new Set(patterns.map((pattern) => pattern.id));
    for (const principle of HAX_PRINCIPLES) expect(patternIds.has(principle.examplePatternId)).toBe(true);
    for (const assignment of Object.values(PATTERN_PRINCIPLES) as PatternPrinciples[]) {
      expect(ids.has(assignment.primary.id)).toBe(true);
      if (assignment.secondary) {
        expect(ids.has(assignment.secondary.id)).toBe(true);
        expect(assignment.secondary.id).not.toBe(assignment.primary.id);
        expect(assignment.secondary.why).toBeTruthy();
      }
    }
  });
});
