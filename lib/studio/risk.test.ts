import { describe, expect, it } from "vitest";
import { isAtRisk } from "@/lib/studio/risk";
import type { Scenario, Situation } from "@/lib/studio/types";

const baseSituation: Situation = {
  id: "sit-1",
  order: 1,
  number: "01",
  title: "Test situation",
  moment: "A moment",
  answers: "what it answers",
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
  it("is false when the situation has no risk rule", () => {
    expect(isAtRisk(baseSituation, baseScenario)).toBe(false);
  });

  it("is true when both the attendance and irreversibility match the rule", () => {
    const situation: Situation = {
      ...baseSituation,
      riskRule: { attendances: ["sometimes", "unattended"], irreversibilities: ["some", "yes"] },
    };
    expect(isAtRisk(situation, baseScenario)).toBe(true);
  });

  it("is false when only one of the two answers matches", () => {
    const situation: Situation = {
      ...baseSituation,
      riskRule: { attendances: ["watched"], irreversibilities: ["some", "yes"] },
    };
    expect(isAtRisk(situation, baseScenario)).toBe(false);
  });

  it("the hardest combination — unattended and irreversible — is the intended worst case", () => {
    const situation: Situation = {
      ...baseSituation,
      riskRule: { attendances: ["unattended"], irreversibilities: ["yes"] },
    };
    const scenario: Scenario = { ...baseScenario, attendance: "unattended", irreversibility: "yes" };
    expect(isAtRisk(situation, scenario)).toBe(true);
  });
});
