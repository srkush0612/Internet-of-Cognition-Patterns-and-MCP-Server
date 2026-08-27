import { allEditableFields } from "@/lib/editable-fields";
import type { EditableInstance } from "@/lib/instance-edit-model";

import { mergeWorkspaceForSlug } from "@/lib/workspace-defaults";

export function formatPreviewValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (typeof value[0] === "object" && value[0] !== null) {
      return `${value.length} row${value.length === 1 ? "" : "s"}`;
    }
    return value.map(String).join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function draftHighlightsForSlug(
  slug: string,
  parameters: Record<string, unknown>,
  limit = 8,
): Array<{ label: string; value: string }> {
  return allEditableFields(slug)
    .filter((field) => field.section === "parameters" && field.type !== "file")
    .slice(0, limit)
    .map((field) => ({
      label: field.label,
      value: formatPreviewValue(parameters[field.key]),
    }))
    .filter((item) => item.value !== "—");
}

export function previewStateFromDraft(
  persisted: Record<string, unknown>,
  draft: Pick<EditableInstance, "name" | "parameters" | "context">,
): Record<string, unknown> {
  return {
    ...persisted,
    title: draft.name,
    workspace: draft.parameters,
    context: draft.context,
  };
}

export function workspaceFromInstanceState(
  instanceState?: Record<string, unknown>,
  slug?: string,
): Record<string, unknown> {
  const raw = instanceState?.workspace;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return slug ? mergeWorkspaceForSlug(slug, {}) : {};
  }
  const workspace = raw as Record<string, unknown>;
  return slug ? mergeWorkspaceForSlug(slug, workspace) : workspace;
}
