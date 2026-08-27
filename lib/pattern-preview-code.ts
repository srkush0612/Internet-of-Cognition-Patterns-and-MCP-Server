import { emptyContextFromPresets } from "@/lib/context-field-config";
import { defaultWorkspaceForSlug } from "@/lib/workspace-defaults";

export function buildInstanceTemplate(
  slug: string,
  title?: string,
): Record<string, unknown> {
  return {
    title: title ?? slug,
    workspace: defaultWorkspaceForSlug(slug),
    context: emptyContextFromPresets(),
  };
}

export function buildInstantiateSnippet(slug: string, title?: string): string {
  const payload = {
    action: "instantiate",
    slug,
    agent_id: "your-agent-id",
    initial_state: buildInstanceTemplate(slug, title),
  };

  return `curl -sS -X POST http://localhost:3000/api/instances \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload, null, 2)}'`;
}
