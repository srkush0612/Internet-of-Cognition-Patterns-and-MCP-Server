"use client";

import { useEffect } from "react";
import { EditPanel } from "@/components/edit/EditPanel";
import { EditPanelDrawer } from "@/components/edit/EditPanelDrawer";
import { useEditPanel } from "@/hooks/useEditPanel";
import type { InstanceSidebarData } from "@/lib/instance-types";

type InstanceEditDrawerProps = {
  isOpen: boolean;
  instance: InstanceSidebarData | null;
  onClose: () => void;
  onInstanceUpdate: (
    updates: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>;
  onPatternGuidanceChange?: (messages: string[]) => void;
};

function InstanceEditDrawerContent({
  isOpen,
  instance,
  onClose,
  onInstanceUpdate,
  onPatternGuidanceChange,
}: InstanceEditDrawerProps & { instance: InstanceSidebarData }) {
  const patternName = instance.component.metadata.name;
  const edit = useEditPanel({ instance, onSave: onInstanceUpdate });

  useEffect(() => {
    if (isOpen) {
      edit.enterEdit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- enter edit when drawer opens
  }, [isOpen, instance.instanceId]);

  const handleClose = () => {
    if (edit.isSaving) return;
    edit.cancelEdit();
    onClose();
  };

  const handleSave = async () => {
    const saved = await edit.save();
    if (saved) {
      onClose();
    }
  };

  return (
    <EditPanelDrawer
      isOpen={isOpen}
      title="Customise"
      subtitle={edit.draft.name || patternName}
      isSaving={edit.isSaving}
      onClose={handleClose}
      onSave={() => void handleSave()}
      onCancel={handleClose}
    >
      {edit.saveError ? (
        <div
          className="mb-3 rounded-lg border border-line px-3 py-2 text-sm text-[var(--text-error,#b91c1c)]"
          role="alert"
        >
          {edit.saveError}
        </div>
      ) : null}

      <EditPanel
        instance={instance}
        draft={edit.draft}
        errors={edit.errors}
        saveError={null}
        isSaving={edit.isSaving}
        hideFooter
        onParametersChange={edit.updateParameters}
        onContextChange={edit.updateContext}
        onNameChange={edit.updateName}
        onSave={(payload) => edit.save(payload)}
        onCancel={handleClose}
        onPatternGuidanceChange={onPatternGuidanceChange}
      />
    </EditPanelDrawer>
  );
}

export function InstanceEditDrawer({
  isOpen,
  instance,
  onClose,
  onInstanceUpdate,
  onPatternGuidanceChange,
}: InstanceEditDrawerProps) {
  if (!instance) {
    return null;
  }

  return (
    <InstanceEditDrawerContent
      isOpen={isOpen}
      instance={instance}
      onClose={onClose}
      onInstanceUpdate={onInstanceUpdate}
      onPatternGuidanceChange={onPatternGuidanceChange}
    />
  );
}
