import { describe, expect, it } from "vitest";
import { decodeScenario, encodeScenario } from "@/archive/playground/lib/playground-scenario-codec";

describe("scenario codec", () => {
  it("round-trips a scenario through encode/decode", () => {
    const scenario = {
      slug: "decision-ledger",
      name: "Firmware rollback walkthrough",
      parameters: { decision: "Roll back", chosen: "4.11" },
      context: { affectedServices: "svc-payments" },
    };
    const decoded = decodeScenario(encodeScenario(scenario));
    expect(decoded).toEqual(scenario);
  });

  it("returns null for malformed input instead of throwing", () => {
    expect(decodeScenario("not json at all %%%")).toBeNull();
    expect(decodeScenario(encodeURIComponent(JSON.stringify({ foo: "bar" })))).toBeNull();
  });
});
