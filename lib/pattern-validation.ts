import { allEditableFields } from "@/lib/editable-fields";
import {
  validateEditableField,
  type EditPanelValidationErrors,
} from "@/lib/edit-panel-validation";
import { getWorkspaceState, mergeWorkspaceForSlug } from "@/lib/workspace-defaults";

export type ValidationErrors = EditPanelValidationErrors;

/** Validate workspace parameters before persisting. */
export function validateWorkspaceParameters(
  slug: string,
  state: Record<string, unknown>,
  defaults: Record<string, unknown>,
): ValidationErrors {
  const workspace = mergeWorkspaceForSlug(
    slug,
    getWorkspaceState(state, defaults, slug),
  );
  const errors: ValidationErrors = {};

  for (const field of allEditableFields(slug)) {
    if (field.section !== "parameters") continue;
    const message = validateEditableField(field, workspace[field.key]);
    if (message) {
      errors[field.key] = message;
    }
  }

  return errors;
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
