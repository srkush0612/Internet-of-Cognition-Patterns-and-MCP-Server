"use client";

import {
  DEFAULT_ASSUMPTION,
  type AssumptionSurfaceWorkspaceState,
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
  WorkspaceBaseProps<AssumptionSurfaceWorkspaceState>,
  "defaults" | "children"
>;

export function AssumptionSurfaceWorkspace(props: Props) {
  return (
    <WorkspaceShell {...props} defaults={DEFAULT_ASSUMPTION}>
      {({ draft, updateField }) => (
        <>
          <Section title="Assumption">
            <FieldLabel htmlFor="assumption">What assumption are we testing?</FieldLabel>
            <TextInput
              id="assumption"
              value={draft.assumption}
              onChange={(value) => updateField("assumption", value)}
              placeholder="e.g. Users prefer OAuth over API keys"
            />
          </Section>

          <Section title="Hypothesis">
            <FieldLabel htmlFor="why">Why we believe it</FieldLabel>
            <TextArea
              id="why"
              value={draft.whyWeBelieve}
              onChange={(value) => updateField("whyWeBelieve", value)}
              placeholder="User feedback, surveys, prior data…"
              rows={3}
            />
            <FieldLabel htmlFor="if-wrong">If wrong, what breaks?</FieldLabel>
            <TextArea
              id="if-wrong"
              value={draft.ifWrong}
              onChange={(value) => updateField("ifWrong", value)}
              placeholder="Auth flow, SSO integration, onboarding…"
              rows={3}
            />
            <FieldLabel htmlFor="how-test">How to test it</FieldLabel>
            <TextArea
              id="how-test"
              value={draft.howToTest}
              onChange={(value) => updateField("howToTest", value)}
              placeholder="A/B test, metrics to watch…"
              rows={3}
            />
          </Section>

          <Section title="Status">
            <FieldLabel>Test status</FieldLabel>
            <SelectInput
              value={draft.testStatus}
              onChange={(value) => updateField("testStatus", value)}
              options={["Not started", "Running", "Complete"]}
            />
            <FieldLabel>Result</FieldLabel>
            <div className="flex flex-wrap gap-4 pt-1">
              {(
                [
                  ["confirmed", "Confirmed"],
                  ["refuted", "Refuted"],
                  ["tbd", "TBD"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="radio"
                    name="assumption-result"
                    checked={draft.result === value}
                    onChange={() => updateField("result", value)}
                    className="accent-accent"
                  />
                  {label}
                </label>
              ))}
            </div>
          </Section>
        </>
      )}
    </WorkspaceShell>
  );
}
