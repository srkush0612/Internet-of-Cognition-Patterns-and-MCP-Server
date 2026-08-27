/** Suggested context keys shown in the Context tab (editable metadata). */

export type ContextFieldConfig = {
  key: string;
  label: string;
  required?: boolean;
  placeholder?: string;
};

export const DEFAULT_CONTEXT_FIELDS: ContextFieldConfig[] = [
  {
    key: "affectedServices",
    label: "Affected services",
    placeholder: "e.g. auth-api, billing-worker",
  },
  {
    key: "rollbackWindow",
    label: "Rollback window",
    placeholder: "e.g. 24 hours",
  },
  {
    key: "risks",
    label: "Risks",
    placeholder: "What could go wrong?",
  },
];

export function emptyContextFromPresets(
  presets: ContextFieldConfig[] = DEFAULT_CONTEXT_FIELDS,
): Record<string, string> {
  return Object.fromEntries(presets.map((field) => [field.key, ""]));
}

export function mergeContextPresets(
  existing: Record<string, string>,
  presets: ContextFieldConfig[] = DEFAULT_CONTEXT_FIELDS,
): Record<string, string> {
  const merged = emptyContextFromPresets(presets);
  for (const [key, value] of Object.entries(existing)) {
    merged[key] = value;
  }
  return merged;
}

export function validateContextFields(
  context: Record<string, string>,
  presets: ContextFieldConfig[] = DEFAULT_CONTEXT_FIELDS,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of presets) {
    if (field.required && !context[field.key]?.trim()) {
      errors[field.key] = `${field.label} is required`;
    }
  }
  return errors;
}
