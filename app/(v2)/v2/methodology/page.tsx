import Link from "next/link";
import {
  GapCard,
  LevelDots,
  SlotKey,
} from "@/components/v2/primitives";
import { patterns } from "@/lib/v2/catalog";
import { JUDGMENT_CALLS } from "@/lib/v2/gaps";
import { LEVEL_LABEL, LEVEL_NEW, LEVEL_ORDER } from "@/lib/v2/levels";
import { MODE_LABEL, REJECTED_CANDIDATES } from "@/lib/v2/modes";
import { SPEC_SLOT_ORDER, SPEC_SLOT_VAR } from "@/lib/v2/spec";
import type { SpecSlot } from "@/lib/v2/types";

/** The spec template from section 5, with each slot wearing its own accent. */
function Template() {
  const piece = (slot: SpecSlot, text: string = slot) => (
    <span
      key={slot}
      className="v2-slot"
      style={{ ["--slot" as string]: `var(${SPEC_SLOT_VAR[slot]})` }}
    >
      {text}
    </span>
  );

  return (
    <p className="v2-spec v2-spec--sm">
      When {piece("trigger")}, the agent {piece("mode", "modes")} to{" "}
      {piece("audience")} in {piece("level")}, through {piece("channel")}, and
      expects {piece("responses")}.
    </p>
  );
}

export const metadata = {
  title: "How we built this, HAX 2.0",
  description:
    "Where the catalog came from, what counts as a mode, and which calls were made by synthesis rather than research.",
};

const STEPS = [
  {
    step: "Observe",
    body: "How agents actually communicate: in practitioner research, in live systems, in the protocols between them.",
  },
  {
    step: "Name",
    body: "The recurring shapes, written down as interaction patterns.",
  },
  {
    step: "Specify",
    body: "How an agent should behave in each one, as a behavior spec a team can build against.",
  },
];

const MODE_TESTS = [
  {
    test: "It is an opening, not a reply.",
    body: "Correct, Refuse and Escalate all fail here. Each one only ever answers something else, so each lives inside the mode it answers.",
  },
  {
    test: "It changes what the receiver is expected to do.",
    body: "Report fails here. A report asks exactly what a Signal or an Explain asks, so it is one of those two and not a mode of its own.",
  },
  {
    test: "It holds regardless of who is talking.",
    body: "Agent to person, person to agent, agent to agent, at any level. A mode that only works in one direction is a surface, not a mode.",
  },
];



export default function MethodologyPage() {
  const merged = patterns.filter(
    (pattern) =>
      pattern.merged_from.length > 1 ||
      pattern.merged_from.some((entry) => entry.includes("renamed")),
  );
  const originals = patterns.reduce(
    (total, pattern) => total + pattern.merged_from.length,
    0,
  );

  return (
    <main className="osh-container max-w-4xl py-12 sm:py-16">
      <nav className="mb-5 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/v2" className="underline-offset-2 hover:underline">
          Home
        </Link>
        <span className="px-2 text-faint">/</span>
        <span className="text-subtle">How we built this</span>
      </nav>

      <h1 className="text-3xl font-semibold text-ink sm:text-4xl">
        How we built this
      </h1>
      <p className="v2-lede mt-4">
        What the catalog is made of, what counts as a mode, and which calls were made by reading rather than by
        research. None of this is needed to use a pattern; all of it is needed
        to argue with one.
      </p>

      {/* ----------------------------------------------------- the approach */}
      <section className="v2-section">
        <h2 className="text-[1.75rem] font-extralight text-ink">
          Observe, name, specify
        </h2>
        <p className="v2-lede mt-3">
          Research gives the patterns credibility. The behavior spec makes them
          usable. Studio is where the spec gets written and tried.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ step, body }, index) => (
            <div key={step} className="osh-card p-5">
              <p className="v2-eyebrow">{String(index + 1).padStart(2, "0")}</p>
              <p className="mt-2 text-base font-semibold text-ink">{step}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------- the vocabulary */}
      <section className="v2-section">
        <h2 className="text-[1.75rem] font-extralight text-ink">
          The vocabulary
        </h2>
        <p className="v2-lede mt-3">
          The rest of the site says &ldquo;what the agent needs to do&rdquo;
          and &ldquo;who is involved&rdquo;. Underneath, those are two closed
          lists, and every pattern is one sentence built from them.
        </p>

        <h3 className="mt-7 text-base font-semibold text-ink">
          The behavior spec
        </h3>
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted">
          Six slots. Filled in, they specify how the agent behaves, not how the
          component looks. Studio is where one gets written; every pattern page
          leads with its own.
        </p>
        <div className="osh-card mt-4 p-6">
          <Template />
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4">
            {SPEC_SLOT_ORDER.map((slot) => (
              <SlotKey key={slot} slot={slot} />
            ))}
          </div>
        </div>

        <h3 className="mt-8 text-base font-semibold text-ink">
          Modes: what kind of opening it is
        </h3>
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted">
          A mode is defined by what it asks of the receiver. Presenting modes
          show something and the receiver can take it in without replying;
          engaging modes ask for something back. The responses a pattern offers
          come from its mode, which is why they are the same labels in the same
          order everywhere.
        </p>

        <h3 className="mt-8 text-base font-semibold text-ink">
          Levels: who is in the exchange
        </h3>
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted">
          Participant structure, not seniority. Each level inherits the
          problems of the ones below it, so a pattern native to one may reach
          others, and its behavior shifts when it does.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LEVEL_ORDER.map((level) => (
            <div key={level} className="rounded-[14px] border border-line p-4">
              <LevelDots level={level} />
              <p className="mt-2 text-sm font-semibold text-ink">
                {LEVEL_LABEL[level]}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {LEVEL_NEW[level]}
              </p>
            </div>
          ))}
        </div>

        <h3 className="mt-8 text-base font-semibold text-ink">
          Interactions: one live occurrence
        </h3>
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted">
          A pattern is a design. An interaction is one instance of it, carrying
          the level, channel and audience from the spec plus a slot for the
          reply that came back.
        </p>
      </section>

      {/* ------------------------------------------------- what counts as a mode */}
      <section className="v2-section">
        <h2 className="text-[1.75rem] font-extralight text-ink">
          What counts as a mode
        </h2>
        <p className="v2-lede mt-3">
          A candidate has to pass all three tests. Responses live inside the
          mode, which is what keeps the list at nine instead of growing one
          entry per thing a receiver can say.
        </p>

        <ol className="mt-6 flex flex-col gap-4">
          {MODE_TESTS.map((entry, index) => (
            <li key={entry.test} className="osh-card p-5">
              <p className="v2-eyebrow">Test {index + 1}</p>
              <p className="mt-2 text-base font-semibold text-ink">
                {entry.test}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {entry.body}
              </p>
            </li>
          ))}
        </ol>

        <h3 className="mt-8 text-base font-semibold text-ink">
          Where the rejected candidates went
        </h3>
        <ul className="mt-3 flex flex-col gap-2">
          {REJECTED_CANDIDATES.map((candidate) => (
            <li key={candidate.name} className="text-sm text-subtle">
              <b className="text-ink">{candidate.name}</b> → {candidate.lands}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Reporting is not a mode either. A report is a Signal, an Explain, or
          the report-back response inside Delegate.
        </p>
        <Link href="/v2/modes" className="v2-btn v2-btn--secondary mt-6">
          All nine modes
        </Link>
      </section>

      {/* ------------------------------------------------------- the merge */}
      <section className="v2-section">
        <h2 className="text-[1.75rem] font-extralight text-ink">
          Where the catalog came from
        </h2>
        <p className="v2-lede mt-3">
          {originals} original entries, {patterns.filter((p) => p.source !== "sdk").length}{" "}
          from the interview research and {patterns.filter((p) => p.source !== "ioc").length}{" "}
          from the component library, became {patterns.length} patterns. A
          component is the implementation of a pattern, not a separate thing, so
          the two lists are one list.
        </p>

        <h3 className="mt-7 text-base font-semibold text-ink">
          What was merged or renamed
        </h3>
        <div className="mt-3 flex flex-col gap-2.5">
          {merged.map((pattern) => (
            <div
              key={pattern.id}
              className="rounded-[14px] border border-line p-4"
            >
              <Link
                href={`/v2/patterns/${pattern.id}`}
                className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
              >
                {pattern.name}
              </Link>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {pattern.merged_from.join(" · ")}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Everything else maps one to one. Co-Editing Surface is one pattern
          with content-type variants, each pointing at its own component, rather
          than six peers.
        </p>
      </section>

      {/* ------------------------------------------------- judgment calls */}
      <section className="v2-section">
        <h2 className="text-[1.75rem] font-extralight text-ink">
          Decided by synthesis, not research
        </h2>
        <p className="v2-lede mt-3">
          Each of these was settled by reading the pattern descriptions rather
          than by observing anything. They are the first things to check against
          a real system. Each one also appears on the pattern pages it touches.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {JUDGMENT_CALLS.map((call) => (
            <GapCard key={call.id} title="Open question">
              <p className="text-sm leading-relaxed">{call.question}</p>
              {call.patterns.length > 0 ? (
                <p className="mt-2 text-xs text-faint">
                  {call.patterns
                    .map((id) => patterns.find((p) => p.id === id)?.name)
                    .filter(Boolean)
                    .join(", ")}
                </p>
              ) : null}
            </GapCard>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- the gaps */}
      <section className="v2-section">
        <h2 className="text-[1.75rem] font-extralight text-ink">
          Where the gaps cluster
        </h2>
        <p className="v2-lede mt-3">
          Most of what is missing sits on the engaging side of the mode list, {" "}
          {MODE_LABEL.request} and {MODE_LABEL.delegate} have no pattern at all
, and at the agents-only level, where only Source Attribution does any
          work, and only as provenance. That is the part of the thesis with the
          least behind it, which makes it the part worth building next.
        </p>
      </section>
    </main>
  );
}
