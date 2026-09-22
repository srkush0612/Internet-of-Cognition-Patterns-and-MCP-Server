import { describe, expect, it } from "vitest";
import { PATTERN_EDITABLE_FIELDS } from "@/lib/editable-fields";
import { situations } from "@/lib/studio/content";
import {
  isShapeable,
  missingDetailReason,
  shapeabilityOf,
} from "@/lib/studio/shapeability";

describe("shapeabilityOf", () => {
  it("prefers authored element detail over the edit schema", () => {
    // signal-to-intent-handshake is the only pattern with element detail in
    // content/studio/pattern-elements.json.
    expect(shapeabilityOf("signal-to-intent-handshake", true)).toBe("annotated");
  });

  it("is editable when there is a component and an edit schema", () => {
    expect(PATTERN_EDITABLE_FIELDS["decision-ledger"]).toBeDefined();
    expect(shapeabilityOf("decision-ledger", true)).toBe("editable");
  });

  it("is matched only when the component is missing, schema or not", () => {
    expect(shapeabilityOf("decision-ledger", false)).toBe("matched_only");
  });

  it("is matched only when the library has neither", () => {
    expect(PATTERN_EDITABLE_FIELDS["certainty-boundary"]).toBeUndefined();
    expect(shapeabilityOf("certainty-boundary", false)).toBe("matched_only");
  });

  it("treats both shapeable states as shapeable", () => {
    expect(isShapeable("editable")).toBe(true);
    expect(isShapeable("annotated")).toBe(true);
    expect(isShapeable("matched_only")).toBe(false);
  });
});

describe("missingDetailReason", () => {
  it("distinguishes no component from no element detail", () => {
    expect(missingDetailReason("certainty-boundary", false)).toContain(
      "no reference design built yet",
    );
    expect(missingDetailReason("authority-gradient", true)).toContain(
      "no element detail has been published",
    );
  });
});

describe("the seeded situations", () => {
  it("maps every situation to exactly one pattern", () => {
    for (const situation of situations) {
      expect(
        situation.patternIds.length,
        `${situation.number} ${situation.title}`,
      ).toBe(1);
    }
  });

  it("gives every situation a moment and a plain-language answer", () => {
    for (const situation of situations) {
      expect(situation.moment, situation.id).toBeTruthy();
      expect(situation.answers, situation.id).toBeTruthy();
    }
  });

  it("keeps the copy free of em and en dashes", () => {
    for (const situation of situations) {
      const copy = `${situation.title} ${situation.moment} ${situation.answers} ${situation.example}`;
      expect(copy, situation.id).not.toMatch(/[—–]/);
    }
  });

  it("cites a source for every scenario tension", () => {
    for (const situation of situations) {
      for (const tension of situation.tensions ?? []) {
        expect(tension.cites, `${situation.id}: ${tension.label}`).toBeTruthy();
      }
    }
  });
});
