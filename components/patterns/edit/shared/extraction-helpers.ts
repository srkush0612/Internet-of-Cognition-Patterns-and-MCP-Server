import type { FormFieldDef, RefinementParsed } from "./types";

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isEmptyValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function validateForm(
  values: Record<string, unknown>,
  fields: FormFieldDef[],
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = values[field.name];

    if (field.validation) {
      const customError = field.validation(value);
      if (customError) {
        errors[field.name] = customError;
        continue;
      }
    }

    if (field.required) {
      if (field.type === "tags" || field.type === "table" || field.type === "file") {
        if (!Array.isArray(value) || value.length === 0) {
          errors[field.name] = `${field.label} is required`;
        }
      } else if (!asTrimmedString(value)) {
        errors[field.name] = `${field.label} is required`;
      }
    }

    if (
      field.type === "enum" &&
      asTrimmedString(value) &&
      field.options &&
      !field.options.includes(asTrimmedString(value))
    ) {
      errors[field.name] = `${field.label} must be one of: ${field.options.join(", ")}`;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function parseRefinement(text: string): RefinementParsed | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const addMatch = /^add\s+(.+?)(?:\s+as\s+\d+(?:st|nd|rd|th)?)?\.?$/i.exec(trimmed);
  if (addMatch) {
    return { field: "roster", action: "add", value: addMatch[1].trim() };
  }

  const removeMatch = /^remove\s+(.+?)\.?$/i.exec(trimmed);
  if (removeMatch) {
    return { field: "roster", action: "remove", value: removeMatch[1].trim() };
  }

  const changeMatch =
    /^change\s+(?:the\s+)?([\w\s-]+?)\s+to\s+(.+?)\.?$/i.exec(trimmed);
  if (changeMatch) {
    const field = changeMatch[1].trim().toLowerCase().replace(/\s+/g, "_");
    return { field, action: "change", value: changeMatch[2].trim() };
  }

  return null;
}

export function mergeExtractedData(
  currentState: Record<string, unknown>,
  extracted: Record<string, unknown>,
): Record<string, unknown> {
  const merged = { ...currentState };

  for (const [key, value] of Object.entries(extracted)) {
    if (isEmptyValue(merged[key])) {
      merged[key] = value;
    }
  }

  return merged;
}

export function applyRefinement(
  formState: Record<string, unknown>,
  parsed: RefinementParsed,
): Record<string, unknown> {
  const next = { ...formState };

  if (parsed.action === "change") {
    next[parsed.field] = parsed.value;
    return next;
  }

  const rosterKey =
    "agentRoster" in next
      ? "agentRoster"
      : "agents" in next
        ? "agents"
        : parsed.field;

  const current = Array.isArray(next[rosterKey]) ? [...(next[rosterKey] as string[])] : [];

  if (parsed.action === "add" && !current.includes(parsed.value)) {
    next[rosterKey] = [...current, parsed.value];
  }

  if (parsed.action === "remove") {
    next[rosterKey] = current.filter(
      (item) => item.toLowerCase() !== parsed.value.toLowerCase(),
    );
  }

  return next;
}
