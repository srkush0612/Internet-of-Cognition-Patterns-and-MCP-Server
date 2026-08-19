"use client";

import { useState } from "react";
import {
  DEFAULT_BACKGROUND_WORK,
  type BackgroundWorkWorkspaceState,
} from "@/lib/workspace-defaults";
import {
  AddButton,
  FieldLabel,
  Section,
  TextArea,
  TextInput,
  WorkspaceShell,
  type WorkspaceBaseProps,
} from "./shared";

type Props = Omit<
  WorkspaceBaseProps<BackgroundWorkWorkspaceState>,
  "defaults" | "children"
>;

function StatusUpdatesField({
  updates,
  onChange,
}: {
  updates: BackgroundWorkWorkspaceState["statusUpdates"];
  onChange: (updates: BackgroundWorkWorkspaceState["statusUpdates"]) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <>
      <div className="space-y-2">
        {updates.map((update, index) => (
          <div
            key={`${update.timestamp}-${index}`}
            className="rounded-lg border border-line bg-hover/40 px-3 py-2 text-sm text-muted"
          >
            <span className="font-mono text-xs text-subtle">
              {update.timestamp || "—"}
            </span>
            <p className="mt-0.5 text-ink">{update.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        <TextInput
          value={draft}
          onChange={setDraft}
          placeholder="New update…"
        />
      </div>
      <div className="mt-2">
        <AddButton
          label="Add update"
          onClick={() => {
            const text = draft.trim();
            if (!text) return;
            const timestamp = new Date().toLocaleString(undefined, {
              dateStyle: "short",
              timeStyle: "short",
            });
            onChange([...updates, { timestamp, text }]);
            setDraft("");
          }}
        />
      </div>
    </>
  );
}

export function BackgroundWorkLedgerWorkspace(props: Props) {
  return (
    <WorkspaceShell {...props} defaults={DEFAULT_BACKGROUND_WORK}>
      {({ draft, updateField }) => (
        <>
          <Section title="Work">
            <FieldLabel htmlFor="work">What work is happening in the background?</FieldLabel>
            <TextInput
              id="work"
              value={draft.workDescription}
              onChange={(value) => updateField("workDescription", value)}
              placeholder="e.g. Schema migration"
            />
          </Section>

          <Section title="Timeline">
            <FieldLabel htmlFor="started">Started</FieldLabel>
            <input
              id="started"
              type="date"
              value={draft.startedAt}
              onChange={(event) => updateField("startedAt", event.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-[var(--color-tag-bg)]"
            />
            <FieldLabel htmlFor="target">Target completion</FieldLabel>
            <input
              id="target"
              type="date"
              value={draft.targetCompletion}
              onChange={(event) =>
                updateField("targetCompletion", event.target.value)
              }
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-[var(--color-tag-bg)]"
            />
          </Section>

          <Section title="Status updates">
            <StatusUpdatesField
              updates={draft.statusUpdates}
              onChange={(value) => updateField("statusUpdates", value)}
            />
          </Section>

          <Section title="Blockers">
            <FieldLabel htmlFor="blockers">Current blockers</FieldLabel>
            <TextArea
              id="blockers"
              value={draft.blockers}
              onChange={(value) => updateField("blockers", value)}
              placeholder="Waiting for approval, dependency…"
              rows={3}
            />
          </Section>
        </>
      )}
    </WorkspaceShell>
  );
}
