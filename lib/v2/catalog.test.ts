import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { patterns as v1Patterns } from "@/lib/patterns";
import { CO_EDITING_VARIANTS, patterns } from "./catalog";
import { emptyModes, thinLevels, JUDGMENT_CALLS, NO_DESIGN_YET } from "./gaps";
import { AUDIENCES, CHIP_OUTCOMES, HAX_SCENE, SETUPS } from "./homepage";
import {
  AUDIENCE_ORDER,
  CHANNEL_ORDER,
  LEVEL_ORDER,
  channelsForLevel,
} from "./levels";
import { MODE_ORDER, MODE_VERB, getMode, modes } from "./modes";
import { composeSpec, matchingPatterns, specFromPattern } from "./spec";
import type { Evidence, Level, Mode } from "./types";

/**
 * The validation step from `context.md` section 13, phase 1, step 5, plus the
 * counts the document states in section 7. The counts are the useful part: if
 * a pattern's mode or level is edited by hand, one of these fails rather than
 * the catalog quietly disagreeing with the document it came from.
 */

/** Section 7, "Counts by primary mode". */
const EXPECTED_MODE_COUNTS: Record<Mode, number> = {
  declare: 3,
  signal: 5,
  // Explain is 5 / Resolve 1, not the 4 / 2 in context.md §7: Assumption
  // Surface was corrected from Resolve to Explain to match its vetted v1
  // page, which has no adopt/reject.
  explain: 5,
  request: 0,
  propose: 2,
  delegate: 0,
  coordinate: 5,
  resolve: 1,
  commit: 2,
};

/** Section 7 counts, with Capability Manifest moved to One agent to match its SDK definition. */
const EXPECTED_LEVEL_COUNTS: Record<Level, number> = {
  L1: 9,
  L2: 2,
  L3: 9,
  L4: 3,
};

const EVIDENCE_VALUES: Evidence[] = [
  "strong",
  "moderate",
  "thin",
  "none",
  "not_rated",
];

describe("v2 catalog", () => {
  it("holds the 23 patterns the document deduplicated 33 originals into", () => {
    expect(patterns).toHaveLength(23);
  });

  it("has unique ids, all kebab-case", () => {
    const ids = patterns.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("references only modes that exist", () => {
    for (const pattern of patterns) {
      expect(MODE_ORDER).toContain(pattern.mode.primary);
      if (pattern.mode.secondary) {
        expect(MODE_ORDER).toContain(pattern.mode.secondary);
        expect(pattern.mode.secondary).not.toBe(pattern.mode.primary);
      }
    }
  });

  it("gives every pattern a note for its own primary level", () => {
    for (const pattern of patterns) {
      expect(
        pattern.level.notes[pattern.level.primary],
        `${pattern.id} has no note for its primary level`,
      ).toBeTruthy();
    }
  });

  it("only notes levels that exist", () => {
    for (const pattern of patterns) {
      for (const level of Object.keys(pattern.level.notes)) {
        expect(LEVEL_ORDER).toContain(level as Level);
      }
    }
  });

  it("uses only known channels, audiences and evidence values", () => {
    for (const pattern of patterns) {
      expect(pattern.channels.length).toBeGreaterThan(0);
      for (const channel of pattern.channels)
        expect(CHANNEL_ORDER).toContain(channel);
      expect(pattern.audience.length).toBeGreaterThan(0);
      for (const audience of pattern.audience)
        expect(AUDIENCE_ORDER).toContain(audience);
      expect(EVIDENCE_VALUES).toContain(pattern.evidence);
    }
  });

  it("points composes_with and conflicts_with at real patterns", () => {
    const ids = new Set(patterns.map((p) => p.id));
    for (const pattern of patterns) {
      for (const other of [...pattern.composes_with, ...pattern.conflicts_with]) {
        expect(ids, `${pattern.id} points at ${other}`).toContain(other);
      }
    }
  });

  it("matches the per-mode counts stated in section 7", () => {
    for (const mode of MODE_ORDER) {
      const count = patterns.filter((p) => p.mode.primary === mode).length;
      expect(count, `primary mode ${mode}`).toBe(EXPECTED_MODE_COUNTS[mode]);
    }
  });

  it("matches the per-level counts stated in section 7", () => {
    for (const level of LEVEL_ORDER) {
      const count = patterns.filter((p) => p.level.primary === level).length;
      expect(count, `primary level ${level}`).toBe(EXPECTED_LEVEL_COUNTS[level]);
    }
  });

  it("writes every spec sentence in the template's shape, with its own verb", () => {
    for (const pattern of patterns) {
      expect(pattern.spec, pattern.id).toMatch(/^When /);
      expect(pattern.spec, pattern.id).toContain(
        MODE_VERB[pattern.mode.primary],
      );
      expect(pattern.spec, pattern.id).toContain("through");
      expect(pattern.spec, pattern.id).toContain("expects");
      expect(pattern.spec, pattern.id).toMatch(/\.$/);
    }
  });

  it("records where every pattern came from", () => {
    for (const pattern of patterns) {
      expect(pattern.merged_from.length, pattern.id).toBeGreaterThan(0);
    }
  });

  it("gives SDK-sourced patterns a component and IOC-only patterns none", () => {
    for (const pattern of patterns) {
      const hasComponent = Boolean(pattern.implementation?.sdk_component);
      expect(hasComponent, pattern.id).toBe(pattern.source !== "ioc");
    }
  });

  it("points v1_slugs at patterns that are actually in the v1 library", () => {
    const v1 = new Set(v1Patterns.map((p) => p.slug));
    for (const pattern of patterns) {
      for (const slug of pattern.v1_slugs) {
        expect(v1, `${pattern.id} → ${slug}`).toContain(slug);
      }
    }
  });

  it("accounts for all 17 v1 patterns exactly once", () => {
    const claimed = patterns.flatMap((p) => p.v1_slugs);
    expect(new Set(claimed).size).toBe(claimed.length);
    expect(claimed.sort()).toEqual(v1Patterns.map((p) => p.slug).sort());
  });

  it("keeps the six Co-Editing components as variants of one pattern", () => {
    const coEditing = patterns.find((p) => p.id === "co-editing-surface");
    expect(coEditing?.merged_from).toHaveLength(CO_EDITING_VARIANTS.length);
  });
});

describe("the homepage", () => {
  const ids = new Set(patterns.map((p) => p.id));

  it("names only patterns that exist, in every scene and answer", () => {
    for (const line of HAX_SCENE) {
      expect(ids, `scene line ${line.actor}`).toContain(line.patternId);
    }
    for (const audience of AUDIENCES) {
      for (const entry of audience.answer) {
        expect(ids, `${audience.id} answer`).toContain(entry.patternId);
      }
    }
  });

  it("offers exactly the replies Pre-Action Handshake expects", () => {
    // The scene's chips are the one place the homepage states what a reader
    // can send back, so they have to be the pattern's real responses.
    const handshake = patterns.find((p) => p.id === "pre-action-handshake");
    const expected = handshake?.responses ?? getMode("propose").responses;
    expect(CHIP_OUTCOMES.map((chip) => chip.label)).toEqual(expected);
  });

  it("covers all four setups, one per level", () => {
    expect(SETUPS.map((setup) => setup.level)).toEqual(LEVEL_ORDER);
  });
});

describe("v2 modes", () => {
  it("defines all nine, each with responses and a distinction", () => {
    expect(modes).toHaveLength(9);
    for (const mode of modes) {
      expect(mode.responses.length).toBeGreaterThan(0);
      expect(mode.not_to_confuse_with.mode).not.toBe(mode.id);
      expect(MODE_ORDER).toContain(mode.not_to_confuse_with.mode);
    }
  });

  it("splits into the two families the document names", () => {
    const presenting = modes.filter((m) => m.family === "presenting");
    const engaging = modes.filter((m) => m.family === "engaging");
    expect(presenting.map((m) => m.id)).toEqual([
      "declare",
      "signal",
      "explain",
    ]);
    expect(engaging).toHaveLength(6);
  });
});

describe("v2 gaps", () => {
  it("reads the empty modes off the catalog rather than hardcoding them", () => {
    expect(emptyModes().map((gap) => gap.mode)).toEqual([
      "request",
      "delegate",
    ]);
  });

  it("names the three thin levels and leaves the two populated ones out", () => {
    const thin = thinLevels().map((entry) => entry.level);
    expect(thin).toContain("L2");
    expect(thin).toContain("L4");
    expect(thin).not.toContain("L1");
    expect(thin).not.toContain("L3");
  });

  it("points every judgment call at patterns that exist", () => {
    const ids = new Set(patterns.map((p) => p.id));
    for (const call of JUDGMENT_CALLS) {
      for (const id of call.patterns) expect(ids, call.id).toContain(id);
    }
  });
});

describe("the behavior spec", () => {
  it("rebuilds a complete sentence from any pattern in the catalog", () => {
    for (const pattern of patterns) {
      const { missing, sentence } = composeSpec(specFromPattern(pattern));
      expect(missing, pattern.id).toEqual([]);
      expect(sentence, pattern.id).toMatch(/^When .+\.$/);
    }
  });

  it("names the slots still empty rather than filling them in", () => {
    const { missing, sentence } = composeSpec({
      trigger: "",
      mode: "propose",
      audience: null,
      level: "L3",
      channel: null,
      responses: getMode("propose").responses,
    });
    expect(missing.sort()).toEqual(["audience", "channel", "trigger"]);
    expect(sentence).toBeNull();
  });

  it("finds nothing for a mode with no pattern in it", () => {
    for (const mode of ["request", "delegate"] as Mode[]) {
      const found = matchingPatterns(
        { ...specFromPattern(patterns[0]), mode, level: null, channel: null, audience: null },
        patterns,
      );
      expect(found, mode).toEqual([]);
    }
  });

  it("offers an agents-only exchange no human-facing channel", () => {
    expect(channelsForLevel("L2")).toEqual([
      "agent_message",
      "shared_record",
      "state_signal",
    ]);
  });
});

describe("v1 designs reachable from v2", () => {
  /**
   * The registry is read as source rather than imported: it pulls in .tsx
   * components and vitest has no JSX transform configured here. Reading it
   * still catches the failure that matters, a rename quietly dropping the
   * link between a v2 pattern and the design already drawn for it.
   */
  const registry = readFileSync(
    new URL("../../components/patterns/pattern-registry.tsx", import.meta.url),
    "utf8",
  );
  const keysIn = (block: string) => {
    const start = registry.indexOf(`export const ${block}`);
    const end = registry.indexOf("};", start);
    return new Set(
      [...registry.slice(start, end).matchAll(/"([a-z-]+)":/g)].map((m) => m[1]),
    );
  };
  const standalone = keysIn("PATTERN_STANDALONE");
  const inbox = keysIn("PATTERN_INBOX");

  it("reaches a drawn design for twelve of the twenty-three patterns", () => {
    const reached = patterns
      .filter((p) => p.v1_slugs.some((s) => standalone.has(s) || inbox.has(s)))
      .map((p) => p.id)
      .sort();
    expect(reached).toEqual([
      "activity-record",
      "assumption-surface",
      "authority-gradient",
      "convergence-point",
      "credential-boundary",
      "decision-record",
      "deferred-detail",
      "lineage-view",
      "memory-commitment-review",
      "pre-action-handshake",
      "presence-boundary",
    ]);
  });

  it("keeps every renamed pattern pointing at the slug its design is filed under", () => {
    const renamed: Array<[string, string]> = [
      ["pre-action-handshake", "signal-to-intent-handshake"],
      ["lineage-view", "dependency-and-lineage-view"],
      ["activity-record", "background-work-ledger"],
      ["decision-record", "decision-ledger"],
    ];
    for (const [id, slug] of renamed) {
      const pattern = patterns.find((p) => p.id === id);
      expect(pattern?.v1_slugs, id).toContain(slug);
      expect(standalone.has(slug) || inbox.has(slug), slug).toBe(true);
    }
  });

  it("leaves no design stranded: every drawn slug is claimed by a pattern", () => {
    const claimed = new Set(patterns.flatMap((p) => p.v1_slugs));
    for (const slug of [...standalone, ...inbox]) {
      expect(claimed, `${slug} has a design but no v2 pattern claims it`).toContain(slug);
    }
  });
});

describe("merged pattern variants", () => {
  const merged = patterns.filter((p) => p.variants?.length);

  it("gives every merged pattern an axis and exactly one default", () => {
    expect(merged.map((p) => p.id).sort()).toEqual([
      "activity-record",
      "co-editing-surface",
      "decision-record",
      "inline-rationale",
      "structured-finding",
    ]);
    for (const pattern of merged) {
      expect(pattern.variant_axis, pattern.id).toBeTruthy();
      const defaults = pattern.variants!.filter((v) => v.default);
      expect(defaults, `${pattern.id} defaults`).toHaveLength(1);
    }
  });

  it("keeps variant ids unique and kebab-case within a pattern", () => {
    for (const pattern of merged) {
      const ids = pattern.variants!.map((v) => v.id);
      expect(new Set(ids).size, pattern.id).toBe(ids.length);
      for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("points every ioc variant at a real v1 slug and sdk variants at a component", () => {
    for (const pattern of merged) {
      for (const variant of pattern.variants!) {
        if (variant.source === "ioc") {
          expect(variant.rendering, `${pattern.id}/${variant.id}`).toBeTruthy();
          expect(pattern.v1_slugs).toContain(variant.rendering);
        } else {
          expect(variant.sdk_component, `${pattern.id}/${variant.id}`).toBeTruthy();
        }
      }
    }
  });

  it("names only SDK artifacts that exist upstream", () => {
    // Read first-hand from hax/artifacts in outshift-open/hax. The merge map
    // in the brief listed co-editing-interface, rich-text-editor,
    // details-dashboard and form-builder; the first two do not exist and the
    // second two are filed as `details` and `form`.
    const upstream = new Set([
      "capability-manifest", "code-editor", "contextual-explanation",
      "data-visualizer", "details", "diagnostic-report", "findings", "form",
      "inline-rationale", "mindmap", "rationale", "source-attribution",
      "thinking-process", "timeline", "workshop-card",
    ]);
    for (const pattern of merged) {
      for (const variant of pattern.variants!) {
        if (variant.sdk_component) {
          expect(upstream, `${pattern.id}/${variant.id}`).toContain(
            variant.sdk_component,
          );
        }
      }
    }
  });
});

describe("the Phase 4 stub list", () => {
  it("names only patterns that exist, and none that already have a design", () => {
    const registry = readFileSync(
      new URL("../../components/patterns/pattern-registry.tsx", import.meta.url),
      "utf8",
    );
    const ids = new Set(patterns.map((p) => p.id));
    for (const stub of NO_DESIGN_YET) {
      expect(ids, stub.id).toContain(stub.id);
      const pattern = patterns.find((p) => p.id === stub.id)!;
      // Decision Record is on the list for its missing *open* state, so it
      // is allowed to have a drawn design; the rest must have none.
      if (stub.id === "decision-record") continue;
      for (const slug of pattern.v1_slugs) {
        expect(registry.includes(`"${slug}":`), `${slug} is drawn`).toBe(false);
      }
    }
  });
});
