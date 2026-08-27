export type PatternSlug =
  | "convergence-point"
  | "decision-ledger"
  | "assumption-surface"
  | "credential-boundary"
  | "presence-boundary"
  | "deferred-detail";

export const PATTERN_INSTRUCTION_SLUGS: PatternSlug[] = [
  "convergence-point",
  "decision-ledger",
  "assumption-surface",
  "credential-boundary",
  "presence-boundary",
  "deferred-detail",
];

export type FieldKind = "string" | "array" | "tags";

export type InstructionFieldDef = {
  key: string;
  kind: FieldKind;
  minLength?: number;
  minItems?: number;
  emptyError?: string;
  vagueError?: string;
  missingWarning?: string;
};

export type ExtractionQuestionDef = {
  field: string;
  question: string;
  optional?: boolean;
};

export type PatternInstructions = {
  slug: PatternSlug;
  name: string;
  question: string;
  insight: string;
  requiredFields: InstructionFieldDef[];
  recommendedFields: InstructionFieldDef[];
  extractionQuestions: ExtractionQuestionDef[];
  errorMessages: Record<string, string>;
  warningMessages: Record<string, string>;
  fieldTips: Record<string, string>;
  mistakeSuggestions: Record<string, string>;
  recommendation: {
    subtitle: string;
    researchLabel: string;
    researchQuote: string;
    defaultReasons: string[];
  };
  /** Maps instruction field keys → workspace parameter keys */
  workspaceFieldMap: Record<string, string>;
};

export type PatternFieldErrors = Record<string, string>;

export type PatternValidationResult = {
  errors: PatternFieldErrors;
  warnings: string[];
  suggestions: string[];
  canSave: boolean;
  guidanceMessages: string[];
};
