"use client";

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
  Section,
  SelectInput,
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
          <Section title="Scopes">
            <FieldLabel htmlFor="scope-a">Scope A (what stays here)</FieldLabel>
            <TextInput
              id="scope-a"
              value={draft.scopeA}
              onChange={(value) => updateField("scopeA", value)}
              placeholder="e.g. Read-only audit logs"
            />
            <FieldLabel htmlFor="scope-b">Scope B (what crosses boundary)</FieldLabel>
            <TextInput
              id="scope-b"
              value={draft.scopeB}
              onChange={(value) => updateField("scopeB", value)}
              placeholder="e.g. Write access to production"
            />
          </Section>
          <Section title="Boundary">
            <FieldLabel htmlFor="note">Boundary note</FieldLabel>
            <TextArea
              id="note"
              value={draft.boundaryNote}
              onChange={(value) => updateField("boundaryNote", value)}
              placeholder="Why the split exists, approval required…"
              rows={3}
            />
            <FieldLabel htmlFor="outcome">Outcome / decision</FieldLabel>
            <TextInput
              id="outcome"
              value={draft.outcome}
              onChange={(value) => updateField("outcome", value)}
              placeholder="What was approved or denied"
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

export function DeferredDetailWorkspace(props: DeferredProps) {
  return (
    <WorkspaceShell {...props} defaults={DEFAULT_DEFERRED_DETAIL}>
      {({ draft, updateField }) => (
        <>
          <Section title="Summary">
            <FieldLabel htmlFor="summary">What the operator sees now</FieldLabel>
            <TextArea
              id="summary"
              value={draft.summary}
              onChange={(value) => updateField("summary", value)}
              placeholder="High-level summary without sensitive detail…"
              rows={3}
            />
          </Section>
          <Section title="Deferred fields">
            <div className="space-y-2">
              {draft.deferredFields.map((field, index) => (
                <TextInput
                  key={index}
                  value={field}
                  onChange={(value) => {
                    const deferredFields = [...draft.deferredFields];
                    deferredFields[index] = value;
                    updateField("deferredFields", deferredFields);
                  }}
                  placeholder="Field or detail held back…"
                />
              ))}
            </div>
            <div className="mt-2">
              <AddButton
                label="Add deferred field"
                onClick={() =>
                  updateField("deferredFields", [...draft.deferredFields, ""])
                }
              />
            </div>
          </Section>
          <Section title="Reveal">
            <FieldLabel htmlFor="reveal">Reveal when</FieldLabel>
            <TextInput
              id="reveal"
              value={draft.revealWhen}
              onChange={(value) => updateField("revealWhen", value)}
              placeholder="Operator asks, step-up auth, task complete…"
            />
            <FieldLabel htmlFor="detail">Current detail level</FieldLabel>
            <SelectInput
              value={draft.currentDetail}
              onChange={(value) => updateField("currentDetail", value)}
              options={["Summary only", "Partial", "Full (revealed)"]}
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
          <Section title="Agent presence">
            <FieldLabel>Agent state</FieldLabel>
            <SelectInput
              value={draft.agentState}
              onChange={(value) => updateField("agentState", value)}
              options={["observing", "ready", "acting", "paused"]}
            />
            <FieldLabel htmlFor="watching">What the agent is watching</FieldLabel>
            <TextArea
              id="watching"
              value={draft.watching}
              onChange={(value) => updateField("watching", value)}
              placeholder="Signals, queues, dashboards…"
              rows={3}
            />
          </Section>
          <Section title="Boundaries">
            <FieldLabel htmlFor="can-act">What it can act on</FieldLabel>
            <TextArea
              id="can-act"
              value={draft.canActOn}
              onChange={(value) => updateField("canActOn", value)}
              placeholder="Allowed actions within scope…"
              rows={3}
            />
            <FieldLabel htmlFor="operator">Operator action needed</FieldLabel>
            <TextArea
              id="operator"
              value={draft.operatorAction}
              onChange={(value) => updateField("operatorAction", value)}
              placeholder="Approve, override, provide input…"
              rows={3}
            />
          </Section>
        </>
      )}
    </WorkspaceShell>
  );
}
