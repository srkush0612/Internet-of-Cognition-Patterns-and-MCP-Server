"use client";

import {
  PatternEditPanel,
  type PatternEditPanelProps,
} from "./PatternEditPanel";

const SLUG = "deferred-detail";

export type DeferredDetailEditPanelProps = Omit<
  PatternEditPanelProps,
  "patternSlug"
>;

/** Edit panel for the Deferred Detail pattern. */
export function DeferredDetailEditPanel(props: DeferredDetailEditPanelProps) {
  return <PatternEditPanel {...props} patternSlug={SLUG} />;
}

export default DeferredDetailEditPanel;
