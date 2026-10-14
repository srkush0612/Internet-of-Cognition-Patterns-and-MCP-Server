"use client";

import { PatternEditPanel } from "@/components/patterns/edit/PatternEditPanel";

type Props = {
  slug: string;
  formKey: string;
  name: string;
  parameters: Record<string, unknown>;
  context: Record<string, string>;
  onNameChange: (name: string) => void;
  onParametersChange: (parameters: Record<string, unknown>) => void;
  onContextChange: (context: Record<string, string>) => void;
};

/**
 * Thin wrapper around the app's existing instance-edit form (already built,
 * already reused across all 8 ready patterns for the /advisor "Customise"
 * drawer) — no new field-rendering code needed. `embedded` mode fires the
 * on*Change callbacks on every keystroke, not just on save, which is what
 * lets the live preview above update instantly.
 */
export function ConfigTab({
  slug,
  formKey,
  name,
  parameters,
  context,
  onNameChange,
  onParametersChange,
  onContextChange,
}: Props) {
  return (
    <PatternEditPanel
      patternSlug={slug}
      instanceId={formKey}
      currentState={{ title: name, workspace: parameters, context }}
      embedded
      hideFooter
      onSave={() => {}}
      onNameChange={onNameChange}
      onParametersChange={onParametersChange}
      onContextChange={onContextChange}
    />
  );
}
