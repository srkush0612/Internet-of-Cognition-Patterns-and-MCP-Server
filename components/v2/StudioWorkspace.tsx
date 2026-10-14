"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import { ChannelPreview } from "@/components/v2/ChannelPreview";
import { StudioGeneratedPreview } from "@/components/v2/StudioGeneratedPreview";
import { getV2Pattern, patterns } from "@/lib/v2/catalog";
import {
  AUDIENCE_FACING, AUDIENCE_LABEL, CHANNEL_FACING, CHANNEL_LABEL,
  audiencesForLevel, channelsForLevel,
} from "@/lib/v2/levels";
import { MODE_LABEL, MODE_ORDER, MODE_PLAIN, getMode } from "@/lib/v2/modes";
import { EMPTY_SPEC, reconcile, specFromPattern, type SpecDraft } from "@/lib/v2/spec";
import { rankStudioPatterns, type StudioMatch } from "@/lib/v2/studio-matching";
import { situationFor } from "@/lib/v2/situations";
import { studioMarkdown, studioSvg } from "@/lib/v2/studio-export";
import { interpretWorkspacePrompt, type WorkspaceEffect } from "@/lib/v2/studio-workspace-chat";
import type { Mode, Pattern } from "@/lib/v2/types";

type DiscoverStage = "situations" | "moves" | "matches" | "catalog";
type MobileView = "discover" | "canvas" | "conversation";
type ReasoningDetail = { title: string; body?: string; points?: string[] };
type ReasoningCardData = {
  key: string;
  fit: "direct" | "related" | "catalog";
  title: string;
  context: string;
  highlight: string;
  facts: { label: string; value: string }[];
  notice?: string;
  details: ReasoningDetail[];
};
type Message = { id: number; role: "user" | "assistant"; text: string; reasoning?: ReasoningCardData; canvasUpdate?: boolean };
type Snapshot = { draft: SpecDraft; behaviorNotes: string[] };
type WorkspaceDraft = Snapshot & { changes: string[]; history: Snapshot[]; thread: Message[] };
type StudioTransition = { title: string; target: MobileView; placement?: "moves" | "patterns" | "workspace"; choiceId?: string };

type SituationChoice = { patternId: string; label: string; detail: string };
type StudioDesign = {
  accent: string;
  glow: string;
  surface: "cool" | "warm";
  motion: number;
  reveal: "inline" | "focus";
  density: "airy" | "compact";
  radius: number;
};
const DEFAULT_STUDIO_DESIGN: StudioDesign = {
  accent: "#18b6d9",
  glow: "#9c83ee",
  surface: "cool",
  motion: 320,
  reveal: "inline",
  density: "airy",
  radius: 12,
};
const SITUATIONS: SituationChoice[] = [
  { patternId: "pre-action-handshake", label: "Before the agent acts", detail: "A service restart is imminent" },
  { patternId: "convergence-point", label: "When agents disagree", detail: "They reach different answers" },
  { patternId: "memory-commitment-review", label: "When a belief changes", detail: "The incident session is ending" },
  { patternId: "inline-rationale", label: "When the agent needs to surface something", detail: "A recommendation lands without its why" },
];
const RECOMMENDED: Record<string, Mode[]> = {
  "pre-action-handshake": ["propose", "explain", "signal"],
  "convergence-point": ["resolve", "coordinate", "explain"],
  "memory-commitment-review": ["commit", "propose", "signal"],
  "inline-rationale": ["explain", "signal"],
};
const STUDIO_OUTCOMES: Record<string, string> = {
  "pre-action-handshake": "The restart is still a proposal, so the operator can check the agent's interpretation and plan before anything is executed. A correction, decline, or deferral can change what happens next.",
};
const CATALOG_PAGE_SIZE = 4;

function catalogDraft(pattern: Pattern): SpecDraft {
  return { ...specFromPattern(pattern), trigger: situationFor(pattern.id)?.trigger ?? pattern.triggers[0] ?? "" };
}

function selectionReasoning(pattern: Pattern, choice?: { moment: SituationChoice; mode: Mode; match: StudioMatch }): ReasoningCardData {
  const responseOptions = pattern.responses ?? getMode(pattern.mode.primary).responses;
  const selectedTrigger = choice ? situationFor(choice.moment.patternId)?.trigger : undefined;
  const authoredMoments = pattern.triggers.length ? pattern.triggers.join("; ") : "The relevant moment occurs";
  const receivers = joinNatural(pattern.audience.map((value) => AUDIENCE_LABEL[value].toLowerCase()));
  const views = joinNatural(pattern.channels.map((value) => CHANNEL_LABEL[value]));
  const outcome = pattern.whatItSolves ?? STUDIO_OUTCOMES[pattern.id] ?? pattern.summary;
  const interaction = pattern.interactionModel ?? `The agent's primary move is to ${MODE_PLAIN[pattern.mode.primary]}.`;

  if (!choice) {
    return {
      key: `catalog:${pattern.id}`,
      fit: "catalog",
      title: pattern.name,
      context: "Chosen directly from the catalog",
      highlight: outcome,
      facts: [
        { label: "Agent move", value: sentenceCase(MODE_PLAIN[pattern.mode.primary]) },
        { label: "Receiver", value: sentenceCase(receivers) },
        { label: "Views", value: views },
      ],
      details: [
        { title: "When it appears", body: authoredMoments },
        { title: "Interaction and choices", body: interaction, points: [`The receiver can ${joinNatural(responseOptions)}.`] },
        { title: "About this preview", body: "The center canvas keeps the catalog UI as a reference. Describe how the behavior should work in your UI through the conversation." },
      ],
    };
  }

  const { moment, mode, match } = choice;
  const related = Boolean(match.differences.length || pattern.id !== moment.patternId);
  const matchReasons = match.reasons.map((reason) => {
    if (reason === `${MODE_LABEL[mode]} is its primary action`) return `Agent move matches: ${MODE_PLAIN[mode]}`;
    if (reason.startsWith("works with ")) return `Participants match: ${reason.slice("works with ".length)}`;
    if (reason.startsWith("reaches ")) return `Receiver matches: ${reason.slice("reaches ".length)}`;
    if (reason.startsWith("appears in ")) return `Surface matches: ${reason.slice("appears in ".length)}`;
    if (reason === "supports your chosen responses") return "Response options match the scenario";
    if (reason === "speaks to your trigger or description") return "The catalog wording relates to the scenario trigger";
    return sentenceCase(reason);
  });
  const previewNote = pattern.id === "pre-action-handshake" && moment.patternId === pattern.id
    ? "The catalog preview uses a retry-job pause and replica scale rather than a restart. It demonstrates the same decision before action."
    : "The center canvas keeps the original catalog example as a reference while you adapt its behavior in conversation.";

  return {
    key: `match:${pattern.id}:${moment.patternId}:${mode}:${match.differences.join("|")}`,
    fit: related ? "related" : "direct",
    title: pattern.name,
    context: `${moment.label} · ${moment.detail}`,
    highlight: outcome,
    facts: [
      { label: "Your move", value: sentenceCase(MODE_PLAIN[mode]) },
      ...(pattern.mode.primary !== mode ? [{ label: "Pattern move", value: sentenceCase(MODE_PLAIN[pattern.mode.primary]) }] : []),
      { label: "Receiver", value: sentenceCase(receivers) },
      { label: "Views", value: views },
    ],
    notice: match.differences.length
      ? `Related fit: ${match.differences[0]}. Review the full match below.`
      : pattern.id !== moment.patternId
        ? `Related fit: the catalog begins at “${pattern.triggers[0] ?? "a different moment"}.” Adapt that trigger to your scenario.`
        : undefined,
    details: [
      {
        title: "Why it was suggested",
        body: related
          ? "The catalog found these points of agreement and differences."
          : "The move, participants, receiver, surface, and response options align with this scenario.",
        points: [
          ...matchReasons,
          ...match.differences.map((difference) => `Difference: ${difference}`),
          ...(pattern.id !== moment.patternId ? ["The authored trigger may need adapting for your selected moment."] : []),
        ],
      },
      {
        title: "What happens",
        body: `Your scenario begins when ${selectedTrigger ?? moment.detail}. Catalog trigger moments: ${authoredMoments}. ${interaction}`,
        points: [`Intended receiver: ${receivers}.`, `The receiver can ${joinNatural(responseOptions)}.`],
      },
      { title: "Catalog example", body: previewNote },
    ],
  };
}

function joinNatural(values: string[]): string {
  if (values.length < 2) return values[0] ?? "";
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}

function initialWorkspace(pattern: Pattern, reasoning: ReasoningCardData): WorkspaceDraft {
  return {
    draft: specFromPattern(pattern),
    behaviorNotes: [],
    changes: [],
    history: [],
    thread: [{ id: 0, role: "assistant", text: reasoning.title, reasoning }],
  };
}

function cloneSnapshot(workspace: WorkspaceDraft): Snapshot {
  return { draft: { ...workspace.draft, responses: [...workspace.draft.responses] }, behaviorNotes: [...workspace.behaviorNotes] };
}

function normalizeDraft(draft: SpecDraft, changed: "level" | "channel" | "audience"): SpecDraft {
  const next = { ...draft };
  if (changed === "channel" && next.channel && next.level && !channelsForLevel(next.level).includes(next.channel)) {
    next.level = CHANNEL_FACING[next.channel] === "human" ? "L3" : "L2";
  }
  if (changed === "audience" && next.audience && next.level && !audiencesForLevel(next.level).includes(next.audience)) {
    next.level = next.audience === "team" ? "L4" : AUDIENCE_FACING[next.audience] === "human" ? "L3" : "L2";
  }
  if (!next.level) next.level = "L3";
  const channels = channelsForLevel(next.level);
  const audiences = audiencesForLevel(next.level);
  if (!next.channel || !channels.includes(next.channel)) next.channel = channels.find((value) => CHANNEL_FACING[value] === (next.audience ? AUDIENCE_FACING[next.audience] : "human")) ?? channels[0];
  if (!next.audience || !audiences.includes(next.audience) || AUDIENCE_FACING[next.audience] !== CHANNEL_FACING[next.channel]) {
    if (changed === "audience" && next.audience) {
      next.channel = channels.find((value) => CHANNEL_FACING[value] === AUDIENCE_FACING[next.audience!]) ?? channels[0];
    } else {
      next.audience = audiences.find((value) => AUDIENCE_FACING[value] === CHANNEL_FACING[next.channel!]) ?? audiences[0];
    }
  }
  return next;
}

function applyEffect(workspace: WorkspaceDraft, effect: WorkspaceEffect): WorkspaceDraft {
  const next = { ...workspace, draft: { ...workspace.draft, responses: [...workspace.draft.responses] }, behaviorNotes: [...workspace.behaviorNotes] };
  if (effect.kind === "behavior_note") next.behaviorNotes = effect.replaceLast ? [...next.behaviorNotes.slice(0, -1), effect.value] : [...next.behaviorNotes, effect.value];
  if (effect.kind === "timed_trigger") { next.draft.trigger = effect.value; next.behaviorNotes = [...next.behaviorNotes, effect.note]; }
  if (effect.kind === "trigger") next.draft.trigger = effect.value;
  if (effect.kind === "mode") next.draft = reconcile({ ...next.draft, mode: effect.value }, "mode");
  if (effect.kind === "channel") next.draft = normalizeDraft({ ...next.draft, channel: effect.value }, "channel");
  if (effect.kind === "audience") next.draft = normalizeDraft({ ...next.draft, audience: effect.value }, "audience");
  if (effect.kind === "level") next.draft = normalizeDraft(reconcile({ ...next.draft, level: effect.value }, "level"), "level");
  if (effect.kind === "response") {
    next.draft.responses = effect.action === "remove"
      ? next.draft.responses.filter((value) => value !== effect.value)
      : [...new Set([...next.draft.responses, effect.value])];
  }
  return next;
}

function downloadText(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function StudioWorkspace() {
  const [stage, setStage] = useState<DiscoverStage>("situations");
  const [catalogReturnStage, setCatalogReturnStage] = useState<Exclude<DiscoverStage, "catalog">>("situations");
  const [mobileView, setMobileView] = useState<MobileView>("discover");
  const [situationId, setSituationId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [discoveryDraft, setDiscoveryDraft] = useState<SpecDraft>(EMPTY_SPEC);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [showOriginal, setShowOriginal] = useState(true);
  const [workspaces, setWorkspaces] = useState<Record<string, WorkspaceDraft>>({});
  const [catalogPage, setCatalogPage] = useState(0);
  const [allMoves, setAllMoves] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [feedback, setFeedback] = useState("");
  const [transition, setTransition] = useState<StudioTransition | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextMessageId = useRef(0);
  const threadRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLElement>(null);
  const pattern = selectedPatternId ? getV2Pattern(selectedPatternId) : undefined;
  const workspace = selectedPatternId ? workspaces[selectedPatternId] : undefined;
  const enteringWorkspace = transition?.placement === "workspace";
  const workspaceVisible = Boolean(pattern && workspace) || enteringWorkspace;
  const visibleMobileView = enteringWorkspace ? "canvas" : mobileView;
  const matches = useMemo(() => rankStudioPatterns(discoveryDraft, patterns), [discoveryDraft]);
  const recommended = matches.exact.length ? matches.exact : matches.near;
  const moves = allMoves ? MODE_ORDER : RECOMMENDED[situationId ?? ""] ?? ["propose", "explain", "signal"];
  const designStyles = {
    "--studio-accent": DEFAULT_STUDIO_DESIGN.accent,
    "--studio-glow": DEFAULT_STUDIO_DESIGN.glow,
    "--studio-motion": `${DEFAULT_STUDIO_DESIGN.motion}ms`,
    "--studio-radius": `${DEFAULT_STUDIO_DESIGN.radius}px`,
  } as CSSProperties;

  useEffect(() => () => { if (transitionTimer.current) clearTimeout(transitionTimer.current); }, []);

  function moveThrough(title: string, _detail: string, action: () => void, duration = 440, target: MobileView = mobileView, placement?: StudioTransition["placement"], choiceId?: string) {
    if (transitionTimer.current) return;
    setTransition({ title, target, placement, choiceId });
    transitionTimer.current = setTimeout(() => {
      action();
      setTransition(null);
      transitionTimer.current = null;
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 130 : duration);
  }

  function openCatalog() {
    moveThrough("Loading catalog patterns", "Finding patterns across the library", () => {
      if (stage !== "catalog") setCatalogReturnStage(stage);
      setStage("catalog");
      setLibraryOpen(true);
      setMobileView("discover");
    }, 440, "discover");
  }

  function backInLibrary() {
    moveThrough("Returning to your choices", "Keeping the current interaction in view", () => {
      if (stage === "catalog") setStage(catalogReturnStage);
      else if (stage === "matches") setStage("moves");
      else if (stage === "moves") setStage("situations");
    }, 320, "discover");
  }

  function closeLibrary() {
    moveThrough("Opening the workspace", "Moving from patterns to your interaction", () => {
      setLibraryOpen(false);
      setMobileView(selectedPatternId ? "conversation" : "canvas");
    }, 320, "discover");
  }

  function toggleLibrary() {
    if (libraryOpen) closeLibrary();
    else {
      moveThrough("Opening patterns", "Bringing the library into view", () => {
        setLibraryOpen(true);
        setMobileView("discover");
      }, 320, "discover");
    }
  }

  function returnToLanding() {
    moveThrough("Returning to Studio", "Starting a new interaction", () => {
      setStage("situations");
      setCatalogReturnStage("situations");
      setMobileView("discover");
      setSituationId(null);
      setSelectedMode(null);
      setDiscoveryDraft(EMPTY_SPEC);
      setSelectedPatternId(null);
      setLibraryOpen(true);
      setShowOriginal(true);
      setCatalogPage(0);
      setAllMoves(false);
      setPrompt("");
      setFeedback("");
    }, 440);
  }

  function openCanvas() {
    moveThrough("Opening the canvas", "Preparing the interaction view", () => {
      setLibraryOpen(false);
      setMobileView("canvas");
      canvasRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 320);
  }

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = (workspace?.thread.length ?? 0) > 1 ? threadRef.current.scrollHeight : 0;
  }, [workspace?.thread.length, mobileView, selectedPatternId]);

  function chooseSituation(id: string) {
    const selected = getV2Pattern(id);
    if (!selected) return;
    moveThrough("Finding agent moves", SITUATIONS.find((item) => item.patternId === id)?.label ?? "For this moment", () => {
      setSituationId(id);
      setSelectedMode(null);
      setSelectedPatternId(null);
      setDiscoveryDraft(catalogDraft(selected));
      setAllMoves(false);
      setStage("moves");
    }, 440, "discover", "moves", id);
  }

  function chooseMode(mode: Mode) {
    moveThrough("Matching catalog patterns", MODE_LABEL[mode], () => {
      setSelectedMode(mode);
      setSelectedPatternId(null);
      setDiscoveryDraft((current) => reconcile({ ...current, mode }, "mode"));
      setStage("matches");
    }, 500, "discover", "patterns", mode);
  }

  function loadPattern(id: string, source: "matches" | "catalog") {
    const selected = getV2Pattern(id);
    if (!selected) return;
    const moment = SITUATIONS.find((item) => item.patternId === situationId);
    const match = recommended.find((item) => item.pattern.id === id);
    const choice = source === "matches" && moment && discoveryDraft.mode && match
      ? { moment, mode: discoveryDraft.mode, match }
      : undefined;
    const reasoning = selectionReasoning(selected, choice);
    const explanationId = ++nextMessageId.current;
    moveThrough("Opening the pattern", selected.name, () => {
      setWorkspaces((current) => {
        const existing = current[id];
        if (!existing) return { ...current, [id]: initialWorkspace(selected, reasoning) };
        if (selectedPatternId === id && existing.thread.at(-1)?.reasoning?.key === reasoning.key) return current;
        return { ...current, [id]: { ...existing, thread: [...existing.thread, { id: explanationId, role: "assistant", text: reasoning.title, reasoning }] } };
      });
      setSelectedPatternId(id);
      setLibraryOpen(false);
      setShowOriginal(true);
      setFeedback("");
      setMobileView("canvas");
    }, 560, "canvas", "workspace", id);
  }

  function undo() {
    if (!selectedPatternId || !workspace?.history.length) return;
    const id = selectedPatternId;
    const messageId = ++nextMessageId.current;
    moveThrough("Restoring the previous version", "Updating the interaction canvas", () => {
      setWorkspaces((current) => {
        const existing = current[id];
        if (!existing?.history.length) return current;
        const previous = existing.history[existing.history.length - 1];
        return { ...current, [id]: { ...existing, draft: previous.draft, behaviorNotes: previous.behaviorNotes, history: existing.history.slice(0, -1), changes: existing.changes.slice(0, -1), thread: [...existing.thread, { id: messageId, role: "assistant", text: "Undid the last behavior change." }] } };
      });
      setFeedback("Last behavior change undone");
      if (workspace.history.length === 1) setShowOriginal(true);
    }, 360);
  }

  function revertToOriginal() {
    if (!selectedPatternId || !pattern) return;
    const id = selectedPatternId;
    const original = specFromPattern(pattern);
    const messageId = ++nextMessageId.current;
    moveThrough("Restoring the catalog pattern", "Removing Studio changes", () => {
      setWorkspaces((current) => current[id] ? { ...current, [id]: { ...current[id], draft: original, behaviorNotes: [], history: [], changes: [], thread: [...current[id].thread, { id: messageId, role: "assistant", text: "Reverted to the original catalog behavior. Your conversation stays here for reference." }] } } : current);
      setFeedback("Reverted to original behavior");
      setShowOriginal(true);
    }, 390);
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pattern || !workspace || !selectedPatternId || !prompt.trim()) return;
    const text = prompt.trim();
    const reply = interpretWorkspacePrompt(pattern, workspace.draft, text);
    const userId = ++nextMessageId.current;
    const assistantId = ++nextMessageId.current;
    const id = selectedPatternId;
    const applyReply = () => {
      setWorkspaces((current) => {
        const existing = current[id];
        if (!existing) return current;
        const next = reply.effect ? applyEffect(existing, reply.effect) : existing;
        return { ...current, [id]: {
          ...next,
          history: reply.effect ? [...existing.history, cloneSnapshot(existing)].slice(-20) : existing.history,
          changes: reply.effect ? [...existing.changes, text] : existing.changes,
          thread: [...existing.thread, { id: userId, role: "user", text }, { id: assistantId, role: "assistant", text: reply.text, canvasUpdate: Boolean(reply.effect) }],
        } };
      });
      setPrompt("");
      setFeedback(reply.effect ? "Interaction UI updated from conversation" : "");
      if (reply.effect) { setShowOriginal(false); setMobileView("canvas"); }
    };
    if (reply.effect) moveThrough("Updating the pattern UI", "Comparing your change with the original", applyReply, 620, "canvas");
    else applyReply();
  }

  async function copyMarkdown() {
    if (!pattern || !workspace) return;
    try {
      await navigator.clipboard.writeText(studioMarkdown(pattern, workspace));
      setFeedback("Markdown copied");
    } catch {
      setFeedback("Copy failed. Download the Markdown file instead.");
    }
  }

  function exportMarkdown() {
    if (!pattern || !workspace) return;
    downloadText(`${pattern.id}-studio.md`, studioMarkdown(pattern, workspace), "text/markdown;charset=utf-8");
    setFeedback("Markdown downloaded");
  }

  function exportFigmaSvg() {
    if (!pattern || !workspace) return;
    downloadText(`${pattern.id}-interaction.svg`, studioSvg(pattern, workspace), "image/svg+xml;charset=utf-8");
    setFeedback("Interaction SVG downloaded for Figma");
  }

  return (
    <div className="v2-workspace" aria-busy={Boolean(transition)} data-mobile-view={visibleMobileView} data-library-open={enteringWorkspace ? false : libraryOpen} data-has-pattern={workspaceVisible} data-studio-surface={DEFAULT_STUDIO_DESIGN.surface} data-studio-reveal={DEFAULT_STUDIO_DESIGN.reveal} data-studio-density={DEFAULT_STUDIO_DESIGN.density} style={designStyles}>
      <div className="v2-workspace__top">
        <nav className="v2-workspace__location" aria-label="Studio navigation"><button type="button" onClick={returnToLanding}>Studio</button><span aria-hidden="true">/</span><strong>{pattern ? pattern.name : enteringWorkspace ? "Opening pattern" : "Your use case"}</strong></nav>
        <div className="v2-workspace__top-right">
          {pattern ? <button type="button" className="v2-workspace__library-trigger" aria-expanded={libraryOpen} aria-controls="v2-pattern-library" onClick={toggleLibrary}>{libraryOpen ? "Close library" : "Browse patterns"}</button> : null}
          {pattern && workspace ? <details className="v2-workspace__exports"><summary>Export</summary><div><button type="button" onClick={copyMarkdown}>Copy behavior .md</button><button type="button" onClick={exportMarkdown}>Download behavior .md</button><button type="button" onClick={exportFigmaSvg}>Interaction SVG for Figma</button></div></details> : null}
        </div>
        {transition ? <div className="v2-workspace__activity" role="status" aria-live="polite"><span>{transition.title}</span><i aria-hidden="true" /></div> : null}
      </div>
      <div className="v2-workspace__mobile-tabs" role="tablist" aria-label="Studio panels">
        {(["discover", "conversation", "canvas"] as MobileView[]).map((view) => <button type="button" key={view} role="tab" aria-selected={visibleMobileView === view} onClick={() => { if (view !== mobileView) moveThrough(`Opening ${view === "discover" ? "patterns" : view}`, "Moving through your Studio workspace", () => { setMobileView(view); setLibraryOpen(view === "discover"); }, 320); }}>{view === "discover" ? "Patterns" : view === "canvas" ? "Canvas" : "Conversation"}</button>)}
      </div>
      <div className="v2-workspace__grid">
        <button type="button" className="v2-workspace__library-backdrop" aria-label="Close pattern library" onClick={closeLibrary} tabIndex={libraryOpen && Boolean(pattern) ? 0 : -1} />
        <aside id="v2-pattern-library" className="v2-workspace__discover" aria-label="Discover catalog patterns" aria-hidden={workspaceVisible && (enteringWorkspace || (!libraryOpen && visibleMobileView !== "discover"))}>
          <div className="v2-workspace__panel-head v2-workspace__discover-head"><div><div className="v2-workspace__discover-head-top">{stage === "catalog" ? <button type="button" className="v2-workspace__step-back" onClick={backInLibrary}>← Your use case</button> : <span className="v2-workspace__eyebrow">01 / YOUR USE CASE</span>}{stage !== "catalog" ? <button type="button" className="v2-workspace__catalog-link" onClick={openCatalog}>All patterns</button> : null}</div><h2>{stage === "catalog" ? "All patterns" : "Describe your agent’s situation"}</h2><p className="v2-workspace__moment-explainer">{stage === "catalog" ? "Browse the catalog, then open a pattern on the canvas to adapt it." : "Choose the moment and move that describe your use case. We’ll suggest patterns you can adapt on the canvas."}</p></div></div>
          {stage !== "catalog" ? <div className="v2-workspace__onboarding" aria-label="Choose a moment, move, and pattern">
            <div className="v2-workspace__onboarding-choices" aria-label="Choose a moment">{SITUATIONS.map((item, index) => <button type="button" className="v2-workspace__onboarding-chip v2-workspace__onboarding-chip--moment" key={item.patternId} data-selected={situationId === item.patternId || (transition?.placement === "moves" && transition.choiceId === item.patternId)} aria-pressed={situationId === item.patternId || (transition?.placement === "moves" && transition.choiceId === item.patternId)} onClick={() => chooseSituation(item.patternId)}><span className="v2-workspace__onboarding-index">0{index + 1}</span><strong>{item.label}</strong><MomentDiagram patternId={item.patternId} /></button>)}</div>
            {transition?.placement === "moves" ? <OnboardingSkeleton title={transition.title} kind="moves" /> : null}
            {stage !== "situations" && situationId && transition?.placement !== "moves" ? <section className="v2-workspace__onboarding-step v2-workspace__onboarding-step--moves" data-all-moves={allMoves} aria-label="Choose an agent move"><div className="v2-workspace__onboarding-step-head"><h3>What should your agent do then?</h3></div><div className="v2-workspace__onboarding-choices">{moves.map((mode) => <button type="button" className="v2-workspace__onboarding-chip" key={mode} data-selected={selectedMode === mode || (transition?.placement === "patterns" && transition.choiceId === mode)} aria-pressed={selectedMode === mode || (transition?.placement === "patterns" && transition.choiceId === mode)} onClick={() => chooseMode(mode)}>{sentenceCase(MODE_PLAIN[mode])}</button>)}</div><button type="button" className="v2-workspace__onboarding-more" onClick={() => setAllMoves((value) => !value)}>{allMoves ? "Show suggested moves" : "Show all moves"}</button></section> : null}
            {transition?.placement === "patterns" ? <OnboardingSkeleton title={transition.title} kind="patterns" /> : null}
            {stage === "matches" && selectedMode && transition?.placement !== "patterns" ? <section className="v2-workspace__onboarding-step" aria-label="Choose a pattern"><div className="v2-workspace__onboarding-step-head"><h3>Patterns for your use case</h3><p>Open one on the canvas to adapt its behavior.</p></div><div className="v2-workspace__onboarding-patterns">{recommended.slice(0, 4).map((match) => <button type="button" className="v2-workspace__editorial-specimen" key={match.pattern.id} data-selected={selectedPatternId === match.pattern.id} aria-pressed={selectedPatternId === match.pattern.id} onClick={() => loadPattern(match.pattern.id, "matches")}><span className="v2-workspace__editorial-specimen-copy"><small>{match.differences.length ? "RELATED PATTERN" : "MATCHED PATTERN"}</small><strong>{match.pattern.name}</strong><span>{CHANNEL_LABEL[match.pattern.channels[0]]}</span></span><PatternCrop pattern={match.pattern} /></button>)}</div></section> : null}
          </div> : null}
          {stage === "catalog" ? <div className="v2-workspace__catalog"><p className="v2-workspace__micro">{catalogPage * CATALOG_PAGE_SIZE + 1}–{Math.min((catalogPage + 1) * CATALOG_PAGE_SIZE, patterns.length)} of {patterns.length}</p>{patterns.slice(catalogPage * CATALOG_PAGE_SIZE, (catalogPage + 1) * CATALOG_PAGE_SIZE).map((item) => <button type="button" className="v2-workspace__result" key={item.id} data-selected={selectedPatternId === item.id} onClick={() => loadPattern(item.id, "catalog")}><span><strong>{item.name}</strong><small>{item.summary}</small></span></button>)}<div className="v2-workspace__rail-actions"><button type="button" onClick={() => moveThrough("Loading previous patterns", "Turning the catalog page", () => setCatalogPage((page) => Math.max(0, page - 1)), 320)} disabled={catalogPage === 0} aria-label="Previous catalog page">Previous</button><button type="button" onClick={() => moveThrough("Loading more patterns", "Turning the catalog page", () => setCatalogPage((page) => Math.min(Math.ceil(patterns.length / CATALOG_PAGE_SIZE) - 1, page + 1)), 320)} disabled={(catalogPage + 1) * CATALOG_PAGE_SIZE >= patterns.length}>Next</button></div></div> : null}
          {pattern ? <div className="v2-workspace__current"><span>ON CANVAS</span><strong>{pattern.name}</strong><button type="button" onClick={openCanvas}>View canvas</button></div> : null}
        </aside>
        <section className="v2-workspace__canvas" ref={canvasRef} aria-label="Pattern canvas">
          {pattern && workspace ? <>
            <div className="v2-workspace__canvas-head"><div><span className="v2-workspace__eyebrow">{showOriginal || !workspace.changes.length ? "CATALOG PATTERN" : "YOUR INTERACTION"}</span><h1>{pattern.name}</h1></div><div className="v2-workspace__canvas-actions"><button type="button" onClick={undo} disabled={!workspace.history.length}>Undo</button><button type="button" onClick={revertToOriginal} disabled={!workspace.changes.length}>Revert to original</button></div></div>
            {workspace.changes.length ? <div className="v2-workspace__canvas-view-toggle" role="tablist" aria-label="Canvas version"><button type="button" role="tab" aria-selected={!showOriginal} onClick={() => { if (showOriginal) moveThrough("Loading your pattern UI", "Highlighting differences from the original", () => setShowOriginal(false), 390); }}>Your UI</button><button type="button" role="tab" aria-selected={showOriginal} onClick={() => { if (!showOriginal) moveThrough("Loading the original pattern", "Opening the catalog reference", () => setShowOriginal(true), 390); }}>Original pattern</button><span>{workspace.changes.length} {workspace.changes.length === 1 ? "change" : "changes"}</span></div> : null}
            {showOriginal || !workspace.changes.length ? <div className="v2-workspace__catalog-preview">
              <div className="v2-workspace__reference-head"><span>ORIGINAL PATTERN UI</span><span>{workspace.changes.length ? "Catalog reference" : "Describe how this should work in your UI"}</span></div>
              <Suspense fallback={<p className="v2-workspace__micro">Loading pattern view…</p>}><ChannelPreview key={pattern.id} pattern={pattern} compact /></Suspense>
            </div> : <StudioGeneratedPreview key={`${pattern.id}:${workspace.changes.length}:${workspace.draft.channel}`} pattern={pattern} draft={workspace.draft} behaviorNotes={workspace.behaviorNotes} />}
            <div className="v2-workspace__canvas-foot"><Link href={`/v2/patterns/${pattern.id}`}>View catalog source</Link><span aria-live="polite">{feedback}</span></div>
          </> : null}
        </section>
        <aside className="v2-workspace__conversation" aria-label="Studio conversation"><div className="v2-workspace__panel-head"><div><span className="v2-workspace__eyebrow">CONVERSATION</span><h2>{pattern ? "Adapt this pattern" : "Begin with a pattern"}</h2></div></div>{!pattern || !workspace ? <div className="v2-workspace__chat-empty"><strong>Start with a pattern</strong><p>Choose a moment or open the catalog. Then describe how it should work in your UI.</p></div> : <><div className="v2-workspace__thread" ref={threadRef} aria-live="polite">{workspace.thread.map((message) => message.reasoning ? <div key={message.id} className="v2-workspace__message v2-workspace__message--reasoning"><ReasoningCard data={message.reasoning} onOpenCanvas={() => { setShowOriginal(true); openCanvas(); }} /></div> : <div key={message.id} className="v2-workspace__message" data-role={message.role}>{message.role === "assistant" ? <span className="v2-workspace__assistant-avatar">H</span> : null}{message.canvasUpdate ? <div className="v2-workspace__updated-reply"><p>{message.text}</p><button type="button" onClick={() => { setShowOriginal(false); openCanvas(); }}>View updated UI</button></div> : <p>{message.text}</p>}</div>)}</div>{workspace.changes.length ? <div className="v2-workspace__chat-actions"><span>{workspace.changes.length} {workspace.changes.length === 1 ? "change" : "changes"} in your UI</span><button type="button" onClick={undo}>Undo</button><button type="button" onClick={revertToOriginal}>Revert to original</button></div> : null}<div className="v2-workspace__suggestions"><button type="button" onClick={() => setPrompt("Only surface this after the user asks why")}>Change when</button><button type="button" onClick={() => setPrompt("The agent should explain its evidence before recommending an action")}>Change behavior</button><button type="button" onClick={() => setPrompt("Let the operator defer the decision")}>Change response</button></div><form className="v2-workspace__composer" onSubmit={sendMessage}><label htmlFor="v2-studio-prompt" className="sr-only">Describe a behavior change</label><textarea id="v2-studio-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe how your agent should behave in your UI…" rows={2} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><button type="submit" disabled={!prompt.trim()}>Send</button></form><p className="v2-workspace__chat-note">Your changes appear on the canvas. Compare them with the original pattern at any time.</p></>}</aside>
        {transition?.target === "canvas" && mobileView === "conversation" ? <div className="v2-workspace__chat-activity" aria-hidden="true"><span>{transition.title}</span><i /></div> : null}
        {enteringWorkspace ? <><StudioPanelSkeleton title="Preparing the canvas" target="canvas" /><StudioPanelSkeleton title="Preparing the conversation" target="conversation" /></> : transition && pattern ? <StudioPanelSkeleton title={transition.title} target={transition.target} /> : null}
      </div>
    </div>
  );
}

function MomentDiagram({ patternId }: { patternId: string }) {
  return <span className="v2-workspace__moment-diagram" data-kind={patternId} aria-hidden="true">
    <i className="v2-workspace__diagram-agent" />
    {patternId === "convergence-point" ? <i className="v2-workspace__diagram-agent v2-workspace__diagram-agent--second" /> : null}
    <i className="v2-workspace__diagram-wire" />
    {patternId === "pre-action-handshake" ? <i className="v2-workspace__diagram-pause" /> : null}
    {patternId === "memory-commitment-review" ? <i className="v2-workspace__diagram-revision" /> : null}
    {patternId === "inline-rationale" ? <i className="v2-workspace__diagram-surface" /> : null}
    <i className="v2-workspace__diagram-wire" />
    <i className="v2-workspace__diagram-person" />
  </span>;
}

function PatternCrop({ pattern }: { pattern: Pattern }) {
  return <span className="v2-workspace__pattern-crop" data-channel={pattern.channels[0]} aria-hidden="true"><i className="v2-workspace__pattern-crop-title" /><i className="v2-workspace__pattern-crop-line" /><i className="v2-workspace__pattern-crop-line v2-workspace__pattern-crop-line--short" /><span><i /><i /></span></span>;
}

function OnboardingSkeleton({ title, kind }: { title: string; kind: "moves" | "patterns" }) {
  return <section className="v2-workspace__onboarding-step v2-workspace__onboarding-step--pending" role="status" aria-label={title}>
    <div className="v2-workspace__onboarding-step-head"><h3>{kind === "moves" ? "What should your agent do then?" : "Patterns for your use case"}</h3>{kind === "patterns" ? <p>Open one on the canvas to adapt its behavior.</p> : null}</div>
    <div className="v2-workspace__onboarding-bones" data-kind={kind} aria-hidden="true"><i /><i /><i /></div>
  </section>;
}

function StudioPanelSkeleton({ title, target }: { title: string; target: MobileView }) {
  return <div className="v2-workspace__panel-skeleton" data-target={target} role="status" aria-label={title}>
    <div className="v2-workspace__panel-skeleton-head"><span>{title}</span><i aria-hidden="true" /></div>
    <div className="v2-workspace__panel-skeleton-body" aria-hidden="true">
      <i className="v2-workspace__bone v2-workspace__bone--eyebrow" />
      <i className="v2-workspace__bone v2-workspace__bone--heading" />
      <i className="v2-workspace__bone v2-workspace__bone--subhead" />
      {target === "canvas" ? <div className="v2-workspace__panel-skeleton-stage"><i className="v2-workspace__bone v2-workspace__bone--wide" /><i className="v2-workspace__bone v2-workspace__bone--mid" /><div><i /><i /><i /></div></div> : <div className="v2-workspace__panel-skeleton-rows"><i /><i /><i /></div>}
    </div>
  </div>;
}

function ReasoningCard({ data, onOpenCanvas }: { data: ReasoningCardData; onOpenCanvas: () => void }) {
  const fitLabel = data.fit === "direct" ? "Direct fit" : data.fit === "related" ? "Related fit" : "Catalog pattern";
  return <article className="v2-workspace__reasoning" data-fit={data.fit} aria-label={`${data.title} reasoning`}>
    <div className="v2-workspace__reasoning-head"><span>WHY THIS PATTERN</span><strong>{fitLabel}</strong></div>
    <h3>{data.title}</h3>
    <p className="v2-workspace__reasoning-context">{data.context}</p>
    <div className="v2-workspace__reasoning-highlight"><span>WHY IT MATTERS</span><p>{data.highlight}</p></div>
    <dl className="v2-workspace__reasoning-facts">{data.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
    {data.notice ? <p className="v2-workspace__reasoning-notice">{data.notice}</p> : null}
    <div className="v2-workspace__reasoning-details">{data.details.map((detail) => <details key={detail.title}><summary>{detail.title}</summary><div>{detail.body ? <p>{detail.body}</p> : null}{detail.points?.length ? <ul>{detail.points.map((point) => <li key={point}>{point}</li>)}</ul> : null}</div></details>)}</div>
    <button type="button" className="v2-workspace__reasoning-next" onClick={onOpenCanvas}><span>LIVE CANVAS</span><strong>Open catalog preview</strong></button>
  </article>;
}

function sentenceCase(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1); }
