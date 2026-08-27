"use client";

import {
  DEFAULT_ASSUMPTION,
  type AssumptionSurfaceWorkspaceState,
} from "@/lib/workspace-defaults";
import {
  FieldLabel,
  Section,
  TextArea,
  WorkspaceShell,
  type WorkspaceBaseProps,
} from "./shared";

type Props = Omit<
  WorkspaceBaseProps<AssumptionSurfaceWorkspaceState>,
  "defaults" | "children"
>;

export function AssumptionSurfaceWorkspace(props: Props) {
  return (
    <WorkspaceShell {...props} defaults={DEFAULT_ASSUMPTION}>
      {({ draft, updateField }) => (
        <>
          <Section title="Required">
            <FieldLabel htmlFor="agents-assumptions">What did each agent assume?</FieldLabel>
            <TextArea
              id="agents-assumptions"
              value={draft.agents_and_assumptions}
              onChange={(value) => updateField("agents_and_assumptions", value)}
              placeholder="Link each agent to their assumption…"
              rows={4}
            />
            <FieldLabel htmlFor="disagreement">What positions did those assumptions create?</FieldLabel>
            <TextArea
              id="disagreement"
              value={draft.disagreement}
              onChange={(value) => updateField("disagreement", value)}
              placeholder="Conflicting positions from different beliefs…"
              rows={3}
            />
          </Section>

          <Section title="Recommended">
            <FieldLabel htmlFor="assumption-evidence">What evidence backed each assumption?</FieldLabel>
            <TextArea
              id="assumption-evidence"
              value={draft.assumption_evidence}
              onChange={(value) => updateField("assumption_evidence", value)}
              rows={3}
            />
            <FieldLabel htmlFor="validated">Were assumptions validated or proved wrong?</FieldLabel>
            <TextArea
              id="validated"
              value={draft.validated_assumptions}
              onChange={(value) => updateField("validated_assumptions", value)}
              rows={3}
            />
          </Section>
        </>
      )}
    </WorkspaceShell>
  );
}
