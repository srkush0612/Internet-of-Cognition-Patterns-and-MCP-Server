import type { Encounter, Scenario } from "@/lib/studio/types";

/**
 * Deterministic table lookup — no inference. At-risk is derived from the
 * scenario's attendance + irreversibility answers only ("nobody watching
 * plus nothing reversible is the hardest combination" — the intake
 * screen's own framing). Whether the chosen pattern should also factor in
 * is an open question (flagged, not resolved here) — this function only
 * ever reads `encounter.riskRule` and the two scenario fields.
 */
export function isAtRisk(encounter: Encounter, scenario: Scenario): boolean {
  const rule = encounter.riskRule;
  if (!rule) return false;
  return (
    rule.attendances.includes(scenario.attendance) &&
    rule.irreversibilities.includes(scenario.irreversibility)
  );
}
