import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { PATTERN_EDITABLE_FIELDS } from "@/lib/editable-fields";
import {
  situations,
  surfaceContent,
  surfaceDefinitions,
  surfacesForPattern,
  surfaceState,
  visibleSituations,
} from "@/lib/studio/content";
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


describe("surfaces", () => {
  it("names every surface a pattern claims", () => {
    const ids = surfaceDefinitions.map((surface) => surface.id);
    for (const entry of surfaceContent.patterns) {
      expect(ids, entry.patternId).toContain(entry.inContextSurface);
      for (const surface of Object.keys(entry.notHere)) {
        expect(ids, `${entry.patternId}: ${surface}`).toContain(surface);
      }
    }
  });

  it("offers only host surfaces, with no bare-component view", () => {
    expect(surfaceDefinitions.map((surface) => surface.id)).toEqual([
      "thread",
      "space",
      "console",
    ]);
  });

  it("calls the pattern's own surface built, and the others not built", () => {
    for (const entry of surfaceContent.patterns) {
      expect(surfaceState(entry.patternId, entry.inContextSurface, true)).toBe(
        "built",
      );

      const others = surfaceDefinitions
        .map((surface) => surface.id)
        .filter((id) => id !== entry.inContextSurface);
      for (const id of others) {
        const expected = entry.notHere[id] ? "not_here" : "not_built";
        expect(
          surfaceState(entry.patternId, id, true),
          `${entry.patternId} on ${id}`,
        ).toBe(expected);
      }
    }
  });

  it("does not call a surface built when the component is missing", () => {
    const entry = surfaceContent.patterns[0];
    expect(surfaceState(entry.patternId, entry.inContextSurface, false)).toBe(
      "not_built",
    );
  });

  it("gives a reason with every not-here, since that is a judgement", () => {
    for (const entry of surfaceContent.patterns) {
      for (const [surface, reason] of Object.entries(entry.notHere)) {
        expect(reason, `${entry.patternId}: ${surface}`).toBeTruthy();
      }
    }
  });

  it("is marked unverified, like the rest of the seeded content", () => {
    expect(surfaceContent.unverified).toBe(true);
  });
});

/**
 * Read from the registry's source rather than imported: it is a .tsx module
 * and importing JSX into a .ts test fails to transform. Reading the file keeps
 * the assertion against the real source of truth without pulling React in.
 */
function registeredHostComponents(): Set<string> {
  const source = readFileSync(
    "components/patterns/pattern-registry.tsx",
    "utf8",
  );
  const block = source.split("PATTERN_INBOX:")[1]?.split("};")[0] ?? "";
  return new Set([...block.matchAll(/"([a-z-]+)":/g)].map((m) => m[1]));
}

describe("surface coverage against the registry", () => {
  const hosts = registeredHostComponents();

  it("reads the registry, so the rest of this block means something", () => {
    expect(hosts.size).toBeGreaterThan(5);
  });

  // The gap this caught: turning SHOW_NOT_READY_PATTERNS on revealed two
  // patterns with an in-context component and no surface entry, so the strip
  // said not built on every surface while the stage rendered the component.
  it("has an entry for every situation pattern that has a host component", () => {
    for (const situation of situations) {
      const patternId = situation.patternIds[0];
      if (!patternId || !hosts.has(patternId)) continue;
      expect(
        surfacesForPattern(patternId),
        `${patternId} has a host component but no surface entry`,
      ).toBeDefined();
    }
  });

  it("claims a surface only where the component backs it", () => {
    for (const entry of surfaceContent.patterns) {
      expect(
        hosts.has(entry.patternId),
        `${entry.patternId} claims ${entry.inContextSurface} with no component`,
      ).toBe(true);
    }
  });
});
