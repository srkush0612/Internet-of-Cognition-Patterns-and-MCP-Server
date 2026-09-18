import { describe, expect, it } from "vitest";
import { applyPreset, presetAvailable } from "@/archive/playground/lib/playground-presets";

const emptyState = { parameters: {}, context: {} };

describe("presetAvailable", () => {
  it("'many' is available for a pattern with a repeatable field (convergence-point has tags + table)", () => {
    expect(presetAvailable("convergence-point", "many")).toBe(true);
  });

  it("'many' is unavailable for a pattern with no repeatable field (decision-ledger is all textarea)", () => {
    expect(presetAvailable("decision-ledger", "many")).toBe(false);
  });

  it("'default'/'empty'/'long' are always available", () => {
    for (const id of ["default", "empty", "long"] as const) {
      expect(presetAvailable("decision-ledger", id)).toBe(true);
    }
  });
});

describe("applyPreset", () => {
  it("'default' returns the pattern's real default workspace", () => {
    const result = applyPreset("convergence-point", "default", emptyState);
    expect(result.parameters).toHaveProperty("disagreement");
  });

  it("'empty' clears every editable field per its type (tags/table -> [], text -> '')", () => {
    const seeded = {
      parameters: { scenario: "Mission room", agentRoster: ["Prometheus", "Themis"] },
      context: {},
    };
    const result = applyPreset("convergence-point", "empty", seeded);
    expect(result.parameters.scenario).toBe("");
    expect(result.parameters.agentRoster).toEqual([]);
  });

  it("'long' lengthens text/textarea fields without touching tags/table fields", () => {
    const seeded = {
      parameters: { scenario: "short", agentRoster: ["Prometheus"] },
      context: {},
    };
    const result = applyPreset("convergence-point", "long", seeded);
    expect(String(result.parameters.scenario).length).toBeGreaterThan("short".length * 2);
    expect(result.parameters.agentRoster).toEqual(["Prometheus"]);
  });

  it("'many' expands a tags field to many entries, derived from the existing values", () => {
    const seeded = { parameters: { agentRoster: ["Prometheus"] }, context: {} };
    const result = applyPreset("convergence-point", "many", seeded);
    expect(Array.isArray(result.parameters.agentRoster)).toBe(true);
    expect((result.parameters.agentRoster as unknown[]).length).toBeGreaterThan(5);
  });
});
