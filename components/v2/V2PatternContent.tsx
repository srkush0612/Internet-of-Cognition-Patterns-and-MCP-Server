import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { ChannelPreview } from "@/components/v2/ChannelPreview";
import { PatternSectionNav } from "@/components/v2/PatternSectionNav";
import { AuthoredSpec } from "@/components/v2/primitives";
import { getV2Pattern } from "@/lib/v2/catalog";
import { LEVEL_LABEL, LEVEL_ORDER } from "@/lib/v2/levels";
import { MODE_LABEL, getMode } from "@/lib/v2/modes";
import { getHaxPrinciple, getPatternPrinciples } from "@/lib/v2/principles";
import { SPEC_SLOT_LABEL, SPEC_SLOT_MEANING, SPEC_SLOT_ORDER, SPEC_SLOT_VAR } from "@/lib/v2/spec";

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

function PrinciplesCallout({ patternId }: { patternId: string }) {
  const assignment = getPatternPrinciples(patternId);
  const connections = [assignment.primary, ...(assignment.secondary ? [assignment.secondary] : [])];

  return (
    <aside className="v2-pattern-principles" aria-label="Principles at work">
      <div className="v2-pattern-principles__heading">
        <span>Guiding principles</span>
        <h3>Principles at work</h3>
      </div>
      <div className="v2-pattern-principles__list">
        {connections.map(({ id, why }, index) => (
          <div className="v2-pattern-principles__row" key={id}>
            <span>{index === 0 ? "Primary" : "Also supports"}</span>
            <div>
              <Link href={`/v3/principles/${id}`}>{getHaxPrinciple(id).name} <span aria-hidden="true">↗</span></Link>
              <p>{why}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

/** Shared, verified pattern page content used by both the V2 and V3 routes. */
export function V2PatternContent({
  id,
  catalogHref = "/v2/patterns",
  preview,
}: {
  id: string;
  catalogHref?: string;
  preview?: React.ReactNode;
}) {
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
                href={catalogHref}
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
            <PrinciplesCallout patternId={pattern.id} />
            <Link
              href={catalogHref}
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
    { id: "dimensions", label: "Who is involved" },
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
              href={catalogHref}
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
            <PrinciplesCallout patternId={pattern.id} />
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

        <section id="dimensions" className="v2-pattern-levels">
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
                      : pattern.id === "co-editing-surface"
                        ? level === "L1"
                          ? "This exchange needs several agents contributing to the same document with a person."
                          : "The operator's edits and comments are part of the exchange, so a setting with many agents and no person does not apply."
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
                ) : pattern.id === "pre-action-handshake" ? (
                  <p><b>Proposes</b> the next consequential action and <b>explains</b> the observation and interpretation behind it. It holds the action until a response arrives; a correction or new evidence updates the handoff and requires a fresh decision.</p>
                ) : pattern.id === "deferred-detail" ? (
                  <p>The agent signals what each phase can decide, what remains open and why, and which new evidence makes the next decision possible. It updates the gate and owner when responsibility moves to another phase.</p>
                ) : pattern.id === "lineage-view" ? (
                  <p>The agent shows why a source is questioned, how decisions and artifacts depend on it, and updates the view when new evidence changes its status.</p>
                ) : pattern.id === "co-editing-surface" ? (
                  <p>One agent drafts the document. Another reads the operator&apos;s edits and comments, then adds to that same document while preserving those contributions. Each change remains attributed to its author.</p>
                ) : pattern.id === "certainty-boundary" ? (
                  <p>The agent declares how each workflow step runs: fixed, agent-selected, or generated. It signals when the path or review gate changes during a run.</p>
                ) : pattern.id === "review-as-dialogue" ? (
                  <p>The agent <b>proposes</b> a draft for review. It uses a decline reason to ask a focused question when needed, then returns a revision with changes marked. A revised version waits for a fresh decision.</p>
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
                ) : pattern.id === "pre-action-handshake" ? (
                  <p>Consent to the proposal, correct the agent&apos;s interpretation or plan, decline the action, or defer it while gathering more evidence.</p>
                ) : pattern.id === "deferred-detail" ? (
                  <p>See why a decision is still open, inspect the evidence that unlocks it, and decide whether the next phase can begin.</p>
                ) : pattern.id === "lineage-view" ? (
                  <p>Inspect dependent work, verify the questioned source, and reassess or hold decisions that rely on it with the teams involved.</p>
                ) : pattern.id === "co-editing-surface" ? (
                  <p>Edit the document, comment on a specific part, review the agent&apos;s next revision, and decide whether the shared draft is ready to use.</p>
                ) : pattern.id === "certainty-boundary" ? (
                  <p>Inspect a step&apos;s input, output, and method; check generated work at its review gate; or revise the workflow configuration. The preview illustrates these boundaries but does not run the workflow.</p>
                ) : pattern.id === "review-as-dialogue" ? (
                  <p>Accept the current draft, correct it, decline with a reason, or defer. Answer the agent&apos;s clarification when it asks; review each returned version before using it.</p>
                ) : (
                  <div className="v2-responses">
                    {responses.map((response) => <span key={response} className="v2-tag">{response}</span>)}
                  </div>
                )}
              </FactRow>
              {pattern.id === "review-as-dialogue" ? (
                <FactRow title="Adjacent patterns">
                  <ul>
                    <li><b>Co-editing Surface:</b> edits and comments live in the shared artifact; this pattern handles the review turn and resulting revision.</li>
                    <li><b>Pre-Action Handshake:</b> holds a consequential action until a decision; use it when a reviewed draft is about to trigger that action.</li>
                    <li><b>Decision Record:</b> preserves the rationale when an action is committed; it does not run the feedback loop.</li>
                  </ul>
                </FactRow>
              ) : null}
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
              : pattern.id === "pre-action-handshake"
                ? "Review the Reliability agent’s incident evidence and proposed rollback in its conversation. Try each response to see how the pending handoff changes."
              : pattern.id === "deferred-detail"
                ? "Follow one capacity decision through evaluation, pilot, and rollout. Select a phase to see what was known, what had to wait, and which evidence unlocked the next gate."
              : pattern.id === "authority-gradient"
                ? "Set autonomy by workflow in Settings, then see the operator decision when a boundary is reached in Chat."
                : pattern.id === "disclosure-gradient"
                  ? "Follow the same Payments API incident in the agent’s chat turn or its shared incident workspace. Open each layer to reveal more of the result’s rationale and history."
              : pattern.id === "lineage-view"
                ? "See why a warehouse recount challenges the Inventory agent’s stock count, then review the sale decisions and draft that rely on it. Select an item to trace its path."
              : pattern.id === "co-editing-surface"
                ? "Edit or comment on the Incident agent’s restart-plan document in the conversation or shared workspace. Then ask the Reliability agent to continue."
              : pattern.id === "certainty-boundary"
                ? "Inspect the same workflow as a settings map or structured state signal. Select a step to see how it runs and where review happens."
              : pattern.id === "review-as-dialogue"
                ? "Review the Marketing agent’s launch email. Decline with a reason, answer its clarification, and inspect the revised draft; the controls simulate this conversation locally."
              : "Explore the exchange in each place it can appear."}
          </p>
          <div className="v2-pattern-preview__body">
            <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
              {preview ?? <ChannelPreview pattern={pattern} />}
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
