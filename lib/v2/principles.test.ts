import { describe, expect, it } from "vitest";
import { patterns } from "./catalog";
import { HAX_PRINCIPLES, PATTERN_PRINCIPLES, getPatternPrinciples, type PatternPrinciples } from "./principles";
import { getPatternsForPrinciple } from "../v3/principle-catalog";

describe("HAX guiding principle links", () => {
  it("covers every catalog pattern, including coming-soon entries", () => {
    expect(Object.keys(PATTERN_PRINCIPLES).sort()).toEqual(patterns.map((pattern) => pattern.id).sort());
    for (const pattern of patterns) expect(getPatternPrinciples(pattern.id).primary.why).toBeTruthy();
  });

  it("uses distinct, known principles", () => {
    const ids = new Set(HAX_PRINCIPLES.map((principle) => principle.id));
    for (const assignment of Object.values(PATTERN_PRINCIPLES) as PatternPrinciples[]) {
      expect(ids.has(assignment.primary.id)).toBe(true);
      if (assignment.secondary) {
        expect(ids.has(assignment.secondary.id)).toBe(true);
        expect(assignment.secondary.id).not.toBe(assignment.primary.id);
        expect(assignment.secondary.why).toBeTruthy();
      }
    }
  });

  it("lists every assigned pattern on its principle page", () => {
    for (const principle of HAX_PRINCIPLES) {
      const listed = getPatternsForPrinciple(principle.id);
      expect(listed.length).toBeGreaterThan(0);
      expect(new Set(listed.map(({ pattern }) => pattern.id)).size).toBe(listed.length);
      for (const { pattern, relation, why } of listed) {
        const assignment = getPatternPrinciples(pattern.id);
        const connection = relation === "Primary" ? assignment.primary : assignment.secondary;
        expect(connection?.id).toBe(principle.id);
        expect(connection?.why).toBe(why);
      }
    }
  });
});
