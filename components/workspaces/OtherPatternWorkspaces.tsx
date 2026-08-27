"use client";

import { useState } from "react";
import {
  DEFAULT_CREDENTIAL_BOUNDARY,
  DEFAULT_DEFERRED_DETAIL,
  DEFAULT_PRESENCE_BOUNDARY,
  type CredentialBoundaryWorkspaceState,
  type DeferredDetailWorkspaceState,
  type PresenceBoundaryWorkspaceState,
} from "@/lib/workspace-defaults";
import {
  AddButton,
  FieldLabel,
  RemoveChip,
  Section,
  TextArea,
  TextInput,
  WorkspaceShell,
  type WorkspaceBaseProps,
} from "./shared";

type CredentialProps = Omit<
  WorkspaceBaseProps<CredentialBoundaryWorkspaceState>,
  "defaults" | "children"
>;

export function CredentialBoundaryWorkspace(props: CredentialProps) {
  return (
    <WorkspaceShell {...props} defaults={DEFAULT_CREDENTIAL_BOUNDARY}>
      {({ draft, updateField }) => (
        <>
          <Section title="Required">
            <FieldLabel htmlFor="decision">What decision required multiple roles?</FieldLabel>
            <TextArea
              id="decision"
              value={draft.decision}
              onChange={(value) => updateField("decision", value)}
              rows={2}
            />
            <FieldLabel htmlFor="roles">What did each role contribute?</FieldLabel>
            <TextArea
              id="roles"
              value={draft.roles_and_contributions}
              onChange={(value) => updateField("roles_and_contributions", value)}
              rows={3}
            />
            <FieldLabel htmlFor="gaps">Why wasn't one role enough?</FieldLabel>
            <TextArea
              id="gaps"
              value={draft.capability_gaps}
              onChange={(value) => updateField("capability_gaps", value)}
              rows={3}
            />
          </Section>
          <Section title="Recommended">
            <FieldLabel htmlFor="authority">Who had final authority on each aspect?</FieldLabel>
            <TextArea
              id="authority"
              value={draft.decision_authority}
              onChange={(value) => updateField("decision_authority", value)}
              rows={2}
            />
            <FieldLabel htmlFor="missing-role">What would break if a role was missing?</FieldLabel>
            <TextArea
              id="missing-role"
              value={draft.if_missing_role}
              onChange={(value) => updateField("if_missing_role", value)}
              rows={2}
            />
          </Section>
        </>
      )}
    </WorkspaceShell>
  );
}

type DeferredProps = Omit<
  WorkspaceBaseProps<DeferredDetailWorkspaceState>,
  "defaults" | "children"
>;

function TagField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((item, index) => (
          <RemoveChip
            key={`${item}-${index}`}
            label={item || "Untitled"}
            onRemove={() => onChange(values.filter((_, i) => i !== index))}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <TextInput value={draft} onChange={setDraft} placeholder={placeholder} />
        <AddButton
          label="Add"
          onClick={() => {
            const next = draft.trim();
            if (!next) return;
            onChange([...values, next]);
            setDraft("");
          }}
        />
      </div>
    </div>
  );
}

export function DeferredDetailWorkspace(props: DeferredProps) {
  return (
    <WorkspaceShell {...props} defaults={DEFAULT_DEFERRED_DETAIL}>
      {({ draft, updateField }) => (
        <>
          <Section title="Required">
            <FieldLabel htmlFor="goal">What was the overall goal?</FieldLabel>
            <TextArea
              id="goal"
              value={draft.overall_goal}
              onChange={(value) => updateField("overall_goal", value)}
              rows={3}
            />
            <TagField
              label="What phases happened in sequence?"
              values={draft.phases}
              onChange={(value) => updateField("phases", value)}
              placeholder="Q1: Evaluation…"
            />
            <TagField
              label="What was deferred from each phase and why?"
              values={draft.deferred_details}
              onChange={(value) => updateField("deferred_details", value)}
              placeholder="Q1: scale (no data yet)…"
            />
          </Section>
          <Section title="Recommended">
            <FieldLabel htmlFor="handoff">What triggered each phase transition?</FieldLabel>
            <TextArea
              id="handoff"
              value={draft.handoff_points}
              onChange={(value) => updateField("handoff_points", value)}
              rows={2}
            />
            <FieldLabel htmlFor="learnings">What did each phase teach you?</FieldLabel>
            <TextArea
              id="learnings"
              value={draft.phase_learnings}
              onChange={(value) => updateField("phase_learnings", value)}
              rows={2}
            />
          </Section>
        </>
      )}
    </WorkspaceShell>
  );
}

type PresenceProps = Omit<
  WorkspaceBaseProps<PresenceBoundaryWorkspaceState>,
  "defaults" | "children"
>;

export function PresenceBoundaryWorkspace(props: PresenceProps) {
  return (
    <WorkspaceShell {...props} defaults={DEFAULT_PRESENCE_BOUNDARY}>
      {({ draft, updateField }) => (
        <>
          <Section title="Required">
            <FieldLabel htmlFor="initial">Who initially noticed the problem?</FieldLabel>
            <TextArea
              id="initial"
              value={draft.initial_state}
              onChange={(value) => updateField("initial_state", value)}
              rows={3}
            />
            <FieldLabel htmlFor="escalation">What brought each agent in?</FieldLabel>
            <TextArea
              id="escalation"
              value={draft.escalation_triggers}
              onChange={(value) => updateField("escalation_triggers", value)}
              rows={3}
            />
            <FieldLabel htmlFor="progression">What information surfaced at each step?</FieldLabel>
            <TextArea
              id="progression"
              value={draft.information_progression}
              onChange={(value) => updateField("information_progression", value)}
              rows={3}
            />
          </Section>
          <Section title="Recommended">
            <FieldLabel htmlFor="gaps">What was each agent blind to at first?</FieldLabel>
            <TextArea
              id="gaps"
              value={draft.visibility_gaps}
              onChange={(value) => updateField("visibility_gaps", value)}
              rows={2}
            />
            <FieldLabel htmlFor="impact">How did new information change the decision?</FieldLabel>
            <TextArea
              id="impact"
              value={draft.decision_impact}
              onChange={(value) => updateField("decision_impact", value)}
              rows={2}
            />
          </Section>
        </>
      )}
    </WorkspaceShell>
  );
}
