"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PatternPager } from "@/components/PatternPager";
import { SiteNav } from "@/components/SiteNav";
import { StatusBadge } from "@/components/StatusBadge";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  getPattern,
  isEvidencePending,
  type Pattern,
} from "@/lib/patterns";
import {
  PATTERN_SECTIONS,
  type PatternSectionId,
} from "@/lib/pattern-sections";
import {
  PATTERN_INBOX,
  PATTERN_STANDALONE,
} from "@/components/patterns/pattern-registry";
import { PresenceAboutStates } from "@/components/patterns/PresenceAboutStates";

const FACT_CHIPS: Record<string, string[]> = {
  "presence-boundary": [
    "States: idle · observing · working · waiting · acting",
    "Scope: watching vs can-act-on",
    "Controls: pause · narrow · widen",
  ],
  "credential-boundary": [
    "Federated access",
    "Parallel reasoning",
    "Converged outcome",
  ],
  "memory-commitment-review": ["Observed", "Commit", "Discard"],
  "shared-cognitive-state": ["Goals", "Assumptions", "Conflicts"],
};

const DEFAULT_FACT_CHIPS = [
  "Operator-facing",
  "Human-in-the-loop",
  "Inspectable",
];

function getFactChips(pattern: Pattern): string[] {
  return FACT_CHIPS[pattern.slug] ?? DEFAULT_FACT_CHIPS;
}

function ComponentPreview({
  pattern,
  compact = false,
}: {
  pattern: Pattern;
  compact?: boolean;
}) {
  const Standalone = PATTERN_STANDALONE[pattern.slug];
  if (Standalone) {
    return <Standalone compact={compact} />;
  }

  return (
    <div
      className={
        compact
          ? "component-preview-card component-preview-card--compact"
          : "component-preview-card"
      }
    >
      <p className="component-preview-card__title">{pattern.title}</p>
      <p className="component-preview-card__body">{pattern.example}</p>
    </div>
  );
}

function InboxDemo({ pattern }: { pattern: Pattern }) {
  const Inbox = PATTERN_INBOX[pattern.slug];
  if (Inbox) {
    return <Inbox />;
  }

  const inboxMessage = `I'm surfacing this because ${pattern.oneliner.charAt(0).toLowerCase()}${pattern.oneliner.slice(1)}`;

  return (
    <div className="inbox-demo">
      <aside className="inbox-demo__sidebar" aria-label="Agents">
        {["Orchestrator", "Specialist", "Reviewer"].map((agent) => (
          <div
            key={agent}
            className={`inbox-demo__agent ${
              agent === "Specialist" ? "inbox-demo__agent--active" : ""
            }`}
          >
            {agent}
          </div>
        ))}
      </aside>
      <div className="inbox-demo__main">
        <div className="inbox-demo__bubble">
          <span className="inbox-demo__bubble-label">Specialist</span>
          <p className="inbox-demo__bubble-text">{inboxMessage}</p>
        </div>
        <div className="inbox-demo__embedded">
          <span className="inbox-demo__tag">Specialist · live component</span>
          <ComponentPreview pattern={pattern} compact />
        </div>
      </div>
    </div>
  );
}

function BackingSummary({ pattern }: { pattern: Pattern }) {
  if (!pattern.backingStrength) return null;

  return (
    <div
      className={`backing-summary backing-summary--${pattern.backingStrength.toLowerCase()}`}
    >
      <div className="backing-summary__row">
        <span className="backing-summary__label">Research backing</span>
        <span className="backing-summary__strength">
          {pattern.backingStrength}
        </span>
        {pattern.participants ? (
          <span className="backing-summary__participants">
            {pattern.participants}
          </span>
        ) : null}
      </div>
      {pattern.researchNote ? (
        <p className="backing-summary__note">{pattern.researchNote}</p>
      ) : null}
    </div>
  );
}

function EvidenceSection({ pattern }: { pattern: Pattern }) {
  const pending = isEvidencePending(pattern);
  const hasEvidence = Boolean(pattern.evidence && pattern.evidence.length > 0);

  return (
    <>
      <BackingSummary pattern={pattern} />
      {pending || !hasEvidence ? (
        <p className="evidence-pending">
          Research validation pending: no verbatim quote confirmed yet.
        </p>
      ) : (
        <ul className="evidence-list">
          {pattern.evidence!.map((item, index) => (
            <li key={index}>
              <blockquote className="evidence-quote">
                <p className="evidence-quote__text">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <cite className="evidence-quote__cite">{item.attribution}</cite>
              </blockquote>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function PairsWithFooter({
  pattern,
  themed = false,
}: {
  pattern: Pattern;
  themed?: boolean;
}) {
  if (!pattern.pairsWith) return null;

  const paired = getPattern(pattern.pairsWith);
  if (!paired) return null;

  const patternBase = themed ? "/gallery/patterns" : "/patterns";

  return (
    <Link href={`${patternBase}/${paired.slug}`} className="pairs-card">
      <span className="pairs-card__label">Pairs with →</span>
      <span className="pairs-card__name">{paired.title}</span>
    </Link>
  );
}

export function PatternDetailShell({
  pattern,
  slug,
  themed = false,
}: {
  pattern: Pattern;
  slug: string;
  themed?: boolean;
}) {
  const [activeSection, setActiveSection] = useState<PatternSectionId>("about");
  const isScrollingRef = useRef(false);
  const sectionVisibilityRef = useRef<Map<string, IntersectionObserverEntry>>(
    new Map(),
  );

  const scrollToSection = useCallback((id: PatternSectionId) => {
    const el = document.getElementById(id);
    if (!el) return;

    isScrollingRef.current = true;
    setActiveSection(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      isScrollingRef.current = false;
    }, 700);
  }, []);

  useEffect(() => {
    const visibility = sectionVisibilityRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;

        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibility.set(entry.target.id, entry);
          } else {
            visibility.delete(entry.target.id);
          }
        }

        const visible = [...visibility.values()].sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        );

        if (visible[0]) {
          setActiveSection(visible[0].target.id as PatternSectionId);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );

    for (const section of PATTERN_SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => {
      observer.disconnect();
      visibility.clear();
    };
  }, []);

  const factChips = getFactChips(pattern);

  return (
    <div className="app-shell app-shell--detail">
      <header className="detail-page-header">
        <div className="detail-page-header__inner">
          <div className="detail-page-header__top">
            <Breadcrumb
              items={
                themed
                  ? [
                      { label: "Pattern Library", href: "/" },
                      { label: "Design system", href: "/gallery" },
                      { label: pattern.title },
                    ]
                  : [
                      { label: "Pattern Library", href: "/" },
                      { label: pattern.title },
                    ]
              }
            />
            <div className="detail-page-header__toolbar">
              {themed ? <ThemeSwitcher /> : null}
              <SiteNav />
            </div>
          </div>

          <div className="detail-page-header__badge">
            <StatusBadge pattern={pattern} />
          </div>

          <h1 className="detail-page-header__title">{pattern.title}</h1>
          <p className="detail-page-header__lead">{pattern.oneliner}</p>

          <nav className="detail-page-nav" aria-label="Section navigation">
            {PATTERN_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className="detail-page-nav__item"
                data-active={activeSection === section.id ? "true" : undefined}
                aria-current={activeSection === section.id ? "true" : undefined}
                onClick={() => scrollToSection(section.id)}
              >
                {section.label}
                <span className="detail-page-nav__underline" aria-hidden />
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main app-main--narrow detail-page-main">
        <div className="pattern-scroll">
          <aside className="pattern-scroll-rail" aria-label="Section shortcuts">
            {PATTERN_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className="pattern-scroll-rail__dot"
                data-active={activeSection === section.id ? "true" : undefined}
                aria-label={section.label}
                onClick={() => scrollToSection(section.id)}
              />
            ))}
          </aside>

          <section id="about" className="pattern-section">
            <h2 className="pattern-section__heading">About this component</h2>
            <p className="callout">{pattern.explanation}</p>
            {pattern.slug === "presence-boundary" ? (
              <>
                <h3 className="pattern-section__subheading">What it solves</h3>
                <p className="pattern-section__text">
                  A long-running agent is rarely just on or off. It may be quietly
                  observing, working in the background, waiting on you, or actively
                  changing something in the world. When that state is invisible,
                  people either over-trust an agent that has gone quiet or get
                  surprised when it acts. This component makes the agent&apos;s
                  current state and its scope continuously visible, and puts the
                  brakes right next to the signal.
                </p>
                <h3 className="pattern-section__subheading">Interaction model</h3>
                <p className="pattern-section__text">
                  One status orb shows the live state with a short activity line. A
                  five-step track places that state on the idle-to-acting spectrum.
                  A scope panel separates what the agent is <em>watching</em> from
                  what it can <em>act on</em>, with an access level. Two controls
                  steer it: Pause stops all activity, and Narrow shrinks the action
                  boundary one step at a time (down to read-only), with Widen to
                  reverse.
                </p>
                <div className="fact-chips">
                  {factChips.map((chip) => (
                    <span key={chip} className="fact-chip">
                      {chip}
                    </span>
                  ))}
                </div>
                <h3 className="pattern-section__subheading">States</h3>
                <PresenceAboutStates />
                <h3 className="pattern-section__subheading">Where it embeds</h3>
                <p className="pattern-section__text">
                  Agent inbox (shown), workflow builder, enterprise dashboard, or as
                  a persistent chrome element in any surface where an agent runs.
                  It is the entry point for the set: the{" "}
                  <strong>Authority Gradient</strong> defines how far Acting can
                  go, the <strong>Background Work Ledger</strong> records what
                  happened while it worked, and its state feeds the{" "}
                  <strong>Shared Cognitive State</strong> presence strip.
                </p>
              </>
            ) : pattern.slug === "credential-boundary" ? (
              <>
                <h3 className="pattern-section__subheading">What it solves</h3>
                <p className="pattern-section__text">
                  Multi-agent systems are often pitched as more capable than a
                  single agent, but that case is easy to argue against: why not
                  just build one really good agent? The honest answer is usually
                  you could — except in environments where access itself is
                  partitioned, legally, technically, or organizationally, and no
                  single agent, however capable, is permitted to hold both sides.
                  Credential Boundary makes that partition the reason multiple
                  agents exist, not an afterthought. Each agent&apos;s restricted
                  access is shown as a property of the system, not a limitation to
                  design around.
                </p>
                <h3 className="pattern-section__subheading">Interaction model</h3>
                <p className="pattern-section__text">
                  Two agents reason in parallel, each visibly scoped to only the
                  data they are authorized to see. A boundary marker sits between
                  them, persistent and not collapsible, so the restriction reads as
                  structural rather than incidental. Each agent&apos;s reasoning
                  steps build independently toward a partial conclusion, and an
                  explicit cannot-see line names what is withheld. The two trails
                  converge into a single outcome only when both have finished
                  reasoning. The outcome card states plainly that resolution
                  required both perspectives and that neither agent could have
                  reached it alone.
                </p>
                <div className="fact-chips">
                  {factChips.map((chip) => (
                    <span key={chip} className="fact-chip">
                      {chip}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3 className="pattern-section__subheading">Interaction model</h3>
                <p className="pattern-section__text">{pattern.example}</p>
                {pattern.note ? (
                  <p className="pattern-section__text pattern-section__text--note">
                    {pattern.note}
                  </p>
                ) : null}
                <div className="fact-chips">
                  {factChips.map((chip) => (
                    <span key={chip} className="fact-chip">
                      {chip}
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>

          <section id="standalone" className="pattern-section">
            <h2 className="pattern-section__heading">Standalone</h2>
            <div className="pattern-section__centered">
              <ComponentPreview pattern={pattern} />
            </div>
          </section>

          <section id="inbox" className="pattern-section">
            <h2 className="pattern-section__heading">In an agent inbox</h2>
            <InboxDemo pattern={pattern} />
          </section>

          <section id="evidence" className="pattern-section">
            <h2 className="pattern-section__heading">Evidence</h2>
            <EvidenceSection pattern={pattern} />
          </section>

          <PairsWithFooter pattern={pattern} themed={themed} />

          <div className="detail-page-footer">
            <PatternPager slug={slug} themed={themed} />
          </div>
        </div>
      </main>
    </div>
  );
}
