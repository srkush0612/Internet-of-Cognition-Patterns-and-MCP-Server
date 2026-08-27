import type { ComponentDefinition } from "@/lib/pattern-advisor";

/** Active pattern instance shown in the advisor middle panel. */
export type InstanceSidebarData = {
  instanceId: string;
  slug: string;
  component: ComponentDefinition;
  state: Record<string, unknown>;
  explanation?: string;
};
