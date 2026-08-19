"use client";

import {
  DEFAULT_CONVERGENCE,
  type ConvergencePointWorkspaceState,
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
  WorkspaceBaseProps<ConvergencePointWorkspaceState>,
  "defaults" | "children"
>;

export function ConvergencePointWorkspace(props: Props) {
  return (
    <WorkspaceShell {...props} defaults={DEFAULT_CONVERGENCE}>
      {({ draft, updateField }) => (
        <>
          <Section title="Disagreement">
            <FieldLabel htmlFor="disagreement">What&apos;s the disagreement?</FieldLabel>
            <TextArea
              id="disagreement"
              value={draft.disagreement}
              onChange={(value) => updateField("disagreement", value)}
              placeholder="Describe where agents diverge…"
              rows={3}
            />
          </Section>

          <Section title="Agent positions">
            <div className="space-y-4">
              {draft.positions.map((position, index) => (
                <div
                  key={`${position.agent}-${index}`}
                  className="rounded-lg border border-line bg-hover/50 p-3"
                >
                  <FieldLabel>{position.agent}</FieldLabel>
                  <TextInput
                    value={position.stance}
                    onChange={(stance) => {
                      const positions = [...draft.positions];
                      positions[index] = { ...positions[index], stance };
                      updateField("positions", positions);
                    }}
                    placeholder="Their position…"
                  />
                  <div className="mt-2 space-y-2">
                    {position.evidence.map((item, evidenceIndex) => (
                      <TextInput
                        key={evidenceIndex}
                        value={item}
                        onChange={(value) => {
                          const positions = [...draft.positions];
                          const evidence = [...positions[index].evidence];
                          evidence[evidenceIndex] = value;
                          positions[index] = { ...positions[index], evidence };
                          updateField("positions", positions);
                        }}
                        placeholder="Evidence (RFC, doc, metric…)"
                      />
                    ))}
                    <AddButton
                      label="Add evidence"
                      onClick={() => {
                        const positions = [...draft.positions];
                        positions[index] = {
                          ...positions[index],
                          evidence: [...positions[index].evidence, ""],
                        };
                        updateField("positions", positions);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <AddButton
                label="Add another position"
                onClick={() =>
                  updateField("positions", [
                    ...draft.positions,
                    { agent: "Agent", stance: "", evidence: [""] },
                  ])
                }
              />
            </div>
          </Section>

          <Section title="Convergence points">
            <div className="space-y-2">
              {draft.convergencePoints.map((point, index) => (
                <label
                  key={point.label}
                  className="flex cursor-pointer items-start gap-2 rounded-lg border border-line bg-hover/30 px-3 py-2 text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    checked={point.checked}
                    onChange={(event) => {
                      const convergencePoints = [...draft.convergencePoints];
                      convergencePoints[index] = {
                        ...convergencePoints[index],
                        checked: event.target.checked,
                      };
                      updateField("convergencePoints", convergencePoints);
                    }}
                    className="mt-0.5 accent-accent"
                  />
                  <span>{point.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-3">
              <FieldLabel htmlFor="decision">Decision</FieldLabel>
              <TextInput
                id="decision"
                value={draft.decision}
                onChange={(value) => updateField("decision", value)}
                placeholder="Document the agreed path…"
              />
            </div>
          </Section>
        </>
      )}
    </WorkspaceShell>
  );
}
