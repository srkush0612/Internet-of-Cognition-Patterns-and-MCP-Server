"use client";

import {
  DEFAULT_DECISION_LEDGER,
  type DecisionLedgerWorkspaceState,
} from "@/lib/workspace-defaults";
import {
  FieldLabel,
  Section,
  TextArea,
  TextInput,
  WorkspaceShell,
  type WorkspaceBaseProps,
} from "./shared";

type Props = Omit<
  WorkspaceBaseProps<DecisionLedgerWorkspaceState>,
  "defaults" | "children"
>;

export function DecisionLedgerWorkspace(props: Props) {
  return (
    <WorkspaceShell {...props} defaults={DEFAULT_DECISION_LEDGER}>
      {({ draft, updateField }) => (
        <>
          <Section title="Required">
            <FieldLabel htmlFor="decision">What decision needed to be made?</FieldLabel>
            <TextInput
              id="decision"
              value={draft.decision}
              onChange={(value) => updateField("decision", value)}
              placeholder="e.g. Choose deployment timing"
            />
            <FieldLabel htmlFor="chosen">Which option was chosen?</FieldLabel>
            <TextInput
              id="chosen"
              value={draft.chosen}
              onChange={(value) => updateField("chosen", value)}
              placeholder="e.g. Delayed rollout with QA"
            />
            <FieldLabel htmlFor="reasoning">Why was this option chosen?</FieldLabel>
            <TextArea
              id="reasoning"
              value={draft.reasoning}
              onChange={(value) => updateField("reasoning", value)}
              placeholder="Constraints, trade-offs, evidence…"
            />
          </Section>

          <Section title="Recommended">
            <FieldLabel htmlFor="alternatives">What other options were considered?</FieldLabel>
            <TextArea
              id="alternatives"
              value={draft.alternatives}
              onChange={(value) => updateField("alternatives", value)}
              rows={3}
            />
            <FieldLabel htmlFor="decided-by">Who made this decision?</FieldLabel>
            <TextInput
              id="decided-by"
              value={draft.decided_by}
              onChange={(value) => updateField("decided_by", value)}
            />
            <FieldLabel htmlFor="constraints">What constraints shaped this choice?</FieldLabel>
            <TextArea
              id="constraints"
              value={draft.constraints}
              onChange={(value) => updateField("constraints", value)}
              rows={3}
            />
          </Section>
        </>
      )}
    </WorkspaceShell>
  );
}
