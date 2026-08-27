/** Field metadata for validation and read-only view labels. */

import {
  validationFieldsForSlug,
  type EditableField,
  type EditableFieldType,
} from "@/lib/editable-fields";

export type FieldType = "text" | "textarea" | "select" | "string-list";

export type PatternFieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
};

export type { EditableField, EditableFieldType };

export const PATTERN_FIELD_CONFIG: Record<string, PatternFieldConfig[]> =
  Object.fromEntries(
    [
      "deferred-detail",
      "convergence-point",
      "decision-ledger",
      "assumption-surface",
      "background-work-ledger",
      "memory-commitment-review",
      "credential-boundary",
      "presence-boundary",
      "proposed-commits",
      "authority-gradient",
      "certainty-boundary",
      "concurrent-workspace-awareness",
      "dependency-and-lineage-view",
      "disclosure-gradient",
      "review-as-dialogue",
      "shared-cognitive-state",
      "signal-to-intent-handshake",
    ].map((slug) => [slug, validationFieldsForSlug(slug)]),
  );

export function fieldsForSlug(slug: string): PatternFieldConfig[] {
  return PATTERN_FIELD_CONFIG[slug] ?? validationFieldsForSlug(slug);
}
