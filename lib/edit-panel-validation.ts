import type { EditableField } from "@/lib/editable-fields";
import { allEditableFields } from "@/lib/editable-fields";

export type EditPanelValidationErrors = Record<string, string>;

export type FileMetadata = {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validateTags(field: EditableField, value: unknown): string | undefined {
  const list = Array.isArray(value) ? value : [];
  const filled = list.filter((item) => String(item).trim()).length;
  if (field.required && filled === 0) {
    return `${field.label} requires at least one entry`;
  }
  return undefined;
}

function validateTable(field: EditableField, value: unknown): string | undefined {
  const rows = Array.isArray(value) ? value : [];
  if (field.required && rows.length === 0) {
    return `${field.label} requires at least one row`;
  }
  return undefined;
}

function validateEnum(field: EditableField, value: unknown): string | undefined {
  const text = asTrimmedString(value);
  if (field.required && !text) {
    return `${field.label} is required`;
  }
  if (text && field.options && !field.options.includes(text)) {
    return `${field.label} must be one of: ${field.options.join(", ")}`;
  }
  return undefined;
}

function validateTextLike(field: EditableField, value: unknown): string | undefined {
  const text = asTrimmedString(value);
  if (field.required && !text) {
    return `${field.label} is required`;
  }
  return undefined;
}

export function validateEditableField(
  field: EditableField,
  value: unknown,
): string | undefined {
  switch (field.type) {
    case "tags":
      return validateTags(field, value);
    case "table":
      return validateTable(field, value);
    case "enum":
      return validateEnum(field, value);
    case "file":
      return undefined;
    case "readonly":
      return undefined;
    case "datetime":
    case "textarea":
    case "text":
      return validateTextLike(field, value);
    default:
      return undefined;
  }
}

export function validateEditPanelState(
  slug: string,
  parameters: Record<string, unknown>,
  context: Record<string, string>,
): EditPanelValidationErrors {
  const errors: EditPanelValidationErrors = {};

  for (const field of allEditableFields(slug)) {
    const value =
      field.section === "context"
        ? context[field.key]
        : parameters[field.key];
    const message = validateEditableField(field, value);
    if (message) {
      errors[field.key] = message;
    }
  }

  return errors;
}

export function hasEditPanelErrors(errors: EditPanelValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
