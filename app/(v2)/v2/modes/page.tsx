import Link from "next/link";
import {
  FamilyTag,
  GapCard,
  LevelTag,
} from "@/components/v2/primitives";
import { patternsInMode, patternsSecondaryTo } from "@/lib/v2/catalog";
import { MISSING_PATTERNS } from "@/lib/v2/gaps";
import {
  MODE_FAMILY_DEFINITION,
  MODE_FAMILY_ORDER,
  MODE_FAMILY_LABEL,
  MODE_LABEL,
  REJECTED_CANDIDATES,
  modesInFamily,
} from "@/lib/v2/modes";
import { SPEC_SLOT_VAR } from "@/lib/v2/spec";
import type { ModeDef } from "@/lib/v2/types";

export const metadata = {
  title: "Modes, HAX 2.0 v2",
  description:
    "The nine kinds of opening an agent can make, split into presenting and engaging.",
};

function ModeCard({ mode }: { mode: ModeDef }) {
  const native = patternsInMode(mode.id);
  const secondary = patternsSecondaryTo(mode.id);
  const missing = MISSING_PATTERNS.filter((m) => m.mode === mode.id);

  return (
    <section id={mode.id} className="osh-card scroll-mt-24 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-ink">
          {MODE_LABEL[mode.id]}
        </h3>
        <FamilyTag family={mode.family} />
      </div>

      <p className="mt-2 text-sm leading-relaxed text-subtle">
        {mode.definition}
      </p>

      <p className="mt-4 text-sm italic text-muted">
        Opens with: &ldquo;{mode.opens_with}&rdquo;
      </p>

      <div className="mt-4">
        <p className="v2-eyebrow">Responses</p>
        <div className="v2-responses mt-2">
          {mode.responses.map((response) => (
            <span
              key={response}
              className="v2-slot"
              style={{
                ["--slot" as string]: `var(${SPEC_SLOT_VAR.responses})`,
                fontSize: "0.82rem",
              }}
            >
              {response}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-muted">
        <span className="font-semibold text-subtle">
          Not {MODE_LABEL[mode.not_to_confuse_with.mode]}:
        </span>{" "}
        {mode.not_to_confuse_with.distinction}
      </p>

      <div className="mt-4 border-t border-line pt-4">
        {native.length > 0 ? (
          <>
            <p className="v2-eyebrow">
              {native.length} pattern{native.length === 1 ? "" : "s"}
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {native.map((pattern) => (
                <li
                  key={pattern.id}
                  className="flex flex-wrap items-center gap-2"
                >
                  <Link
                    href={`/v2/patterns/${pattern.id}`}
                    className="text-sm font-medium text-ink underline-offset-2 hover:underline"
                  >
                    {pattern.name}
                  </Link>
                  <LevelTag level={pattern.level.primary} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <GapCard title={`No ${MODE_LABEL[mode.id]} pattern yet`}>
            <p className="text-sm leading-relaxed">
              This mode is defined and has valid responses, and nothing in the
              catalog uses it. That absence is the finding.
            </p>
          </GapCard>
        )}

        {missing.length > 0 ? (
          <div className="mt-3">
            {missing.map((entry) => (
              <GapCard key={entry.name} title={`Missing: ${entry.name}`}>
                <p className="text-sm leading-relaxed">{entry.description}</p>
              </GapCard>
            ))}
          </div>
        ) : null}

        {secondary.length > 0 ? (
          <p className="mt-3 text-xs leading-relaxed text-faint">
            Also reached as a secondary mode by{" "}
            {secondary.map((pattern, index) => (
              <span key={pattern.id}>
                {index > 0 ? ", " : ""}
                <Link
                  href={`/v2/patterns/${pattern.id}`}
                  className="underline-offset-2 hover:underline"
                >
                  {pattern.name}
                </Link>
              </span>
            ))}
            .
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default function ModesPage() {
  return (
    <main className="osh-container py-12 sm:py-16">
      {/* Modes are not a tab, so this page says where it hangs from. */}
      <nav className="mb-5 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/v2" className="underline-offset-2 hover:underline">
          Home
        </Link>
        <span className="px-2 text-faint">/</span>
        <span className="text-subtle">Modes</span>
      </nav>

      <p className="v2-eyebrow">Modes</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
        Nine kinds of opening
      </h1>
      <p className="v2-lede mt-4">
        A mode is the kind of opening an agent, or a person, makes in an
        exchange, defined by what it asks of the receiver. Presenting modes show
        something. Engaging modes ask for something back.
      </p>

      {MODE_FAMILY_ORDER.map((family) => (
        <section key={family} className="v2-section">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-[1.75rem] font-extralight text-ink">
              {MODE_FAMILY_LABEL[family]}
            </h2>
            <p className="text-sm text-muted">
              {MODE_FAMILY_DEFINITION[family]}
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {modesInFamily(family).map((mode) => (
              <ModeCard key={mode.id} mode={mode} />
            ))}
          </div>
        </section>
      ))}

      <section className="v2-section">
        <p className="text-sm leading-relaxed text-muted">
          Why the list stops at nine, and where Correct, Refuse, Escalate and
          Negotiate ended up instead, is on{" "}
          <Link
            href="/v2/methodology"
            className="text-ink underline underline-offset-2"
          >
            how we built this
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
