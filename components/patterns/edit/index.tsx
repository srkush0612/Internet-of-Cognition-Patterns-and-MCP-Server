export { PatternEditPanel, type PatternEditPanelProps } from "./PatternEditPanel";
export { DeferredDetailEditPanel } from "./deferred-detail-edit-panel";
export { ConvergencePointEditPanel, type ConvergencePointEditPanelProps, type ConvergenceFormData } from "./convergence-point-edit-panel";
export { ConvergencePointConversationEditPanel } from "./convergence-point-conversation-edit-panel";
export {
  extractConvergencePoint,
  extractAgents,
  parseAgentCount,
  rosterFromAgentCount,
  extractDisagreement,
  extractResolution,
  extractOutcome,
  extractFromFile,
  CONVERGENCE_SCENARIOS,
  CONVERGENCE_FIELDS,
  convergenceFormToWorkspace,
  workspaceToConvergenceForm,
  type ConvergenceExtracted,
  type ConvergenceExtractionResult,
} from "./convergence-point-extractor";
export { EditFieldRenderer } from "./EditFieldRenderer";
export { EditPanelPreview, DraftParameterSummary } from "./EditPanelPreview";
export {
  ConversationInput,
  ScenarioPicker,
  SmartForm,
  RefinementChat,
  ExtractionSummary,
  validateForm,
  parseRefinement,
  mergeExtractedData,
  applyRefinement,
  type ConversationInputProps,
  type ScenarioPickerProps,
  type SmartFormProps,
  type RefinementChatProps,
  type ExtractionSummaryProps,
  type ExtractionResult,
  type FormFieldDef,
  type Scenario,
  type RefinementMessage,
  type RefinementParsed,
} from "./shared";

import type { PatternEditPanelProps } from "./PatternEditPanel";
import { PatternEditPanel } from "./PatternEditPanel";

/** Factory for pattern-specific edit panel files. */
export function createPatternEditPanel(slug: string) {
  return function PatternSlugEditPanel(
    props: Omit<PatternEditPanelProps, "patternSlug">,
  ) {
    return <PatternEditPanel {...props} patternSlug={slug} />;
  };
}
