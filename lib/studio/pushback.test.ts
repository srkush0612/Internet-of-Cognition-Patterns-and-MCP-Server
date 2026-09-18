import { describe, expect, it } from "vitest";
import { acceptRemoval, antiPatternsForRemoval, restoreElement } from "@/lib/studio/pushback";
import type { AntiPattern, Decision } from "@/lib/studio/types";

const antiPatterns: AntiPattern[] = [
  {
    id: "ap-1",
    name: "Confirmation theater",
    status: "proposed",
    description: "Asking for confirmation nobody can actually verify.",
    evidence: "Seen in 4 of 11 interviews.",
    triggeredByElementIds: ["el-required-1"],
  },
];

function baseDecision(): Decision {
  return {
    encounterId: "enc-1",
    patternId: "p-1",
    elementsPresent: ["el-required-1", "el-required-2"],
    elementsRemoved: [],
    state: "answered",
  };
}

describe("antiPatternsForRemoval", () => {
  it("finds the anti-pattern(s) triggered by removing a given element", () => {
    expect(antiPatternsForRemoval("el-required-1", antiPatterns)).toEqual([antiPatterns[0]]);
  });

  it("returns an empty array — not a fabricated one — when no content exists for the element", () => {
    expect(antiPatternsForRemoval("el-required-2", antiPatterns)).toEqual([]);
  });
});

describe("acceptRemoval / restoreElement", () => {
  it("moves the element to removed, records the reason, and flips state to answered_with_gap", () => {
    const next = acceptRemoval(baseDecision(), "el-required-1", "Shipping v1 without it.");
    expect(next.elementsPresent).toEqual(["el-required-2"]);
    expect(next.elementsRemoved).toEqual(["el-required-1"]);
    expect(next.removedElementReasons?.["el-required-1"]).toBe("Shipping v1 without it.");
    expect(next.state).toBe("answered_with_gap");
  });

  it("restoring the only removed element returns state to answered", () => {
    const withGap = acceptRemoval(baseDecision(), "el-required-1", "reason");
    const restored = restoreElement(withGap, "el-required-1");
    expect(restored.elementsPresent).toContain("el-required-1");
    expect(restored.elementsRemoved).toEqual([]);
    expect(restored.removedElementReasons?.["el-required-1"]).toBeUndefined();
    expect(restored.state).toBe("answered");
  });

  it("restoring one of several removed elements keeps the gap state for the rest", () => {
    let d = acceptRemoval(baseDecision(), "el-required-1", "reason 1");
    d = acceptRemoval(d, "el-required-2", "reason 2");
    const restored = restoreElement(d, "el-required-1");
    expect(restored.elementsRemoved).toEqual(["el-required-2"]);
    expect(restored.state).toBe("answered_with_gap");
  });
});
