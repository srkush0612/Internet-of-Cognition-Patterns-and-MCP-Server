import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { ChannelPreview } from "@/components/v2/ChannelPreview";
import { PatternSectionNav } from "@/components/v2/PatternSectionNav";
import { AuthoredSpec } from "@/components/v2/primitives";
import { getV2Pattern, patterns } from "@/lib/v2/catalog";
import { LEVEL_LABEL, LEVEL_ORDER } from "@/lib/v2/levels";
import { MODE_LABEL, getMode } from "@/lib/v2/modes";
import { SPEC_SLOT_LABEL, SPEC_SLOT_MEANING, SPEC_SLOT_ORDER, SPEC_SLOT_VAR } from "@/lib/v2/spec";

export function generateStaticParams() {
  return patterns.map((pattern) => ({ id: pattern.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pattern = getV2Pattern(id);
  if (!pattern) return { title: "Not found, HAX 2.0 v2" };
  return {
    title: `${pattern.name}, HAX 2.0 v2`,
    description: pattern.summary,
  };
}

function FactRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="v2-pattern-fact">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export default async function V2PatternPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pattern = getV2Pattern(id);
  if (!pattern) notFound();

  // Not-ready patterns are listed but not yet openable. Reaching one by direct
  // URL shows a coming-soon state, not the half-finished full page.
  if (!pattern.contentReady) {
    return (
      <main>
        <header className="osh-hero">
          <div className="osh-container py-9 sm:py-11">
            <nav className="text-sm text-muted" aria-label="Breadcrumb">
              <Link
                href="/v2/patterns"
                className="underline-offset-2 hover:underline"
              >
                Catalog
              </Link>
              <span className="px-2 text-faint">/</span>
              <span className="text-subtle">{pattern.name}</span>
            </nav>

            <div className="mt-5">
              <span className="v2-tag v2-tag--soon">Coming soon</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">
              {pattern.name}
            </h1>
            <p className="v2-lede mt-3">{pattern.summary}</p>
          </div>
        </header>

        <div className="osh-container py-10 sm:py-12">
          <div className="osh-card p-6 sm:p-7">
            <h2 className="text-base font-semibold text-ink">
              This pattern is still being written
            </h2>
            <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-subtle">
              It is in the catalog, but its behaviour spec and design are not
              ready to show yet. Check back soon.
            </p>
            <Link
              href="/v2/patterns"
              className="v2-btn v2-btn--secondary mt-5"
            >
              Back to the catalog
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const mode = getMode(pattern.mode.primary);
  const responses = pattern.responses ?? mode.responses;
  const sectionNav = [
    ...(pattern.whatItSolves ? [{ id: "overview", label: "Overview" }] : []),
    ...(pattern.interactionModel || pattern.interactionSteps?.length ? [{ id: "interaction", label: "Interaction" }] : []),
    { id: "levels", label: "Who is involved" },
    { id: "behavior-spec", label: "Behavior spec" },
    { id: "preview", label: "How it looks" },
  ];

  return (
    <main>
      {/* Gradient hero band, the same surface v1's pattern pages use. */}
      <header className="osh-hero v2-pattern-hero">
        <div className="osh-container v2-pattern-hero__inner">
          <nav className="text-sm text-muted" aria-label="Breadcrumb">
            <Link
              href="/v2/patterns"
              className="underline-offset-2 hover:underline"
            >
              Catalog
            </Link>
            <span className="px-2 text-faint">/</span>
            <span className="text-subtle">{pattern.name}</span>
          </nav>

          <div className="v2-pattern-hero__grid">
            <div className="v2-pattern-hero__copy">
              <p className="v2-pattern-hero__eyebrow">Interaction pattern</p>
              <h1>{pattern.name}</h1>
              <p className="v2-pattern-hero__summary">{pattern.summary}</p>
            </div>
            <div className="v2-pattern-hero__art" aria-hidden="true">
              <span className="v2-pattern-hero__orb v2-pattern-hero__orb--one" />
              <span className="v2-pattern-hero__orb v2-pattern-hero__orb--two" />
              <span className="v2-pattern-hero__glass" />
              <span className="v2-pattern-hero__spark" />
            </div>
          </div>
        </div>
      </header>

      <PatternSectionNav items={sectionNav} />

      <div className="osh-container v2-pattern-page">
        {pattern.whatItSolves ? (
          <section
            id="overview"
            className="v2-pattern-prose v2-pattern-prose--outcome"
          >
            <h2>What it solves</h2>
            <p>{pattern.whatItSolves}</p>
          </section>
        ) : null}

        {pattern.interactionModel || pattern.interactionSteps?.length ? (
          <section
            id="interaction"
            className={pattern.interactionSteps?.length ? "v2-pattern-interaction" : "v2-pattern-prose"}
          >
            <h2>How the interaction works</h2>
            {pattern.interactionSteps?.length ? (
              <ol className="v2-pattern-interaction__steps">
                {pattern.interactionSteps.map((step, index) => (
                  <li key={step.title}>
                    <span className="v2-pattern-interaction__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p>{pattern.interactionModel}</p>
            )}
          </section>
        ) : null}

        <section id="levels" className="v2-pattern-levels">
          <div className="v2-pattern-section-head">
            <h2>Who is involved</h2>
            <p>Where the pattern applies as agents and people take part.</p>
          </div>
          <ul className="v2-pattern-levels__grid">
            {LEVEL_ORDER.map((level) => {
              const note = pattern.level.notes[level];
              const applies = note !== undefined;
              const isPrimary = level === pattern.level.primary;
              return (
                <li key={level} data-applies={applies}>
                  <span className="v2-pattern-levels__check" aria-hidden="true">
                    {applies ? <Check size={16} strokeWidth={2.5} /> : null}
                  </span>
                  <div>
                    <h3>
                      {LEVEL_LABEL[level]}
                      {isPrimary ? <span> · primary setting</span> : null}
                    </h3>
                    {applies ? <span className="sr-only">Applies. </span> : null}
                    <p>{applies ? note : pattern.id === "disclosure-gradient"
                      ? level === "L1"
                        ? "A lone agent has no agent coordination to hide, so there is no disclosure gradient to apply."
                        : "Agent-only exchanges need their operational details directly; an outcome-first view for a person does not apply."
                      : "Does not apply here."}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="behavior-spec" className="v2-pattern-spec">
          <h2>Behavior spec</h2>
          <AuthoredSpec pattern={pattern} />
          <details className="v2-pattern-spec__details">
            <summary>See triggers, actions, and spec parts</summary>
            <ul className="v2-pattern-slot-legend" aria-label="Behavior spec parts">
              {SPEC_SLOT_ORDER.map((slot) => (
                <li key={slot} style={{ borderColor: `var(${SPEC_SLOT_VAR[slot]})` }}>
                  <strong style={{ color: `var(${SPEC_SLOT_VAR[slot]})` }}>
                    {SPEC_SLOT_LABEL[slot]}
                  </strong>
                  <span>{SPEC_SLOT_MEANING[slot]}</span>
                </li>
              ))}
            </ul>
            <div className="v2-pattern-facts">
              <FactRow title="When it happens">
                <ul>
                  {pattern.triggers.map((trigger) => <li key={trigger}>{trigger}</li>)}
                </ul>
              </FactRow>
              <FactRow title="What the agent does">
                {pattern.id === "disclosure-gradient" ? (
                  <p><b>Signals</b> the outcome first, then <b>explains</b> the rationale, agent handoffs, and full event trace as the operator asks for more. If the result or status changes during the incident, the summary updates while the deeper layers remain available for review.</p>
                ) : pattern.id === "activity-record" ? (
                  <p>The agent signals observable progress by recording tool calls, assumptions, actions, results, and unresolved questions in time order. It explains shifts in its interpretation through the assumptions and outcomes it records; the live view stays brief while the completed record holds more detail.</p>
                ) : pattern.id === "presence-boundary" ? (
                  <p>The agent signals its current activity and declares what it may observe or change. It updates both when its state or access changes.</p>
                ) : pattern.id === "capability-manifest" ? (
                  <p>The agent declares its capabilities and limits, then signals changes to its connection or availability.</p>
                ) : pattern.id === "deferred-detail" ? (
                  <p>The agent signals what each phase can decide, what remains open and why, and which new evidence makes the next decision possible. It updates the gate and owner when responsibility moves to another phase.</p>
                ) : pattern.id === "lineage-view" ? (
                  <p>The agent explains how claims, artifacts, and decisions cite the upstream output, and updates the dependency view when that source is disputed or stale.</p>
                ) : (
                  <p><b>{MODE_LABEL[pattern.mode.primary]}</b>, {mode.definition}</p>
                )}
              </FactRow>
              <FactRow title={pattern.id === "capability-manifest" ? "What a person can do" : "What the receiver can do"}>
                {pattern.id === "disclosure-gradient" ? (
                  <p>Monitor the outcome, open the rationale, inspect which agents contributed and how they handed off work, or open the full trace during a postmortem.</p>
                ) : pattern.id === "activity-record" ? (
                  <p>Inspect an entry and its tool or artifact, correct a recorded assumption, or answer an open question. In a connected workflow, the record can also route a review or reversal action to the host system.</p>
                ) : pattern.id === "presence-boundary" ? (
                  <p>Check the agent&apos;s activity and scope, pause or resume it, narrow its reach, or explicitly widen it.</p>
                ) : pattern.id === "capability-manifest" ? (
                  <p>Check what is available, seek approval for a pending capability, or adjust the agent&apos;s access in settings.</p>
                ) : pattern.id === "deferred-detail" ? (
                  <p>See why a decision is still open, inspect the evidence that unlocks it, and decide whether the next phase can begin.</p>
                ) : pattern.id === "lineage-view" ? (
                  <p>Inspect dependent work, verify the questioned source, and reassess or hold decisions that rely on it with the teams involved.</p>
                ) : (
                  <div className="v2-responses">
                    {responses.map((response) => <span key={response} className="v2-tag">{response}</span>)}
                  </div>
                )}
              </FactRow>
            </div>
          </details>
        </section>

        <section id="preview" className="v2-pattern-preview">
          <h2>How it looks</h2>
          <p className="v2-pattern-preview__intro">
            {pattern.id === "activity-record"
              ? "Follow the same incident history in the agent conversation or the shared run view. The controls in this example expand entries and let you answer its open question."
              : pattern.id === "presence-boundary"
              ? "Explore the same boundary in a conversation, an operations workspace, and an agent-readable signal."
              : pattern.id === "capability-manifest"
              ? "Explore the manifest in setup, conversation, and an agent-readable signal."
              : pattern.id === "deferred-detail"
                ? "Follow one capacity decision through evaluation, pilot, and rollout. Select a phase to see what was known, what had to wait, and which evidence unlocked the next gate."
              : pattern.id === "authority-gradient"
                ? "Set autonomy by workflow in Settings, then see the operator decision when a boundary is reached in Chat."
                : pattern.id === "disclosure-gradient"
                  ? "Follow the same Payments API incident in the agent’s chat turn or its shared incident workspace. Open each layer to reveal more of the result’s rationale and history."
              : pattern.id === "lineage-view"
                ? "Trace the Triage agent’s disputed RCA through the Remediation agent’s plan to the Change agent’s ticket, alongside the Comms agent’s draft. Only the RCA is highlighted; the impact summary shows who needs to review their reliance."
              : "Explore the exchange in each place it can appear."}
          </p>
          <div className="v2-pattern-preview__body">
            <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
              <ChannelPreview pattern={pattern} />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
