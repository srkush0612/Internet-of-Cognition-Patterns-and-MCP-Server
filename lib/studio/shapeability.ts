import { PATTERN_EDITABLE_FIELDS } from "@/lib/editable-fields";
import { elementsForPattern } from "@/lib/studio/content";
import type { Shapeability } from "@/lib/studio/types";

/**
 * How much of a pattern Studio can actually offer, worked out from what is
 * in the repo rather than asserted anywhere.
 *
 * Three states, in the order they are checked:
 *
 * - `annotated`  Element detail is authored in content/studio/pattern-elements.json,
 *                each element carrying the line from the library it was derived
 *                from. The live component renders untouched and the elements are
 *                annotated onto it. Only signal-to-intent-handshake today.
 * - `editable`   The pattern has a live component and an edit schema in
 *                lib/editable-fields.ts, so a field edit flows into the
 *                component through resolveLivePreview. This is the pipeline the
 *                playground and the pattern pages already use.
 * - `matched_only` The match stands and the pattern has its write-up and
 *                evidence in the library, but there is nothing here to shape.
 *
 * `hasLiveComponent` is passed in rather than read from
 * components/patterns/pattern-registry.tsx so that asking this question does
 * not pull every pattern component into the caller's bundle or a test run.
 */
export function shapeabilityOf(
  patternId: string,
  hasLiveComponent: boolean,
): Shapeability {
  if (elementsForPattern(patternId).length > 0) return "annotated";
  if (hasLiveComponent && PATTERN_EDITABLE_FIELDS[patternId]) return "editable";
  return "matched_only";
}

export function isShapeable(shapeability: Shapeability): boolean {
  return shapeability !== "matched_only";
}

/** Why a pattern cannot be shaped, in terms of what is missing rather than what is broken. */
export function missingDetailReason(
  patternId: string,
  hasLiveComponent: boolean,
): string {
  if (!hasLiveComponent) {
    return "It has no reference design built yet, so there is no component to put in front of you and no elements to shape.";
  }
  return "Its reference design is built, but no element detail has been published for it, so there is nothing here to fill in yet.";
}
