/**
 * Config-driven editable field definitions per pattern slug.
 * Used by PatternEditPanel to render forms and validate instance state.
 */

import { INSTRUCTION_EDITABLE_SCHEMAS } from "@/lib/pattern-instruction-fields";

export type EditableFieldType =
  | "text"
  | "textarea"
  | "tags"
  | "enum"
  | "table"
  | "file"
  | "datetime"
  | "readonly";

export type TableColumn = {
  key: string;
  label: string;
  type?: "text" | "tags";
  placeholder?: string;
};

export type EditableField = {
  key: string;
  label: string;
  type: EditableFieldType;
  section: "parameters" | "context";
  description?: string;
  placeholder?: string;
  required?: boolean;
  group?: "required" | "recommended" | "optional";
  options?: string[];
  columns?: TableColumn[];
  rowTemplate?: Record<string, unknown>;
  accept?: string;
};

export type PatternEditableSchema = {
  parameters: EditableField[];
  context: EditableField[];
};

const FILE_ACCEPT = ".pdf,.doc,.docx,.txt,.json,.csv";

const CONTEXT_NOTES: EditableField = {
  key: "notes",
  label: "Context notes",
  type: "textarea",
  section: "context",
  placeholder: "Operational notes, stakeholders, constraints…",
};

const CONTEXT_OPERATIONAL: EditableField[] = [
  {
    key: "affectedServices",
    label: "Affected services",
    type: "text",
    section: "context",
    placeholder: "e.g. auth-api, billing-worker",
  },
  {
    key: "rollbackWindow",
    label: "Rollback window",
    type: "text",
    section: "context",
    placeholder: "e.g. 24 hours",
  },
  {
    key: "risks",
    label: "Risks",
    type: "textarea",
    section: "context",
    placeholder: "What could go wrong?",
  },
  CONTEXT_NOTES,
];

function contextFields(): EditableField[] {
  return CONTEXT_OPERATIONAL;
}

const EVIDENCE_FILES: EditableField = {
  key: "evidenceFiles",
  label: "Evidence",
  type: "file",
  section: "parameters",
  description: "Supporting documents (metadata only — upload handled by parent).",
  accept: FILE_ACCEPT,
};

function fields(...items: EditableField[]): EditableField[] {
  return items;
}

export const PATTERN_EDITABLE_FIELDS: Record<string, PatternEditableSchema> = {
  ...INSTRUCTION_EDITABLE_SCHEMAS,
  "convergence-point": {
    parameters: fields(
      {
        key: "scenario",
        label: "Scenario",
        type: "text",
        section: "parameters",
        placeholder: "Mission room, routing decision…",
      },
      {
        key: "agentRoster",
        label: "Agent roster",
        type: "tags",
        section: "parameters",
        placeholder: "Prometheus, Themis…",
      },
      {
        key: "disagreement",
        label: "Disagreement dimension",
        type: "textarea",
        section: "parameters",
        required: true,
        placeholder: "Where agents diverge…",
      },
      {
        key: "positions",
        label: "Agent positions",
        type: "table",
        section: "parameters",
        columns: [
          { key: "agent", label: "Agent", type: "text", placeholder: "Agent name" },
          { key: "stance", label: "Stance", type: "text", placeholder: "Their position" },
          {
            key: "evidence",
            label: "Evidence",
            type: "tags",
            placeholder: "RFC, metric…",
          },
        ],
        rowTemplate: { agent: "", stance: "", evidence: [] as string[] },
      },
      {
        key: "resolutionMechanism",
        label: "Resolution mechanism",
        type: "text",
        section: "parameters",
        placeholder: "Conflict resolver, human escalation…",
      },
      {
        key: "decision",
        label: "Outcome / resolution",
        type: "textarea",
        section: "parameters",
        required: true,
        placeholder: "Adopted answer or flagged impasse…",
      },
      {
        key: "resolutionRationale",
        label: "Resolution rationale",
        type: "textarea",
        section: "parameters",
        placeholder: "Why this outcome was adopted…",
      },
      EVIDENCE_FILES,
    ),
    context: contextFields(),
  },
  "background-work-ledger": {
    parameters: fields(
      {
        key: "workDescription",
        label: "Work description",
        type: "textarea",
        section: "parameters",
        required: true,
      },
      { key: "startedAt", label: "Started at", type: "datetime", section: "parameters" },
      {
        key: "targetCompletion",
        label: "Target completion",
        type: "datetime",
        section: "parameters",
      },
      {
        key: "statusUpdates",
        label: "Status updates",
        type: "table",
        section: "parameters",
        columns: [
          { key: "timestamp", label: "When", type: "text" },
          { key: "text", label: "Update", type: "text" },
        ],
        rowTemplate: { timestamp: "", text: "" },
      },
      { key: "blockers", label: "Blockers", type: "textarea", section: "parameters" },
      EVIDENCE_FILES,
    ),
    context: contextFields(),
  },
  "memory-commitment-review": {
    parameters: fields(
      { key: "recording", label: "Recording", type: "textarea", section: "parameters", required: true },
      { key: "whyItMatters", label: "Why it matters", type: "textarea", section: "parameters" },
      { key: "verification", label: "Verification", type: "textarea", section: "parameters" },
      {
        key: "retention",
        label: "Retention",
        type: "enum",
        section: "parameters",
        options: ["30 days", "90 days", "1 year", "Indefinite"],
      },
      EVIDENCE_FILES,
    ),
    context: contextFields(),
  },
  "proposed-commits": {
    parameters: fields(
      { key: "proposedChange", label: "Proposed change", type: "textarea", section: "parameters", required: true },
      { key: "agentReasoning", label: "Agent reasoning", type: "textarea", section: "parameters", required: true },
      {
        key: "changeComplexity",
        label: "Change complexity",
        type: "enum",
        section: "parameters",
        options: ["Low", "Medium", "High"],
      },
      { key: "affectedSystems", label: "Affected systems", type: "tags", section: "parameters" },
      EVIDENCE_FILES,
    ),
    context: contextFields(),
  },
};

const GENERIC_NOTES: PatternEditableSchema = {
  parameters: [
    {
      key: "notes",
      label: "Workspace notes",
      type: "textarea",
      section: "parameters",
      placeholder: "Capture decisions, constraints, and open questions…",
    },
    EVIDENCE_FILES,
  ],
  context: contextFields(),
};

export function editableFieldsForSlug(slug: string): PatternEditableSchema {
  return PATTERN_EDITABLE_FIELDS[slug] ?? GENERIC_NOTES;
}

export function allEditableFields(slug: string): EditableField[] {
  const schema = editableFieldsForSlug(slug);
  return [...schema.parameters, ...schema.context];
}

/** Flatten schema for validation (legacy pattern-field-config shape). */
export function validationFieldsForSlug(slug: string): Array<{
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "string-list";
  required?: boolean;
  options?: string[];
}> {
  return allEditableFields(slug)
    .filter((field) => field.type !== "file" && field.type !== "readonly")
    .map((field) => {
      const type: "text" | "textarea" | "select" | "string-list" =
        field.type === "enum"
          ? "select"
          : field.type === "tags"
            ? "string-list"
            : field.type === "table" || field.type === "datetime"
              ? "text"
              : field.type === "textarea"
                ? "textarea"
                : "text";
      return {
        key: field.key,
        label: field.label,
        required: field.required,
        options: field.options,
        type,
      };
    });
}
