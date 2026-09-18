import { editableFieldsForSlug, type EditableField } from "@/lib/editable-fields";
import { defaultWorkspaceForSlug } from "@/lib/workspace-defaults";

export type PresetId = "default" | "empty" | "long" | "many";

export const PRESETS: { id: PresetId; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "empty", label: "Empty" },
  { id: "long", label: "Long text" },
  { id: "many", label: "Many items" },
];

export type PlaygroundFieldState = {
  parameters: Record<string, unknown>;
  context: Record<string, string>;
};

function isRepeatable(field: EditableField): boolean {
  return field.type === "tags" || field.type === "table";
}

/**
 * "many items" only makes sense for a pattern with at least one repeatable
 * (tags/table) field — hide the chip rather than show one that does nothing.
 */
export function presetAvailable(slug: string, presetId: PresetId): boolean {
  if (presetId !== "many") return true;
  const schema = editableFieldsForSlug(slug);
  return [...schema.parameters, ...schema.context].some(isRepeatable);
}

function readField(field: EditableField, state: PlaygroundFieldState): unknown {
  return field.section === "context" ? state.context[field.key] : state.parameters[field.key];
}

function writeField(
  field: EditableField,
  value: unknown,
  state: PlaygroundFieldState,
): PlaygroundFieldState {
  if (field.section === "context") {
    return { ...state, context: { ...state.context, [field.key]: String(value ?? "") } };
  }
  return { ...state, parameters: { ...state.parameters, [field.key]: value } };
}

function emptyValueFor(field: EditableField): unknown {
  return isRepeatable(field) ? [] : "";
}

function longTextFor(current: unknown, field: EditableField): string {
  const base =
    (typeof current === "string" && current.trim()) ||
    field.placeholder ||
    `${field.label} — stress-test content`;
  return Array.from({ length: 4 }, () => base).join(" ");
}

function manyRowsFor(current: unknown, field: EditableField): unknown {
  const TARGET = 10;
  if (field.type === "tags") {
    const base = Array.isArray(current) && current.length > 0 ? current : [field.label];
    return Array.from({ length: TARGET }, (_, i) => `${base[i % base.length]} ${i + 1}`);
  }
  // table
  const base =
    Array.isArray(current) && current.length > 0
      ? current
      : [field.rowTemplate ?? Object.fromEntries((field.columns ?? []).map((c) => [c.key, ""]))];
  return Array.from({ length: TARGET }, (_, i) => {
    const row = { ...(base[i % base.length] as Record<string, unknown>) };
    const firstCol = field.columns?.[0]?.key;
    if (firstCol && typeof row[firstCol] === "string") {
      row[firstCol] = `${row[firstCol]} ${i + 1}`;
    }
    return row;
  });
}

/**
 * Mechanical, schema-driven presets — no per-pattern authoring. Every one of
 * these works for any pattern the moment it has an editableFieldsForSlug
 * schema, because they operate on the schema itself, not hand-written content.
 */
export function applyPreset(
  slug: string,
  presetId: PresetId,
  current: PlaygroundFieldState,
): PlaygroundFieldState {
  if (presetId === "default") {
    return { parameters: defaultWorkspaceForSlug(slug), context: {} };
  }

  const schema = editableFieldsForSlug(slug);
  const fields = [...schema.parameters, ...schema.context];

  return fields.reduce((state, field) => {
    const value = readField(field, state);
    if (presetId === "empty") {
      return writeField(field, emptyValueFor(field), state);
    }
    if (presetId === "long") {
      if (field.type !== "text" && field.type !== "textarea") return state;
      return writeField(field, longTextFor(value, field), state);
    }
    // many
    if (!isRepeatable(field)) return state;
    return writeField(field, manyRowsFor(value, field), state);
  }, current);
}
