"use client";

import { useState } from "react";
import {
  DEFAULT_DECISION_LEDGER,
  type DecisionLedgerWorkspaceState,
} from "@/lib/workspace-defaults";
import {
  AddButton,
  FieldLabel,
  RemoveChip,
  Section,
  SelectInput,
  TextArea,
  TextInput,
  WorkspaceShell,
  type WorkspaceBaseProps,
} from "./shared";

type Props = Omit<
  WorkspaceBaseProps<DecisionLedgerWorkspaceState>,
  "defaults" | "children"
>;

function EvidenceField({
  evidence,
  onChange,
}: {
  evidence: string[];
  onChange: (evidence: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div>
      <FieldLabel>Supporting evidence</FieldLabel>
      <div className="mt-2 flex flex-wrap gap-2">
        {evidence.map((item, index) => (
          <RemoveChip
            key={`${item}-${index}`}
            label={item || "Untitled"}
            onRemove={() => onChange(evidence.filter((_, i) => i !== index))}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <TextInput
          value={draft}
          onChange={setDraft}
          placeholder="Add evidence source…"
        />
      </div>
      <div className="mt-2">
        <AddButton
          label="Add evidence"
          onClick={() => {
            const next = draft.trim();
            if (!next) return;
            onChange([...evidence, next]);
            setDraft("");
          }}
        />
      </div>
    </div>
  );
}

export function DecisionLedgerWorkspace(props: Props) {
  return (
    <WorkspaceShell {...props} defaults={DEFAULT_DECISION_LEDGER}>
      {({ draft, updateField }) => (
        <>
          <Section title="Decision">
            <FieldLabel htmlFor="decision">What decision are you making?</FieldLabel>
            <TextInput
              id="decision"
              value={draft.decision}
              onChange={(value) => updateField("decision", value)}
              placeholder="e.g. Firmware upgrade path"
            />
          </Section>

          <Section title="Reasoning">
            <FieldLabel htmlFor="agent-reasoning">Agent&apos;s reasoning</FieldLabel>
            <TextArea
              id="agent-reasoning"
              value={draft.agentReasoning}
              onChange={(value) => updateField("agentReasoning", value)}
              placeholder="Why the agent recommends this…"
            />
            <FieldLabel htmlFor="operator-context">Operator&apos;s context (optional)</FieldLabel>
            <TextArea
              id="operator-context"
              value={draft.operatorContext}
              onChange={(value) => updateField("operatorContext", value)}
              placeholder="Constraints, rollback window, policy…"
              rows={3}
            />
          </Section>

          <Section title="Backing">
            <FieldLabel>Backing strength</FieldLabel>
            <SelectInput
              value={draft.backingStrength}
              onChange={(value) => updateField("backingStrength", value)}
              options={["Strong", "Moderate", "Thin", "None"]}
            />
            <div className="mt-3">
              <EvidenceField
                evidence={draft.evidence}
                onChange={(value) => updateField("evidence", value)}
              />
            </div>
          </Section>
        </>
      )}
    </WorkspaceShell>
  );
}
