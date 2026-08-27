"use client";

import { useCallback, useEffect } from "react";
import { PatternEditPanel } from "@/components/patterns/edit/PatternEditPanel";
import {
  ConvergencePointEditPanel,
  type ConvergenceFormData,
} from "@/components/patterns/edit/convergence-point-edit-panel";
import {
  convergenceFormToWorkspace,
  workspaceToConvergenceForm,
} from "@/components/patterns/edit/convergence-point-extractor";
import { getPatternGuidanceMessages } from "@/lib/patterns/extraction-flow";
import { PATTERN_INSTRUCTION_SLUGS } from "@/lib/patterns/loader";
import { defaultWorkspaceForSlug } from "@/lib/workspace-defaults";
import type { ValidationErrors } from "@/lib/pattern-validation";
import type { EditableInstance } from "@/lib/instance-edit-model";
import type { InstanceSidebarData } from "@/lib/instance-types";

type EditPanelProps = {
  instance: InstanceSidebarData;
  draft: EditableInstance;
  errors: ValidationErrors;
  saveError: string | null;
  isSaving: boolean;
  hideFooter?: boolean;
  onParametersChange: (parameters: Record<string, unknown>) => void;
  onContextChange: (context: Record<string, string>) => void;
  onNameChange: (name: string) => void;
  onSave: (payload?: Record<string, unknown>) => Promise<boolean>;
  onCancel: () => void;
  onPatternGuidanceChange?: (messages: string[]) => void;
};

function useConvergenceEditHandlers(
  draft: EditableInstance,
  onParametersChange: (parameters: Record<string, unknown>) => void,
  onSave: (payload?: Record<string, unknown>) => Promise<boolean>,
) {
  const handleChange = useCallback(
    (data: ConvergenceFormData) => {
      onParametersChange({
        ...defaultWorkspaceForSlug("convergence-point"),
        ...convergenceFormToWorkspace(data as Record<string, unknown>),
      });
    },
    [onParametersChange],
  );

  const handleSave = useCallback(
    async (data: ConvergenceFormData) => {
      return onSave({
        title: draft.name,
        workspace: {
          ...defaultWorkspaceForSlug("convergence-point"),
          ...convergenceFormToWorkspace(data as Record<string, unknown>),
        },
        context: draft.context,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      });
    },
    [draft.context, draft.createdAt, draft.name, draft.updatedAt, onSave],
  );

  return { handleChange, handleSave };
}

export function EditPanel({
  instance,
  draft,
  errors,
  saveError,
  isSaving,
  hideFooter = false,
  onParametersChange,
  onContextChange,
  onNameChange,
  onSave,
  onCancel,
  onPatternGuidanceChange,
}: EditPanelProps) {
  const isConvergencePoint = instance.slug === "convergence-point";
  const hasInstructions = PATTERN_INSTRUCTION_SLUGS.includes(
    instance.slug as (typeof PATTERN_INSTRUCTION_SLUGS)[number],
  );

  useEffect(() => {
    if (!onPatternGuidanceChange || !hasInstructions || isConvergencePoint) {
      return;
    }
    const timer = window.setTimeout(() => {
      onPatternGuidanceChange(
        getPatternGuidanceMessages(instance.slug, draft.parameters),
      );
    }, 300);
    return () => window.clearTimeout(timer);
  }, [
    draft.parameters,
    hasInstructions,
    instance.slug,
    isConvergencePoint,
    onPatternGuidanceChange,
  ]);

  const convergenceData = isConvergencePoint
    ? (workspaceToConvergenceForm(draft.parameters) as ConvergenceFormData)
    : undefined;

  const { handleChange, handleSave } = useConvergenceEditHandlers(
    draft,
    onParametersChange,
    onSave,
  );

  return (
    <div className="edit-panel flex h-full min-h-0 flex-col">
      {saveError ? (
        <div
          className="edit-panel-error mb-3 shrink-0 rounded-lg border px-3 py-2 text-sm"
          role="alert"
        >
          {saveError}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden w-full">
        {isConvergencePoint ? (
          <ConvergencePointEditPanel
            instanceId={instance.instanceId}
            currentData={convergenceData}
            externalErrors={errors}
            isSaving={isSaving}
            hideFooter={hideFooter}
            onChange={handleChange}
            onGuidanceChange={onPatternGuidanceChange}
            onSave={handleSave}
            onCancel={onCancel}
          />
        ) : (
          <PatternEditPanel
            embedded
            patternSlug={instance.slug}
            instanceId={instance.instanceId}
            currentState={{
              title: draft.name,
              workspace: draft.parameters,
              context: draft.context,
              createdAt: draft.createdAt,
              updatedAt: draft.updatedAt,
            }}
            isLoading={isSaving}
            hideFooter={hideFooter}
            externalErrors={errors}
            onParametersChange={onParametersChange}
            onContextChange={onContextChange}
            onNameChange={onNameChange}
            onSave={(payload) => onSave(payload)}
            onClose={onCancel}
            onGuidanceChange={onPatternGuidanceChange}
          />
        )}
      </div>
    </div>
  );
}
