import Link from "next/link";
import type { CSSProperties } from "react";
import {
  AUDIENCE_LABEL,
  CHANNEL_FACING,
  CHANNEL_LABEL,
  LEVEL_LABEL,
  LEVEL_SHAPE,
} from "@/lib/v2/levels";
import { MODE_FAMILY_LABEL, MODE_LABEL, getMode } from "@/lib/v2/modes";
import { SPEC_SLOT_LABEL, SPEC_SLOT_VAR, type SpecDraft, composeSpec } from "@/lib/v2/spec";
import type {
  Audience,
  Channel,
  Evidence,
  Level,
  Mode,
  ModeFamily,
  Pattern,
  SpecSlot,
} from "@/lib/v2/types";

/** Slot colour, applied as a local custom property the CSS reads. */
function slotStyle(slot: SpecSlot): CSSProperties {
  return { ["--slot" as string]: `var(${SPEC_SLOT_VAR[slot]})` };
}

export function SlotKey({ slot }: { slot: SpecSlot }) {
  return (
    <span className="v2-slot-key" style={slotStyle(slot)}>
      {SPEC_SLOT_LABEL[slot]}
    </span>
  );
}

export function ModeTag({ mode }: { mode: Mode }) {
  return <span className="v2-tag v2-tag--mode">{MODE_LABEL[mode]}</span>;
}

export function FamilyTag({ family }: { family: ModeFamily }) {
  return (
    <span className={`v2-tag v2-tag--family v2-tag--${family}`}>
      {MODE_FAMILY_LABEL[family]}
    </span>
  );
}

export function LevelTag({ level }: { level: Level }) {
  return (
    <span className="v2-tag v2-tag--level">
      <LevelDots level={level} />
      {LEVEL_LABEL[level]}
    </span>
  );
}

/**
 * Who is in the exchange, drawn rather than coded. Circles are agents, squares
 * are people. The document asks for participants, never "L1-L4".
 */
export function LevelDots({ level }: { level: Level }) {
  const { agents, people } = LEVEL_SHAPE[level];
  return (
    <span className="v2-level-dots" aria-hidden="true">
      {Array.from({ length: agents }, (_, i) => (
        <i key={`a${i}`} />
      ))}
      {Array.from({ length: people }, (_, i) => (
        <i key={`p${i}`} data-person="true" />
      ))}
    </span>
  );
}

export function ChannelTag({ channel }: { channel: Channel }) {
  return (
    <span className="v2-tag v2-tag--channel">
      {CHANNEL_LABEL[channel]}
      {CHANNEL_FACING[channel] === "agent" ? (
        <span className="text-[0.62rem] uppercase tracking-wide opacity-70">
          headless
        </span>
      ) : null}
    </span>
  );
}

export function AudienceTag({ audience }: { audience: Audience }) {
  return <span className="v2-tag">{AUDIENCE_LABEL[audience]}</span>;
}

const EVIDENCE_LABEL: Record<Evidence, string> = {
  strong: "Strong evidence",
  moderate: "Moderate evidence",
  thin: "Thin evidence",
  none: "No evidence yet",
  not_rated: "Not rated",
};

export function EvidenceBadge({
  evidence,
  short = false,
}: {
  evidence: Evidence;
  short?: boolean;
}) {
  return (
    <span className="v2-ev" data-ev={evidence} title={EVIDENCE_LABEL[evidence]}>
      <span className="v2-ev__dot" />
      {short ? evidence.replace("_", " ") : EVIDENCE_LABEL[evidence]}
    </span>
  );
}

/**
 * The behavior-spec sentence with each slot coloured.
 *
 * A pattern passes its authored `spec` string, which reads better than
 * anything assembled from parts; Studio passes a draft, where the slots are
 * live and the unfilled ones have to show as blanks.
 */
export function SpecSentence({
  draft,
  small = false,
}: {
  draft: SpecDraft;
  small?: boolean;
}) {
  const { parts } = composeSpec(draft);

  // A part that opens with punctuation closes the one before it, so no space
  // goes in front of it. Without this the sentence reads "chat , and expects".
  const spaceAfter = (index: number) =>
    index < parts.length - 1 && !/^[,.]/.test(parts[index + 1].text);

  return (
    <p className={`v2-spec${small ? " v2-spec--sm" : ""}`}>
      {parts.map((part, index) => (
        <span key={index}>
          {part.slot ? (
            <span
              className={`v2-slot${part.filled ? "" : " v2-slot--empty"}`}
              style={slotStyle(part.slot)}
            >
              {part.text}
            </span>
          ) : (
            part.text
          )}
          {spaceAfter(index) ? " " : null}
        </span>
      ))}
    </p>
  );
}

/** The exact authored sentence, with its six behavior slots picked out. */
export function AuthoredSpec({ pattern }: { pattern: Pattern }) {
  const parts = pattern.spec.match(
    /^When (.*?), the agent (\w+) (to|with) (.*?) in (.*?), through (.*?), and expects (.*)\.$/,
  );
  if (!parts) return <p className="v2-spec">{pattern.spec}</p>;

  const [, trigger, verb, connector, audience, level, channel, responses] = parts;
  return (
    <p className="v2-spec">
      When <span className="v2-slot" style={slotStyle("trigger")}>{trigger}</span>, the agent{" "}
      <span className="v2-slot" style={slotStyle("mode")}>{verb}</span>{" "}
      {connector} <span className="v2-slot" style={slotStyle("audience")}>{audience}</span> in{" "}
      <span className="v2-slot" style={slotStyle("level")}>{level}</span>, through{" "}
      <span className="v2-slot" style={slotStyle("channel")}>{channel}</span>, and expects{" "}
      <span className="v2-slot" style={slotStyle("responses")}>{responses}</span>.
    </p>
  );
}

export function ResponseChips({ pattern }: { pattern: Pattern }) {
  const responses = pattern.responses ?? getMode(pattern.mode.primary).responses;
  return (
    <div className="v2-responses">
      {responses.map((response) => (
        <span
          key={response}
          className="v2-slot"
          style={{ ...slotStyle("responses"), fontSize: "0.82rem" }}
        >
          {response}
        </span>
      ))}
    </div>
  );
}

export function PatternCard({ pattern }: { pattern: Pattern }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="v2-pcard__name">{pattern.name}</p>
        {pattern.contentReady ? (
          <span className="v2-tag v2-tag--ready">Ready</span>
        ) : (
          <span className="v2-tag v2-tag--soon">Coming soon</span>
        )}
      </div>
      <p className="v2-pcard__summary">{pattern.summary}</p>
      <div className="v2-pcard__meta">
        <ModeTag mode={pattern.mode.primary} />
        <LevelTag level={pattern.level.primary} />
      </div>
    </>
  );

  // Not-ready patterns are shown but not openable, no link, no hover.
  if (!pattern.contentReady) {
    return (
      <div className="v2-pcard osh-card v2-pcard--soon" aria-disabled="true">
        {body}
      </div>
    );
  }

  return (
    <Link href={`/v2/patterns/${pattern.id}`} className="v2-pcard osh-card">
      {body}
    </Link>
  );
}

/** A gap renders as a card, never as a blank space. */
export function GapCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="v2-gap">
      <p className="v2-gap__head">{title}</p>
      {children}
    </div>
  );
}
