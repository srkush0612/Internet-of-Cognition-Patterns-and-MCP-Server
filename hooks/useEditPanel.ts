"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fromSidebarInstance,
  toInstanceStateUpdate,
  type EditableInstance,
} from "@/lib/instance-edit-model";
import {
  hasValidationErrors,
  validateWorkspaceParameters,
  type ValidationErrors,
} from "@/lib/pattern-validation";
import { validateContextFields } from "@/lib/context-field-config";
import { defaultWorkspaceForSlug } from "@/lib/workspace-defaults";
import { validatePatternForm } from "@/lib/patterns/extraction-flow";
import { PATTERN_INSTRUCTION_SLUGS } from "@/lib/patterns/loader";
import { stripExtractionMeta } from "@/lib/patterns/extraction-state";
import type { InstanceSidebarData } from "@/lib/instance-types";

export type EditPanelMode = "view" | "edit";

type UseEditPanelOptions = {
  instance: InstanceSidebarData;
  onSave: (updates: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

function editableFromSavePayload(
  draft: EditableInstance,
  payload?: Record<string, unknown>,
): Pick<EditableInstance, "name" | "parameters" | "context"> {
  if (!payload) {
    return {
      name: draft.name,
      parameters: draft.parameters,
      context: draft.context,
    };
  }

  const rawContext = payload.context;
  const context =
    rawContext && typeof rawContext === "object" && !Array.isArray(rawContext)
      ? Object.fromEntries(
          Object.entries(rawContext as Record<string, unknown>).map(
            ([key, value]) => [key, String(value ?? "")],
          ),
        )
      : draft.context;

  const workspace =
    payload.workspace && typeof payload.workspace === "object" && !Array.isArray(payload.workspace)
      ? (payload.workspace as Record<string, unknown>)
      : draft.parameters;

  return {
    name: typeof payload.title === "string" ? payload.title : draft.name,
    parameters: workspace,
    context,
  };
}

export function useEditPanel({ instance, onSave }: UseEditPanelOptions) {
  const [mode, setMode] = useState<EditPanelMode>("view");
  const [draft, setDraft] = useState<EditableInstance>(() =>
    fromSidebarInstance(instance),
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const defaults = useMemo(
    () => defaultWorkspaceForSlug(instance.slug),
    [instance.slug],
  );

  const persistedRevision = useMemo(() => {
    const updatedAt = instance.state.updatedAt;
    return typeof updatedAt === "string" ? updatedAt : instance.instanceId;
  }, [instance.instanceId, instance.state.updatedAt]);

  // Reset when a different instance is selected or persisted data changes
  useEffect(() => {
    setDraft(fromSidebarInstance(instance));
    setErrors({});
    setSaveError(null);
    setMode("view");
  }, [instance.instanceId, persistedRevision, instance]);

  const isDirty = useMemo(() => {
    const baseline = fromSidebarInstance(instance);
    return JSON.stringify(baseline) !== JSON.stringify(draft);
  }, [instance, draft]);

  const enterEdit = useCallback(() => {
    setErrors({});
    setSaveError(null);
    setMode("edit");
  }, []);

  const cancelEdit = useCallback(() => {
    setDraft(fromSidebarInstance(instance));
    setErrors({});
    setSaveError(null);
    setMode("view");
  }, [instance]);

  const updateParameters = useCallback((parameters: Record<string, unknown>) => {
    setDraft((current) => ({ ...current, parameters }));
    setErrors({});
  }, []);

  const updateContext = useCallback((context: Record<string, string>) => {
    setDraft((current) => ({ ...current, context }));
  }, []);

  const updateName = useCallback((name: string) => {
    setDraft((current) => ({ ...current, name }));
  }, []);

  const save = useCallback(
    async (payload?: Record<string, unknown>) => {
      const editable = editableFromSavePayload(draft, payload);
      const paramErrors = validateWorkspaceParameters(
        instance.slug,
        { workspace: editable.parameters },
        defaults,
      );
      const contextErrors = validateContextFields(editable.context);
      let nextErrors = { ...paramErrors, ...contextErrors };

      if (
        PATTERN_INSTRUCTION_SLUGS.includes(
          instance.slug as (typeof PATTERN_INSTRUCTION_SLUGS)[number],
        )
      ) {
        const patternValidation = validatePatternForm(
          instance.slug,
          editable.parameters,
        );
        if (patternValidation && !patternValidation.canSave) {
          nextErrors = { ...nextErrors, ...patternValidation.errors };
        }
      }

      if (hasValidationErrors(nextErrors)) {
        setErrors(nextErrors);
        setSaveError(null);
        return false;
      }

      setIsSaving(true);
      setSaveError(null);
      try {
        const payload = toInstanceStateUpdate(instance.slug, editable);
        if (
          payload.workspace &&
          typeof payload.workspace === "object" &&
          !Array.isArray(payload.workspace)
        ) {
          payload.workspace = stripExtractionMeta(
            payload.workspace as Record<string, unknown>,
          );
        }

        const nextState = await onSave(payload);
        setDraft(
          fromSidebarInstance({
            ...instance,
            state: nextState,
          }),
        );
        setMode("view");
        setErrors({});
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not save instance";
        setSaveError(message);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [defaults, draft, instance, onSave],
  );

  // Ctrl/Cmd+S while editing
  useEffect(() => {
    if (mode !== "edit") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        void save();
      }
      if (event.key === "Escape") {
        cancelEdit();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, save, cancelEdit]);

  return {
    mode,
    draft,
    errors,
    saveError,
    isDirty,
    isSaving,
    enterEdit,
    cancelEdit,
    save,
    updateParameters,
    updateContext,
    updateName,
  };
}
