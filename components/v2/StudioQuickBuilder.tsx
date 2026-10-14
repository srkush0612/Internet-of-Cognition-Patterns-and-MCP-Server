"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Bot, BrainCircuit, Check, Clock3, GitMerge,
  Hand, Layers3, Megaphone, MessageCircle, Pencil, ShieldAlert,
  SlidersHorizontal, Sparkles, UsersRound, X,
  type LucideIcon,
} from "lucide-react";
import { getV2Pattern } from "@/lib/v2/catalog";
import {
  AUDIENCE_FACING, AUDIENCE_LABEL, CHANNEL_FACING, CHANNEL_LABEL, LEVEL_LABEL, LEVEL_ORDER,
  audiencesForLevel, channelsForLevel,
} from "@/lib/v2/levels";
import { MODE_LABEL, MODE_PLAIN, getMode } from "@/lib/v2/modes";
import { reconcile, type SpecDraft } from "@/lib/v2/spec";
import { situationFor } from "@/lib/v2/situations";
import type { Audience, Channel, Mode } from "@/lib/v2/types";
import type { StudioMatch } from "@/lib/v2/studio-matching";

type Step = "situation" | "move" | "matches";
type Detail = "trigger" | "audience" | "level" | "channel" | "responses";
type Starter = { patternId: string; label: string; channel: Channel; description: string };

const SCENARIO_ICON: Record<string, LucideIcon> = {
  "pre-action-handshake": ShieldAlert,
  "convergence-point": GitMerge,
  "memory-commitment-review": BrainCircuit,
};

const MOVE_ICON: Record<Mode, LucideIcon> = {
  declare: Sparkles, signal: Megaphone, explain: MessageCircle,
  request: Hand, propose: Hand, delegate: ArrowRight,
  coordinate: UsersRound, resolve: GitMerge, commit: Check,
};

const RECOMMENDED_MOVES: Record<string, Mode[]> = {
  "pre-action-handshake": ["propose", "explain", "signal"],
  "convergence-point": ["resolve", "coordinate", "explain"],
  "memory-commitment-review": ["commit", "propose", "signal"],
};

const MOVE_SHORT: Record<Mode, string> = {
  declare: "Show scope", signal: "Signal state", explain: "Explain why",
  request: "Ask for help", propose: "Ask first", delegate: "Hand over",
  coordinate: "Work together", resolve: "Settle difference", commit: "Make binding",
};

const OPENING: Record<Mode, string> = {
  declare: "Here is what I can do, and where my limits are.",
  signal: "Here is what changed and what I am waiting on.",
  explain: "Here is why I reached this conclusion.",
  request: "I need help with this step.",
  propose: "I am ready to act. Review the plan before I proceed.",
  delegate: "I am handing over this task with its context.",
  coordinate: "Let us work on this together.",
  resolve: "We reached different conclusions. Let us settle them.",
  commit: "This is ready to become the current record.",
};

const DETAIL_LABEL: Record<Detail, string> = {
  trigger: "When", audience: "Receiver", level: "People",
  channel: "Surface", responses: "Actions",
};

export function StudioQuickBuilder({
  draft, matches, starters, scenarioId, onSelectSituation,
  onDraftChange, onApplyPattern,
}: {
  draft: SpecDraft;
  matches: { exact: StudioMatch[]; near: StudioMatch[] };
  starters: Starter[];
  scenarioId: string;
  onSelectSituation: (id: string) => void;
  onDraftChange: Dispatch<SetStateAction<SpecDraft>>;
  onApplyPattern: (id: string) => void;
}) {
  const [step, setStep] = useState<Step>("situation");
  const [activeDetail, setActiveDetail] = useState<Detail | null>(null);
  const [activePatternId, setActivePatternId] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [showAllMoves, setShowAllMoves] = useState(false);
  const exact = matches.exact;
  const shownMatches = exact.length ? exact : matches.near;
  const activeMatch = shownMatches.find((match) => match.pattern.id === activePatternId) ?? shownMatches[0];
  const activePattern = activeMatch?.pattern;
  const mode = draft.mode ?? "propose";
  const situation = situationFor(scenarioId);
  const scenarioPattern = getV2Pattern(scenarioId);
  const opening = situation && scenarioPattern?.mode.primary === mode && draft.trigger === situation.trigger && (step !== "matches" || activePattern?.id === scenarioId)
    ? situation.opening ?? situation.intro
    : OPENING[mode];
  const moves = showAllMoves
    ? (Object.keys(MODE_LABEL) as Mode[])
    : RECOMMENDED_MOVES[scenarioId] ?? [mode, "explain", "signal"];

  function patch(next: Partial<SpecDraft>, changed: Detail | "mode") {
    onDraftChange((current) => {
      const updated = reconcile({ ...current, ...next }, changed);
      if (updated.level && (changed === "level" || changed === "channel" || changed === "audience")) {
        const channels = channelsForLevel(updated.level);
        const audiences = audiencesForLevel(updated.level);
        if (!updated.channel) updated.channel = channels[0];
        if (!updated.audience) updated.audience = audiences.find((value) => AUDIENCE_FACING[value] === CHANNEL_FACING[updated.channel!]) ?? audiences[0];
        if (AUDIENCE_FACING[updated.audience] !== CHANNEL_FACING[updated.channel]) {
          if (changed === "audience") {
            updated.channel = channels.find((value) => CHANNEL_FACING[value] === AUDIENCE_FACING[updated.audience!]) ?? channels[0];
          } else {
            updated.audience = audiences.find((value) => AUDIENCE_FACING[value] === CHANNEL_FACING[updated.channel!]) ?? audiences[0];
          }
        }
      }
      return updated;
    });
    setResponse(null);
    setActivePatternId(null);
  }

  function chooseSituation(id: string) {
    onSelectSituation(id);
    setActivePatternId(null);
    setResponse(null);
    setActiveDetail(null);
    setShowAllMoves(false);
    setStep("move");
  }

  function chooseMove(nextMode: Mode) {
    patch({ mode: nextMode, responses: getMode(nextMode).responses }, "mode");
    setActiveDetail(null);
    setStep("matches");
  }

  const recipient = draft.audience ? AUDIENCE_LABEL[draft.audience] : "Choose receiver";
  const channel = draft.channel ? CHANNEL_LABEL[draft.channel] : "Choose surface";
  const level = draft.level ? LEVEL_LABEL[draft.level] : "Choose participants";
  const responseOptions = draft.responses;
  const patternLabel = step === "matches" && exact.length && activePattern ? activePattern.name : "Live preview";
  const outcome = response ? responseOutcome(response) : null;
  const settingsSummary = scenarioId === "memory-commitment-review" && mode === "commit"
    ? "Churn baseline 12% → 41%"
    : sentenceCase(MODE_PLAIN[mode]);

  return (
    <section className="v2-qb" aria-label="Studio behavior builder">
      <div className="v2-qb__top">
        <div className="v2-qb__brand"><span>Studio</span><strong>Shape an interaction</strong></div>
        <div className="v2-qb__progress" aria-label="Builder progress">
          <button type="button" data-active={step === "situation"} onClick={() => setStep("situation")}><span>1</span> Situation</button>
          <i aria-hidden="true" />
          <button type="button" data-active={step === "move"} onClick={() => setStep("move")}><span>2</span> Agent move</button>
          <i aria-hidden="true" />
          <button type="button" data-active={step === "matches"} onClick={() => setStep("matches")}><Layers3 size={15} aria-hidden="true" /> Patterns</button>
        </div>
      </div>
      <div className="v2-qb__body">
        <section key={step} className="v2-qb__choice-pane" aria-live="polite">
          {step === "situation" ? (
            <>
              <div className="v2-qb__pane-heading"><p>CHOOSE A MOMENT</p><h1>What is happening?</h1></div>
              <div className="v2-qb__scenario-grid">
                {starters.map((starter) => {
                  const Icon = SCENARIO_ICON[starter.patternId] ?? Sparkles;
                  return (
                    <button type="button" key={starter.patternId} className="v2-qb__scenario" data-selected={scenarioId === starter.patternId} onClick={() => chooseSituation(starter.patternId)}>
                      <span className="v2-qb__scenario-art"><Icon aria-hidden="true" strokeWidth={1.6} /></span>
                      <strong>{starter.label}</strong><ArrowRight aria-hidden="true" size={17} />
                    </button>
                  );
                })}
              </div>
            </>
          ) : step === "move" ? (
            <>
              <div className="v2-qb__pane-heading"><p>CHOOSE THE AGENT’S MOVE</p><h1>What should it do?</h1></div>
              <div className="v2-qb__move-grid" data-all={showAllMoves}>
                {moves.map((choice) => {
                  const Icon = MOVE_ICON[choice];
                  return (
                    <button type="button" key={choice} className="v2-qb__move" data-selected={mode === choice} onClick={() => chooseMove(choice)}>
                      <span className="v2-qb__move-art"><Icon aria-hidden="true" strokeWidth={1.65} /></span>
                      <strong>{showAllMoves ? MOVE_SHORT[choice] : sentenceCase(MODE_PLAIN[choice])}</strong>
                      <small>{MODE_LABEL[choice]}</small>
                    </button>
                  );
                })}
              </div>
              <div className="v2-qb__pane-bottom"><button type="button" className="v2-qb__text-button" onClick={() => setStep("situation")}><ArrowLeft size={15} /> Situation</button><button type="button" className="v2-qb__text-button" onClick={() => setShowAllMoves((value) => !value)}>{showAllMoves ? "Suggested moves" : "See all moves"}</button></div>
            </>
          ) : (
            <>
              <div className="v2-qb__pane-heading"><p>{exact.length ? `${exact.length} FITTING PATTERNS` : "CLOSEST PATTERNS"}</p><h1>{exact.length ? "A good fit for this behavior" : "Choose a nearby pattern"}</h1></div>
              <div className="v2-qb__match-list">
                {shownMatches.slice(0, 3).map((match) => (
                  <button type="button" className="v2-qb__match" data-selected={activeMatch?.pattern.id === match.pattern.id} key={match.pattern.id} onClick={() => { setActivePatternId(match.pattern.id); setResponse(null); }}>
                    <span className="v2-qb__match-icon"><Layers3 size={19} strokeWidth={1.7} aria-hidden="true" /></span>
                    <span><strong>{match.pattern.name}</strong><small>{exact.length ? "Fits your choices" : compactDifference(match)}</small></span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                ))}
              </div>
              {exact.length === 0 && activePattern ? <button type="button" className="v2-qb__apply" onClick={() => { onApplyPattern(activePattern.id); setActivePatternId(activePattern.id); setResponse(null); }}>Use this pattern’s choices <ArrowRight size={15} /></button> : null}
              <div className="v2-qb__pane-bottom"><button type="button" className="v2-qb__text-button" onClick={() => setStep("move")}><ArrowLeft size={15} /> Agent move</button>{activePattern ? <Link href={`/v2/patterns/${activePattern.id}`} className="v2-qb__text-button">Read pattern <ArrowRight size={15} /></Link> : null}</div>
            </>
          )}
        </section>
        <section className="v2-qb__preview" aria-label="Live interaction preview">
          <div className="v2-qb__preview-head"><span><span className="v2-qb__live-dot" /> {patternLabel}</span><span className="v2-qb__preview-hint">Tap a detail to change it</span></div>
          <div className="v2-qb__facts">
            <button type="button" onClick={() => setActiveDetail(activeDetail === "trigger" ? null : "trigger")} data-active={activeDetail === "trigger"}><Clock3 size={14} /> {draft.trigger || "Choose moment"}</button>
            <button type="button" onClick={() => setActiveDetail(activeDetail === "level" ? null : "level")} data-active={activeDetail === "level"}><UsersRound size={14} /> {level}</button>
          </div>
          <div className="v2-qb__stage">
            <div className="v2-qb__stage-head"><span><Bot size={16} /> Agent interaction</span><button type="button" onClick={() => setActiveDetail(activeDetail === "channel" ? null : "channel")} data-active={activeDetail === "channel"}><SlidersHorizontal size={13} /> {channel}</button></div>
            {draft.channel === "settings_panel" ? (
              <div className="v2-qb__settings-scene"><div><small>AGENT SETTINGS</small><strong>{settingsSummary}</strong></div><div><span>When</span><b>{draft.trigger}</b></div><div><span>Decision</span><b>{outcome ?? "Waiting for a response"}</b></div></div>
            ) : draft.channel === "shared_record" || draft.channel === "agent_message" || draft.channel === "state_signal" ? (
              <div className="v2-qb__data-scene"><small>AGENT-READABLE STATE</small><dl>
                <div><dt>mode</dt><dd>{mode}</dd></div>
                <div><dt>to</dt><dd>{draft.audience ?? "self"}</dd></div>
                <div><dt>when</dt><dd>{draft.trigger}</dd></div>
                <div><dt>response</dt><dd>{response ?? "null"}</dd></div>
              </dl></div>
            ) : (
              <div className="v2-qb__chat-scene"><span className="v2-qb__avatar">A</span><div className="v2-qb__bubble"><small>AGENT · {MODE_LABEL[mode].toUpperCase()}</small><strong>{opening}</strong></div></div>
            )}
            <div className="v2-qb__receiver"><button type="button" onClick={() => setActiveDetail(activeDetail === "audience" ? null : "audience")} data-active={activeDetail === "audience"}><span className="v2-qb__person">{draft.audience && AUDIENCE_FACING[draft.audience] === "agent" ? "A" : "P"}</span>{recipient}<Pencil size={12} /></button></div>
            {activeDetail ? (
              <div className="v2-qb__detail-pop" role="dialog" aria-label={`Change ${DETAIL_LABEL[activeDetail]}`}>
                <div><strong>{DETAIL_LABEL[activeDetail]}</strong><button type="button" aria-label="Close detail" onClick={() => setActiveDetail(null)}><X size={15} /></button></div>
                {activeDetail === "trigger" ? <input aria-label="Moment" value={draft.trigger} onChange={(event) => patch({ trigger: event.target.value }, "trigger")} /> : null}
                {activeDetail === "level" ? LEVEL_ORDER.map((value) => <button type="button" key={value} data-selected={draft.level === value} onClick={() => { patch({ level: value }, "level"); setActiveDetail(null); }}>{LEVEL_LABEL[value]}</button>) : null}
                {activeDetail === "audience" ? (draft.level ? audiencesForLevel(draft.level) : ["self", "peer_agent", "orchestrator", "operator", "team"] as Audience[]).map((value) => <button type="button" key={value} data-selected={draft.audience === value} onClick={() => { patch({ audience: value }, "audience"); setActiveDetail(null); }}>{AUDIENCE_LABEL[value]}</button>) : null}
                {activeDetail === "channel" ? (draft.level ? channelsForLevel(draft.level) : ["chat_ui", "settings_panel", "shared_ui", "agent_message", "shared_record", "state_signal"] as Channel[]).map((value) => <button type="button" key={value} data-selected={draft.channel === value} onClick={() => { patch({ channel: value }, "channel"); setActiveDetail(null); }}>{CHANNEL_LABEL[value]}</button>) : null}
                {activeDetail === "responses" ? getMode(mode).responses.map((value) => <button type="button" key={value} data-selected={draft.responses.includes(value)} onClick={() => patch({ responses: draft.responses.includes(value) ? draft.responses.filter((item) => item !== value) : [...draft.responses, value] }, "responses")}>{value}</button>) : null}
              </div>
            ) : null}
          </div>
          <div className="v2-qb__response-head"><span>{step === "matches" ? "TRY A RESPONSE" : "POSSIBLE RESPONSES"}</span><button type="button" onClick={() => setActiveDetail(activeDetail === "responses" ? null : "responses")} aria-label="Edit responses"><Pencil size={13} /></button></div>
          <div className="v2-qb__responses">{responseOptions.map((choice) => <button type="button" key={choice} aria-pressed={response === choice} onClick={() => setResponse(choice)}>{choice}</button>)}</div>
          <p className="v2-qb__outcome" aria-live="polite">{outcome ?? (step === "matches" ? "Choose a response to see what changes." : "Your choices update this interaction.")}</p>
        </section>
      </div>
      <div className="v2-qb__footer"><span><span className="v2-qb__live-dot" /> {exact.length ? `${exact.length} patterns fit` : "Closest patterns ready"}</span>{step === "matches" && activePattern ? <Link href={`/v2/patterns/${activePattern.id}`}>{exact.length ? "Open pattern" : "Read closest pattern"} <ArrowRight size={15} /></Link> : <button type="button" onClick={() => setStep(step === "situation" ? "move" : "matches")}>Continue <ArrowRight size={15} /></button>}</div>
    </section>
  );
}

function sentenceCase(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1); }
function compactDifference(match: StudioMatch): string { return match.differences[0] ?? "Closest fit"; }
function responseOutcome(response: string): string {
  const outcomes: Record<string, string> = {
    consent: "The agent may proceed.", correct: "The agent revises its plan.", decline: "The action stops.", defer: "The agent waits.",
    adopt: "This answer becomes the shared conclusion.", "flag impasse": "The disagreement stays open.",
    keep: "The updated belief is kept.", restore: "The earlier belief is restored.", revoke: "The belief is excluded.",
    "act jointly": "The participants continue together.", verify: "The receiver checks the evidence.", monitor: "The receiver keeps watching.",
  };
  return outcomes[response] ?? `The receiver chose ${response}.`;
}
