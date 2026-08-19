"use client";

import {
  DEFAULT_MEMORY_COMMITMENT,
  type MemoryCommitmentWorkspaceState,
} from "@/lib/workspace-defaults";
import {
  FieldLabel,
  Section,
  SelectInput,
  TextArea,
  TextInput,
  WorkspaceShell,
  type WorkspaceBaseProps,
} from "./shared";

type Props = Omit<
  WorkspaceBaseProps<MemoryCommitmentWorkspaceState>,
  "defaults" | "children"
>;

export function MemoryCommitmentReviewWorkspace(props: Props) {
  return (
    <WorkspaceShell {...props} defaults={DEFAULT_MEMORY_COMMITMENT}>
      {({ draft, updateField }) => (
        <>
          <Section title="Commitment">
            <FieldLabel htmlFor="recording">What are we recording?</FieldLabel>
            <TextInput
              id="recording"
              value={draft.recording}
              onChange={(value) => updateField("recording", value)}
              placeholder="e.g. User preferences, policy decisions…"
            />
          </Section>

          <Section title="Long-term value">
            <FieldLabel htmlFor="why">Why it matters long-term</FieldLabel>
            <TextArea
              id="why"
              value={draft.whyItMatters}
              onChange={(value) => updateField("whyItMatters", value)}
              placeholder="How this affects future behavior…"
              rows={3}
            />
            <FieldLabel htmlFor="verify">How will we verify it later?</FieldLabel>
            <TextArea
              id="verify"
              value={draft.verification}
              onChange={(value) => updateField("verification", value)}
              placeholder="Audit query, manual review…"
              rows={3}
            />
          </Section>

          <Section title="Retention">
            <FieldLabel>Retention policy</FieldLabel>
            <SelectInput
              value={draft.retention}
              onChange={(value) => updateField("retention", value)}
              options={["1 year", "3 years", "5 years", "Indefinite"]}
            />
          </Section>
        </>
      )}
    </WorkspaceShell>
  );
}
