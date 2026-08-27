import type { ConflictVisibilityViewId } from "@/lib/conflict-visibility-views";

/** Coordinates post-save preview + chat reveal for Convergence Point (5+ agents). */
export type ConvergenceSaveRevealState = {
  isProcessing: boolean;
  /** True while processing when saved roster is expected to be 5+. */
  processingAlternatives: boolean;
  revealToken: number;
  showStackedVisuals: boolean;
  showAlternatives: boolean;
  savedAgentCount: number;
  /** Selected visibility view (from chat cards). Opens that view in preview. */
  activeView: ConflictVisibilityViewId | null;
  activeViewToken: number;
};

export const INITIAL_CONVERGENCE_SAVE_REVEAL: ConvergenceSaveRevealState = {
  isProcessing: false,
  processingAlternatives: false,
  revealToken: 0,
  showStackedVisuals: false,
  showAlternatives: false,
  savedAgentCount: 0,
  activeView: null,
  activeViewToken: 0,
};

export const CONVERGENCE_AGENT_THRESHOLD = 5;

export const CONVERGENCE_SAVE_PROCESSING_MS = 500;
