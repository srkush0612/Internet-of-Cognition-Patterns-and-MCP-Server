"use client";

import { useState } from "react";
import Link from "next/link";
import { HeroOrbs } from "@/components/PatternTaxonomy";
import { sampleScenario } from "@/lib/studio/content";
import {
  ATTENDANCE_LABEL,
  IRREVERSIBILITY_LABEL,
  TOPOLOGY_LABEL,
  type Attendance,
  type Irreversibility,
  type Topology,
} from "@/lib/studio/types";
import "./studio.css";

type Answers = {
  topology: Topology | null;
  attendance: Attendance | null;
  irreversibility: Irreversibility | null;
};

/**
 * A scenario is named from what the person wrote about it: its first clause,
 * capped. Nothing here composes a name of its own, so an unlabelled scenario
 * says it is unlabelled rather than being given a plausible title.
 */
function scenarioName(description: string): string {
  if (!description) return "Untitled scenario";
  const firstClause = description.split(/[.;\n]/)[0].trim();
  const source = firstClause || description;
  return source.length > 60 ? `${source.slice(0, 57).trimEnd()}…` : source;
}

/** Shown under the answer, so the wording is not the only thing carrying it. */
const ATTENDANCE_HINT: Record<Attendance, string> = {
  watched: "approves before it acts",
  sometimes: "can see it and step in",
  unattended: "finds out afterwards",
};

/**
 * Shown once. After this it collapses into the three chips at the top of the
 * agent pane, which stay editable.
 */
export function SetupCard({
  onSubmit,
}: {
  onSubmit: (input: {
    name: string;
    description: string;
    topology: string;
    attendance: string;
    irreversibility: string;
  }) => Promise<void>;
}) {
  const [description, setDescription] = useState("");
  const [answers, setAnswers] = useState<Answers>({
    topology: null,
    attendance: null,
    irreversibility: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const ready =
    answers.topology !== null &&
    answers.attendance !== null &&
    answers.irreversibility !== null;

  async function submit() {
    if (!ready || submitting) return;
    setSubmitting(true);
    try {
      const text = description.trim();
      await onSubmit({
        name: scenarioName(text),
        description: text,
        topology: answers.topology as string,
        attendance: answers.attendance as string,
        irreversibility: answers.irreversibility as string,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="studio-setup osh-hero">
      <HeroOrbs />

      <div className="osh-card studio-setup__card">
        <h1>What are you handing to agents?</h1>
        <p className="studio-setup__sub">
          A line about what you are building and three quick answers, and we
          will match the patterns that fit it.
        </p>

        <label className="studio-label" htmlFor="studio-desc">
          What is the system doing?
        </label>
        <textarea
          id="studio-desc"
          className="studio-text"
          rows={2}
          value={description}
          placeholder="A telemetry agent watches the fleet, a triage agent works out what it means, and a deploy agent can act on it. On-call is asleep."
          onChange={(event) => setDescription(event.target.value)}
        />

        <fieldset className="studio-q">
          <legend>How many agents, and do they work together?</legend>
          {(Object.keys(TOPOLOGY_LABEL) as Topology[]).map((value) => (
            <button
              key={value}
              type="button"
              className="studio-radio"
              aria-pressed={answers.topology === value}
              onClick={() =>
                setAnswers((current) => ({ ...current, topology: value }))
              }
            >
              {TOPOLOGY_LABEL[value]}
            </button>
          ))}
          <p className="studio-q__note">
            This changes how hard the situations are, never which ones exist.
          </p>
        </fieldset>

        <fieldset className="studio-q">
          <legend>Is someone watching while it works?</legend>
          {(Object.keys(ATTENDANCE_LABEL) as Attendance[]).map((value) => (
            <button
              key={value}
              type="button"
              className="studio-radio"
              aria-pressed={answers.attendance === value}
              onClick={() =>
                setAnswers((current) => ({ ...current, attendance: value }))
              }
            >
              {ATTENDANCE_LABEL[value]}
              <i>{ATTENDANCE_HINT[value]}</i>
            </button>
          ))}
        </fieldset>

        <fieldset className="studio-q">
          <legend>Can it do things you cannot take back?</legend>
          {(Object.keys(IRREVERSIBILITY_LABEL) as Irreversibility[]).map(
            (value) => (
              <button
                key={value}
                type="button"
                className="studio-radio"
                aria-pressed={answers.irreversibility === value}
                onClick={() =>
                  setAnswers((current) => ({
                    ...current,
                    irreversibility: value,
                  }))
                }
              >
                {IRREVERSIBILITY_LABEL[value]}
              </button>
            ),
          )}
          <p className="studio-q__note">
            These two decide which situations carry the most risk for you.
          </p>
        </fieldset>

        <div className="studio-setup__go">
          <button
            type="button"
            className="osh-cta-solid"
            disabled={!ready || submitting}
            onClick={() => void submit()}
          >
            {submitting ? "Working…" : "Show me what will happen"}
          </button>
          {ready ? null : (
            <span className="studio-muted">Answer all three to continue.</span>
          )}
        </div>

        {sampleScenario ? (
          <p className="studio-setup__sample">
            Or open{" "}
            <Link href={`/studio/${sampleScenario.id}`}>
              {sampleScenario.name}
            </Link>
            , the seeded read-only example.
          </p>
        ) : null}
      </div>
    </div>
  );
}
