import {
  loadPatternInstructions,
  loadAllPatternInstructions,
  getExtractionQuestions,
  getFieldGuide,
  getRecommendationCopy,
  type PatternInstructions,
  type PatternSlug,
  PATTERN_INSTRUCTION_SLUGS,
} from "@/lib/patterns/loader";

export {
  loadPatternInstructions,
  loadAllPatternInstructions,
  getExtractionQuestions,
  getFieldGuide,
  getRecommendationCopy,
  type PatternInstructions,
  type PatternSlug,
  PATTERN_INSTRUCTION_SLUGS,
};

export {
  validatePatternWorkspace,
  getGuidanceMessages,
  getFieldTip,
  fieldIsFilledInWorkspace,
} from "@/lib/patterns/validator";

export {
  buildExtractionIntroMessage,
  buildExtractionFollowUp,
  getNextExtractionQuestion,
  mergeExtractionIntoWorkspace,
  getPatternGuidanceMessages,
  hasExtractionFlow,
  validatePatternForm,
} from "@/lib/patterns/extraction-flow";
