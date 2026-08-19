"use client";

import { defaultWorkspaceForSlug } from "@/lib/workspace-defaults";
import { AssumptionSurfaceWorkspace } from "./workspaces/AssumptionSurfaceWorkspace";
import { BackgroundWorkLedgerWorkspace } from "./workspaces/BackgroundWorkLedgerWorkspace";
import { ConvergencePointWorkspace } from "./workspaces/ConvergencePointWorkspace";
import { DecisionLedgerWorkspace } from "./workspaces/DecisionLedgerWorkspace";
import { MemoryCommitmentReviewWorkspace } from "./workspaces/MemoryCommitmentReviewWorkspace";
import {
  CredentialBoundaryWorkspace,
  DeferredDetailWorkspace,
  PresenceBoundaryWorkspace,
} from "./workspaces/OtherPatternWorkspaces";
import {
  FieldLabel,
  Section,
  TextArea,
  WorkspaceShell,
} from "./workspaces/shared";

export type PatternWorkspaceProps = {
  slug: string;
  patternName: string;
  state: Record<string, unknown>;
  onSaveState: (updates: Record<string, unknown>) => Promise<void>;
  isLoading?: boolean;
};

type GenericNotes = { notes: string };

function GenericNotesWorkspace({
  slug,
  patternName,
  state,
  onSaveState,
}: PatternWorkspaceProps) {
  const defaults = defaultWorkspaceForSlug(slug) as GenericNotes;

  return (
    <WorkspaceShell
      state={state}
      patternName={patternName}
      onSaveState={onSaveState}
      defaults={defaults}
    >
      {({ draft, updateField }) => (
        <Section title="Workspace notes">
          <FieldLabel htmlFor="notes">Capture your work for this pattern</FieldLabel>
          <TextArea
            id="notes"
            value={draft.notes}
            onChange={(value) => updateField("notes", value)}
            placeholder="This pattern does not have a dedicated workspace yet. Use notes here and the reference design on the right."
            rows={8}
          />
        </Section>
      )}
    </WorkspaceShell>
  );
}

export function PatternWorkspace({
  slug,
  patternName,
  state,
  onSaveState,
}: PatternWorkspaceProps) {
  const shared = {
    state,
    patternName,
    onSaveState,
  };

  switch (slug) {
    case "convergence-point":
      return <ConvergencePointWorkspace {...shared} />;
    case "decision-ledger":
      return <DecisionLedgerWorkspace {...shared} />;
    case "assumption-surface":
      return <AssumptionSurfaceWorkspace {...shared} />;
    case "background-work-ledger":
      return <BackgroundWorkLedgerWorkspace {...shared} />;
    case "memory-commitment-review":
      return <MemoryCommitmentReviewWorkspace {...shared} />;
    case "credential-boundary":
      return <CredentialBoundaryWorkspace {...shared} />;
    case "deferred-detail":
      return <DeferredDetailWorkspace {...shared} />;
    case "presence-boundary":
      return <PresenceBoundaryWorkspace {...shared} />;
    default:
      return (
        <GenericNotesWorkspace
          slug={slug}
          patternName={patternName}
          state={state}
          onSaveState={onSaveState}
        />
      );
  }
}
