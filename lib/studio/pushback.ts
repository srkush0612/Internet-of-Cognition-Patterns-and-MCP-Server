import type { AntiPattern, Decision } from "@/lib/studio/types";

/**
 * The pushback gate always fires for a required element — `required` is a
 * structural fact on PatternElement, known even when no anti-pattern content
 * exists yet. `antiPatterns` may come back empty; the caller renders an
 * honest "not yet in the library" block rather than skipping the gate.
 */
export function antiPatternsForRemoval(
  elementId: string,
  antiPatterns: AntiPattern[],
): AntiPattern[] {
  return antiPatterns.filter((ap) => ap.triggeredByElementIds.includes(elementId));
}

/** Accepting the pushback: records the required reason, flips the encounter's state. */
export function acceptRemoval(decision: Decision, elementId: string, reason: string): Decision {
  return {
    ...decision,
    elementsPresent: decision.elementsPresent.filter((id) => id !== elementId),
    elementsRemoved: decision.elementsRemoved.includes(elementId)
      ? decision.elementsRemoved
      : [...decision.elementsRemoved, elementId],
    removedElementReasons: { ...decision.removedElementReasons, [elementId]: reason },
    state: "answered_with_gap",
  };
}

/** "Put it back" — restores the element; the encounter is only clean again if no gaps remain. */
export function restoreElement(decision: Decision, elementId: string): Decision {
  const removedElementReasons = { ...decision.removedElementReasons };
  delete removedElementReasons[elementId];
  const elementsRemoved = decision.elementsRemoved.filter((id) => id !== elementId);

  return {
    ...decision,
    elementsPresent: decision.elementsPresent.includes(elementId)
      ? decision.elementsPresent
      : [...decision.elementsPresent, elementId],
    elementsRemoved,
    removedElementReasons,
    state: elementsRemoved.length > 0 ? "answered_with_gap" : "answered",
  };
}
