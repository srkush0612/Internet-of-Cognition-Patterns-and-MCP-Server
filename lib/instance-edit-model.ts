import type { InstanceSidebarData } from "@/lib/instance-types";
import { mergeContextPresets } from "@/lib/context-field-config";
import { defaultWorkspaceForSlug, mergeWorkspaceForSlug } from "@/lib/workspace-defaults";

/** Normalized shape aligned with your Edit Panel API. */
export type EditableInstance = {
  id: string;
  name: string;
  patternType: string;
  parameters: Record<string, unknown>;
  context: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
};

export function fromSidebarInstance(instance: InstanceSidebarData): EditableInstance {
  const parameters =
    instance.state.workspace && typeof instance.state.workspace === "object"
      ? mergeWorkspaceForSlug(
          instance.slug,
          instance.state.workspace as Record<string, unknown>,
        )
      : defaultWorkspaceForSlug(instance.slug);

  const rawContext = instance.state.context;
  const context =
    rawContext && typeof rawContext === "object" && !Array.isArray(rawContext)
      ? mergeContextPresets(
          Object.fromEntries(
            Object.entries(rawContext as Record<string, unknown>).map(
              ([key, value]) => [key, String(value ?? "")],
            ),
          ),
        )
      : mergeContextPresets({});

  return {
    id: instance.instanceId,
    name:
      typeof instance.state.title === "string"
        ? instance.state.title
        : instance.component.metadata.name,
    patternType: instance.slug,
    parameters,
    context,
    createdAt:
      typeof instance.state.createdAt === "string" ? instance.state.createdAt : undefined,
    updatedAt:
      typeof instance.state.updatedAt === "string" ? instance.state.updatedAt : undefined,
  };
}

/** Merge editable fields back into the persisted instance state blob. */
export function toInstanceStateUpdate(
  slug: string,
  editable: Pick<EditableInstance, "name" | "parameters" | "context">,
): Record<string, unknown> {
  const workspace = mergeWorkspaceForSlug(slug, editable.parameters);

  return {
    title: editable.name,
    workspace,
    context: editable.context,
    updatedAt: new Date().toISOString(),
  };
}
