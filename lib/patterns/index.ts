export {
  loadPatternInstructions,
  loadAllPatternInstructions,
  getExtractionQuestions,
  getFieldGuide,
  getRecommendationCopy,
  PATTERN_INSTRUCTION_SLUGS,
  type PatternInstructions,
  type PatternSlug,
} from "./loader";

export {
  validatePatternWorkspace,
  getGuidanceMessages,
  getFieldTip,
  fieldIsFilledInWorkspace,
} from "./validator";

export type { PatternValidationResult } from "./types";

export {
  buildExtractionIntroMessage,
  buildExtractionFollowUp,
  getNextExtractionQuestion,
  mergeExtractionIntoWorkspace,
  getPatternGuidanceMessages,
  hasExtractionFlow,
  isExtractionInProgress,
  validatePatternForm,
} from "./extraction-flow";

export { parsePatternInstructions } from "./parse-instructions";
export { WORKSPACE_FIELD_MAPS, getWorkspaceKey } from "./field-mappers";
export { detectPatternMistakes } from "./mistake-detection";
export {
  applyExtractionAnswer,
  mergeGenericExtraction,
} from "./extractors";
export {
  readExtractionMeta,
  stripExtractionMeta,
  isInstructionFieldAnswered,
} from "./extraction-state";
