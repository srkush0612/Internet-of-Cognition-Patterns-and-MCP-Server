import { describe, expect, it } from "vitest";
import { isAtRisk } from "@/lib/studio/risk";
import type { Encounter, Scenario } from "@/lib/studio/types";

const baseEncounter: Encounter = {
  id: "enc-1",
  order: 1,
  title: "Test encounter",
  example: "An example",
  patternIds: [],
};

const baseScenario: Scenario = {
  id: "s-1",
  name: "Test",
  description: "",
  topology: "single",
  attendance: "sometimes",
  irreversibility: "some",
  decisions: [],
  createdAt: "",
  updatedAt: "",
};

describe("isAtRisk", () => {
  it("is false when the encounter has no risk rule", () => {
    expect(isAtRisk(baseEncounter, baseScenario)).toBe(false);
  });

  it("is true when both the attendance and irreversibility match the rule", () => {
    const encounter: Encounter = {
      ...baseEncounter,
      riskRule: { attendances: ["sometimes", "unattended"], irreversibilities: ["some", "yes"] },
    };
    expect(isAtRisk(encounter, baseScenario)).toBe(true);
  });

  it("is false when only one of the two answers matches", () => {
    const encounter: Encounter = {
      ...baseEncounter,
      riskRule: { attendances: ["watched"], irreversibilities: ["some", "yes"] },
    };
    expect(isAtRisk(encounter, baseScenario)).toBe(false);
  });

  it("the hardest combination — unattended and irreversible — is the intended worst case", () => {
    const encounter: Encounter = {
      ...baseEncounter,
      riskRule: { attendances: ["unattended"], irreversibilities: ["yes"] },
    };
    const scenario: Scenario = { ...baseScenario, attendance: "unattended", irreversibility: "yes" };
    expect(isAtRisk(encounter, scenario)).toBe(true);
  });
});
