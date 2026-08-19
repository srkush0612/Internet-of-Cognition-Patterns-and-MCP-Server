"use client";

import { PatternWorkspace } from "@/components/PatternWorkspace";
import type { ComponentDefinition } from "@/lib/pattern-advisor";

export type InstanceSidebarData = {
  instanceId: string;
  slug: string;
  component: ComponentDefinition;
  state: Record<string, unknown>;
  explanation?: string;
};

type InstanceSidebarProps = {
  instance: InstanceSidebarData;
  onClose: () => void;
  onEditState: (updates: Record<string, unknown>) => Promise<void>;
};

export function InstanceSidebar({
  instance,
  onClose,
  onEditState,
}: InstanceSidebarProps) {
  const patternName = instance.component.metadata.name;

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line bg-white px-4 py-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Active instance
          </h2>
          <p className="mt-0.5 text-sm font-semibold text-ink">{patternName}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-muted transition hover:bg-hover hover:text-ink"
        >
          Close
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-4">
        <PatternWorkspace
          slug={instance.slug}
          patternName={patternName}
          state={instance.state}
          onSaveState={onEditState}
        />
      </div>
    </div>
  );
}
