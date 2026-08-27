"use client";

import { ActiveInstancePanel } from "@/components/edit/ActiveInstancePanel";
import type { InstanceSidebarData } from "@/lib/instance-types";

export type { InstanceSidebarData };

type InstanceSidebarProps = {
  instance: InstanceSidebarData;
  onClose: () => void;
  onEditState: (updates: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

export function InstanceSidebar({
  instance,
  onClose,
  onEditState,
}: InstanceSidebarProps) {
  return (
    <ActiveInstancePanel
      instance={instance}
      onClose={onClose}
      onInstanceUpdate={onEditState}
    />
  );
}
