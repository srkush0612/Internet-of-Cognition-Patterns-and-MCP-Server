"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ATTENDANCE_LABEL,
  IRREVERSIBILITY_LABEL,
  TOPOLOGY_LABEL,
  type Attendance,
  type Irreversibility,
  type Scenario,
  type Topology,
} from "@/lib/studio/types";
import "./studio.css";

const TOPOLOGIES = Object.keys(TOPOLOGY_LABEL) as Topology[];
const ATTENDANCES = Object.keys(ATTENDANCE_LABEL) as Attendance[];
const IRREVERSIBILITIES = Object.keys(IRREVERSIBILITY_LABEL) as Irreversibility[];

type Props = {
  sampleScenarioId: string | null;
};

export function StudioHome({ sampleScenarioId }: Props) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [topology, setTopology] = useState<Topology | null>(null);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [irreversibility, setIrreversibility] = useState<Irreversibility | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/studio/scenarios")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) {
          setScenarios((data.scenarios as Scenario[]).filter((s) => !s.isSample));
        }
      })
      .catch(() => {
        if (!cancelled) setScenarios([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const returning = (scenarios?.length ?? 0) > 0;
  const ready = topology !== null && attendance !== null && irreversibility !== null;

  async function handleSubmit() {
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: description.trim() || "Untitled scenario",
          description,
          topology,
          attendance,
          irreversibility,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Could not create the scenario.");
        return;
      }
      router.push(`/studio/${data.scenario.id}`);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`studio-home${returning ? " studio-home--with-scenarios" : ""}`}>
      <div className="studio-home__main">
        <h1 className="studio-home__title">Design for an agent scenario</h1>
        <p className="studio-home__subtitle">
          {returning
            ? "Describe what your agent does. Studio works out the encounters it will have with people, then puts the right pattern in front of you for each one."
            : "Describe the work you are handing to agents — one agent or a dozen. Studio maps every encounter that work creates, between the people and the agents, then hands you the patterns that answer each one."}
        </p>

        <div className="studio-card">
          <label className="studio-field-label" htmlFor="studio-description">
            {returning ? "What does your agent do?" : "What is the system doing?"}
          </label>
          <textarea
            id="studio-description"
            className="studio-textarea"
            rows={3}
            placeholder="One line is enough. The library derives the rest."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <div className="studio-question">
            <span className="studio-field-label">
              How many agents, and do they work together?
              <span className="studio-hint-tag">changes how hard each encounter is</span>
            </span>
            <div className="studio-pill-row studio-pill-row--cards">
              {TOPOLOGIES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`studio-pill-card${topology === t ? " studio-pill-card--active" : ""}`}
                  onClick={() => setTopology(t)}
                >
                  {TOPOLOGY_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="studio-question-row">
            <div className="studio-question">
              <span className="studio-field-label">Is someone watching while it works?</span>
              <div className="studio-pill-row">
                {ATTENDANCES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`studio-pill${attendance === a ? " studio-pill--active" : ""}`}
                    onClick={() => setAttendance(a)}
                  >
                    {ATTENDANCE_LABEL[a]}
                  </button>
                ))}
              </div>
            </div>
            <div className="studio-question">
              <span className="studio-field-label">Can it do things you cannot take back?</span>
              <div className="studio-pill-row">
                {IRREVERSIBILITIES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`studio-pill${irreversibility === r ? " studio-pill--active" : ""}`}
                    onClick={() => setIrreversibility(r)}
                  >
                    {IRREVERSIBILITY_LABEL[r]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="studio-home__risk-note">
            These two decide which encounters carry the most risk, and nobody watching plus
            nothing reversible is the hardest combination.
          </p>

          <div className="studio-home__cta-row">
            <button
              type="button"
              className="studio-button studio-button--primary"
              disabled={!ready || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Mapping…" : "Map the encounters"}
            </button>
            <span className="studio-home__cta-hint">
              {ready ? " " : "Answer all three and Studio can map the system."}
            </span>
          </div>
          {error && <p className="studio-home__error">{error}</p>}
        </div>

        <p className="studio-home__sample">
          Rather not describe yours yet?{" "}
          {sampleScenarioId ? (
            <a href={`/studio/${sampleScenarioId}`}>Walk through the sample example</a>
          ) : (
            <span className="studio-home__sample--disabled" title="Not yet in the library">
              Walk through the sample example — not yet in the library
            </span>
          )}
        </p>
      </div>

      {returning && (
        <aside className="studio-home__scenarios">
          <h2 className="studio-home__scenarios-title">Your scenarios</h2>
          <ul className="studio-scenario-list">
            {(scenarios ?? []).map((s) => (
              <li key={s.id}>
                <a href={`/studio/${s.id}`} className="studio-scenario-card">
                  <span className="studio-scenario-card__name">{s.name}</span>
                  <span className="studio-scenario-card__meta">
                    {s.decisions.length} decision{s.decisions.length === 1 ? "" : "s"}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
