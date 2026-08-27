"use client";

import { EditPanel } from "@/components/edit/EditPanel";
import { InstanceViewPanel } from "@/components/edit/InstanceViewPanel";
import { useEditPanel } from "@/hooks/useEditPanel";
import type { InstanceSidebarData } from "@/lib/instance-types";

type ActiveInstancePanelProps = {
  instance: InstanceSidebarData;
  onClose: () => void;
  onInstanceUpdate: (updates: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

export function ActiveInstancePanel({
  instance,
  onClose,
  onInstanceUpdate,
}: ActiveInstancePanelProps) {
  const patternName = instance.component.metadata.name;
  const edit = useEditPanel({ instance, onSave: onInstanceUpdate });

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line bg-white px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Active instance
          </h2>
          <p className="mt-0.5 truncate text-sm font-semibold text-ink">
            {edit.draft.name || patternName}
          </p>
          {edit.mode === "edit" && edit.isDirty ? (
            <p className="mt-0.5 text-xs text-warning">Unsaved changes</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {edit.mode === "view" ? (
            <button
              type="button"
              onClick={edit.enterEdit}
              className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink transition hover:bg-hover"
            >
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (edit.isDirty) {
                  void edit.save();
                } else {
                  edit.cancelEdit();
                }
              }}
              className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-muted transition hover:bg-hover hover:text-ink"
            >
              Done
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-muted transition hover:bg-hover hover:text-ink"
          >
            Close
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden px-4 pt-4">
        {edit.isSaving ? (
          <div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]"
            aria-live="polite"
            aria-busy="true"
          >
            <span className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm">
              Saving…
            </span>
          </div>
        ) : null}
        {edit.mode === "view" ? (
          <InstanceViewPanel draft={edit.draft} />
        ) : (
          <EditPanel
            instance={instance}
            draft={edit.draft}
            errors={edit.errors}
            saveError={edit.saveError}
            isSaving={edit.isSaving}
            onParametersChange={edit.updateParameters}
            onContextChange={edit.updateContext}
            onNameChange={edit.updateName}
            onSave={(payload) => edit.save(payload)}
            onCancel={edit.cancelEdit}
          />
        )}
      </div>
    </div>
  );
}
