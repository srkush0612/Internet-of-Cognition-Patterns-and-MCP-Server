"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import { ChannelPreview } from "@/components/v2/ChannelPreview";
import { getV2Pattern, patterns } from "@/lib/v2/catalog";
import {
  AUDIENCE_LABEL, CHANNEL_LABEL,
} from "@/lib/v2/levels";
import { MODE_LABEL, MODE_ORDER, MODE_PLAIN, getMode } from "@/lib/v2/modes";
import { EMPTY_SPEC, reconcile, specFromPattern, type SpecDraft } from "@/lib/v2/spec";
import { rankStudioPatterns, type StudioMatch } from "@/lib/v2/studio-matching";
import { situationFor } from "@/lib/v2/situations";
import { answerStudioPatternQuestion } from "@/lib/v2/studio-pattern-qa";
import { recommendStudioPatterns, type StudioRecommendation, type StudioRecommendationResponse } from "@/lib/v2/studio-recommendations";
import { studioMarkdown, studioSvg, type StudioExportState } from "@/lib/v2/studio-export";
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
type Message = { id: number; role: "user" | "assistant"; text: string; reasoning?: ReasoningCardData; recommendations?: StudioRecommendationResponse };
type WorkspaceDraft = { thread: Message[]; reasoning: ReasoningCardData };
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
const BEHAVIOR_EXAMPLES = [
  { patternId: "pre-action-handshake", label: "Before the agent acts", prompt: "Our agent needs a person's approval before it restarts a service. Which patterns fit?" },
  { patternId: "convergence-point", label: "Agents disagree", prompt: "Two agents disagree about an answer and need to show their evidence. Which patterns fit?" },
  { patternId: "memory-commitment-review", label: "A belief changes", prompt: "Our agent changes a belief and a person should review it before it is saved. Which patterns fit?" },
];

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
        { title: "About this preview", body: "The canvas shows the catalog example. Ask about the pattern in the conversation to clarify its behavior." },
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
    : "The canvas shows the original catalog example. Ask about it in the conversation to understand how it works.";

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
        ? `Related fit: the catalog begins at “${pattern.triggers[0] ?? "a different moment"}.” Ask how that trigger relates to your scenario.`
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
          ...(pattern.id !== moment.patternId ? ["The authored trigger differs from your selected moment."] : []),
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

function initialWorkspace(reasoning: ReasoningCardData): WorkspaceDraft {
  return {
    reasoning,
    thread: [{ id: 0, role: "assistant", text: reasoning.title, reasoning }],
  };
}

function downloadText(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function StudioWorkspace({
  walkthroughStep,
  onWalkthroughStep,
  onWalkthroughExport,
  className,
}: {
  walkthroughStep?: number;
  onWalkthroughStep?: (step: number) => void;
  onWalkthroughExport?: (kind: "svg" | "markdown") => void;
  className?: string;
} = {}) {
  const [stage, setStage] = useState<DiscoverStage>("situations");
  const [catalogReturnStage, setCatalogReturnStage] = useState<Exclude<DiscoverStage, "catalog">>("situations");
  const [mobileView, setMobileView] = useState<MobileView>("discover");
  const [situationId, setSituationId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [discoveryDraft, setDiscoveryDraft] = useState<SpecDraft>(EMPTY_SPEC);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [workspaces, setWorkspaces] = useState<Record<string, WorkspaceDraft>>({});
  const [catalogPage, setCatalogPage] = useState(0);
  const [allMoves, setAllMoves] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [exportFeedback, setExportFeedback] = useState("");
  const [transition, setTransition] = useState<StudioTransition | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextMessageId = useRef(0);
  const threadRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLElement>(null);
  const exportMenuRef = useRef<HTMLDetailsElement>(null);
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

  useEffect(() => {
    if (walkthroughStep === undefined) return;
    const convergence = getV2Pattern("convergence-point");
    if (walkthroughStep === 0 || !convergence) return;
    if (walkthroughStep === 1) {
      setSituationId("convergence-point");
      setSelectedMode(null);
      setSelectedPatternId(null);
      setDiscoveryDraft(catalogDraft(convergence));
      setStage("moves");
      setLibraryOpen(true);
      setMobileView("discover");
    } else if (walkthroughStep === 2) {
      setSituationId("convergence-point");
      setSelectedMode("resolve");
      setDiscoveryDraft(reconcile({ ...catalogDraft(convergence), mode: "resolve" }, "mode"));
      setSelectedPatternId(null);
      setStage("matches");
      setLibraryOpen(true);
      setMobileView("discover");
    } else if (walkthroughStep >= 3) {
      const reasoning = selectionReasoning(convergence);
      setWorkspaces((current) => current[convergence.id] ? current : { ...current, [convergence.id]: initialWorkspace(reasoning) });
      setSituationId("convergence-point");
      setSelectedMode("resolve");
      setDiscoveryDraft(reconcile({ ...catalogDraft(convergence), mode: "resolve" }, "mode"));
      setSelectedPatternId(convergence.id);
      setStage("matches");
      setLibraryOpen(false);
      setMobileView("canvas");
    }
  }, [walkthroughStep]);

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
      setCatalogPage(0);
      setAllMoves(false);
      setPrompt("");
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
      onWalkthroughStep?.(1);
    }, 440, "discover", "moves", id);
  }

  function chooseMode(mode: Mode) {
    moveThrough("Matching catalog patterns", MODE_LABEL[mode], () => {
      setSelectedMode(mode);
      setSelectedPatternId(null);
      setDiscoveryDraft((current) => reconcile({ ...current, mode }, "mode"));
      setStage("matches");
      onWalkthroughStep?.(2);
    }, 500, "discover", "patterns", mode);
  }

  function loadPattern(id: string, source: "matches" | "catalog", recommendation?: { behavior: string; item: StudioRecommendation }) {
    const selected = getV2Pattern(id);
    if (!selected) return;
    const moment = SITUATIONS.find((item) => item.patternId === situationId);
    const match = recommended.find((item) => item.pattern.id === id);
    const choice = source === "matches" && moment && discoveryDraft.mode && match
      ? { moment, mode: discoveryDraft.mode, match }
      : undefined;
    const baseReasoning = selectionReasoning(selected, choice);
    const reasoning: ReasoningCardData = recommendation ? {
      ...baseReasoning,
      key: `recommendation:${id}:${recommendation.behavior}`,
      fit: "related",
      context: `Suggested for: ${recommendation.behavior}`,
      highlight: recommendation.item.reason,
      details: [
        { title: "Why this was suggested", body: `${recommendation.item.match}. ${recommendation.item.reason}` },
        ...baseReasoning.details,
      ],
    } : baseReasoning;
    const explanationId = ++nextMessageId.current;
    moveThrough("Opening the pattern", selected.name, () => {
      setWorkspaces((current) => {
        const existing = current[id];
        if (!existing) return { ...current, [id]: initialWorkspace(reasoning) };
        if (existing.reasoning.key === reasoning.key) return current;
        return { ...current, [id]: { ...existing, reasoning, thread: [...existing.thread, { id: explanationId, role: "assistant", text: reasoning.title, reasoning }] } };
      });
      setSelectedPatternId(id);
      setLibraryOpen(false);
      setMobileView("canvas");
      onWalkthroughStep?.(3);
    }, 560, "canvas", "workspace", id);
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(prompt);
  }

  function submitQuestion(value: string) {
    if (!pattern || !workspace || !selectedPatternId || !value.trim()) return;
    const question = value.trim();
    const recommendations = recommendStudioPatterns(pattern, question, patterns);
    const answer = recommendations ? "" : answerStudioPatternQuestion(pattern, question, workspace.reasoning);
    const userId = ++nextMessageId.current;
    const assistantId = ++nextMessageId.current;
    const id = selectedPatternId;
    setWorkspaces((current) => {
      const existing = current[id];
      if (!existing) return current;
      return { ...current, [id]: { ...existing, thread: [...existing.thread, { id: userId, role: "user", text: question }, { id: assistantId, role: "assistant", text: answer, recommendations: recommendations ?? undefined }] } };
    });
    setPrompt("");
  }

  function exportState(selected: Pattern): StudioExportState {
    return { draft: specFromPattern(selected), behaviorNotes: [], changes: [] };
  }

  async function copyPatternMarkdown() {
    if (!pattern) return;
    try {
      await navigator.clipboard.writeText(studioMarkdown(pattern, exportState(pattern)));
      setExportFeedback("Pattern Markdown copied");
    } catch {
      setExportFeedback("Could not copy. Use Download Markdown instead.");
    }
    if (exportMenuRef.current) exportMenuRef.current.open = false;
    onWalkthroughStep?.(3);
  }

  function downloadPatternMarkdown() {
    if (!pattern) return;
    downloadText(`${pattern.id}.md`, studioMarkdown(pattern, exportState(pattern)), "text/markdown;charset=utf-8");
    setExportFeedback("Pattern Markdown downloaded");
    if (exportMenuRef.current) exportMenuRef.current.open = false;
    onWalkthroughStep?.(3);
    onWalkthroughExport?.("markdown");
  }

  function downloadPatternSvg() {
    if (!pattern) return;
    downloadText(`${pattern.id}-diagram.svg`, studioSvg(pattern, exportState(pattern)), "image/svg+xml;charset=utf-8");
    setExportFeedback("Figma-ready SVG downloaded");
    if (exportMenuRef.current) exportMenuRef.current.open = false;
    onWalkthroughStep?.(3);
    onWalkthroughExport?.("svg");
  }

  return (
    <div className={"v2-workspace" + (className ? " " + className : "")} aria-busy={Boolean(transition)} data-mobile-view={visibleMobileView} data-library-open={enteringWorkspace ? false : libraryOpen} data-has-pattern={workspaceVisible} data-studio-surface={DEFAULT_STUDIO_DESIGN.surface} data-studio-reveal={DEFAULT_STUDIO_DESIGN.reveal} data-studio-density={DEFAULT_STUDIO_DESIGN.density} style={designStyles}>
      <div className="v2-workspace__top">
        <nav className="v2-workspace__location" aria-label="Studio navigation"><button type="button" onClick={returnToLanding}>Studio</button><span aria-hidden="true">/</span><strong>{pattern ? pattern.name : enteringWorkspace ? "Opening pattern" : "Your use case"}</strong></nav>
        <div className="v2-workspace__top-right">
          <Link href="/v2/agora-preview" className="v2-workspace__library-trigger">Preview prototype</Link>
          {pattern ? <button type="button" className="v2-workspace__library-trigger" aria-expanded={libraryOpen} aria-controls="v2-pattern-library" onClick={toggleLibrary}>{libraryOpen ? "Close library" : "Browse patterns"}</button> : null}
          {pattern && workspace ? <details className="v2-workspace__exports" ref={exportMenuRef}><summary data-walkthrough-export-trigger>Export</summary><div><button type="button" data-walkthrough-export="markdown" onClick={downloadPatternMarkdown}>Download pattern Markdown</button><button type="button" data-walkthrough-export="svg" onClick={downloadPatternSvg}>Download diagram SVG for Figma</button><button type="button" onClick={copyPatternMarkdown}>Copy pattern Markdown</button></div></details> : null}
        </div>
        <span className="sr-only" role="status" aria-live="polite">{exportFeedback}</span>
        {transition ? <div className="v2-workspace__activity" role="status" aria-live="polite"><span>{transition.title}</span><i aria-hidden="true" /></div> : null}
      </div>
      <div className="v2-workspace__mobile-tabs" role="tablist" aria-label="Studio panels">
        {(["discover", "conversation", "canvas"] as MobileView[]).map((view) => <button type="button" key={view} role="tab" aria-selected={visibleMobileView === view} onClick={() => { if (view !== mobileView) moveThrough(`Opening ${view === "discover" ? "patterns" : view}`, "Moving through your Studio workspace", () => { setMobileView(view); setLibraryOpen(view === "discover"); }, 320); }}>{view === "discover" ? "Patterns" : view === "canvas" ? "Canvas" : "Conversation"}</button>)}
      </div>
      <div className="v2-workspace__grid" data-lenis-prevent>
        <button type="button" className="v2-workspace__library-backdrop" aria-label="Close pattern library" onClick={closeLibrary} tabIndex={libraryOpen && Boolean(pattern) ? 0 : -1} />
        <aside id="v2-pattern-library" className="v2-workspace__discover" aria-label="Discover catalog patterns" aria-hidden={workspaceVisible && (enteringWorkspace || (!libraryOpen && visibleMobileView !== "discover"))}>
          <div className="v2-workspace__panel-head v2-workspace__discover-head"><div><div className="v2-workspace__discover-head-top">{stage === "catalog" ? <button type="button" className="v2-workspace__step-back" onClick={backInLibrary}>← Your use case</button> : <span className="v2-workspace__eyebrow">01 / YOUR USE CASE</span>}{stage !== "catalog" ? <button type="button" className="v2-workspace__catalog-link" onClick={openCatalog}>All patterns</button> : null}</div><h2>{stage === "catalog" ? "All patterns" : "Describe your agent’s situation"}</h2><p className="v2-workspace__moment-explainer">{stage === "catalog" ? "Browse the catalog, then open a pattern to explore it on the canvas." : "Choose the moment and move that describe your use case. We’ll suggest patterns you can explore and ask about."}</p></div></div>
            {stage !== "catalog" ? <div className="v2-workspace__onboarding" aria-label="Choose a moment, move, and pattern">
            <div className="v2-workspace__onboarding-choices" aria-label="Choose a moment">{SITUATIONS.map((item, index) => <button type="button" className="v2-workspace__onboarding-chip v2-workspace__onboarding-chip--moment" key={item.patternId} data-moment={item.patternId} data-selected={situationId === item.patternId || (transition?.placement === "moves" && transition.choiceId === item.patternId)} aria-pressed={situationId === item.patternId || (transition?.placement === "moves" && transition.choiceId === item.patternId)} onClick={() => chooseSituation(item.patternId)}><span className="v2-workspace__onboarding-index">0{index + 1}</span><strong>{item.label}</strong><MomentDiagram patternId={item.patternId} /></button>)}</div>
            {transition?.placement === "moves" ? <OnboardingSkeleton title={transition.title} kind="moves" /> : null}
            {stage !== "situations" && situationId && transition?.placement !== "moves" ? <section className="v2-workspace__onboarding-step v2-workspace__onboarding-step--moves" data-all-moves={allMoves} aria-label="Choose an agent move"><div className="v2-workspace__onboarding-step-head"><h3>What should your agent do then?</h3></div><div className="v2-workspace__onboarding-choices">{moves.map((mode) => <button type="button" className="v2-workspace__onboarding-chip" key={mode} data-mode={mode} data-selected={selectedMode === mode || (transition?.placement === "patterns" && transition.choiceId === mode)} aria-pressed={selectedMode === mode || (transition?.placement === "patterns" && transition.choiceId === mode)} onClick={() => chooseMode(mode)}>{sentenceCase(MODE_PLAIN[mode])}</button>)}</div><button type="button" className="v2-workspace__onboarding-more" onClick={() => setAllMoves((value) => !value)}>{allMoves ? "Show suggested moves" : "Show all moves"}</button></section> : null}
            {transition?.placement === "patterns" ? <OnboardingSkeleton title={transition.title} kind="patterns" /> : null}
            {stage === "matches" && selectedMode && transition?.placement !== "patterns" ? <section className="v2-workspace__onboarding-step" aria-label="Choose a pattern"><div className="v2-workspace__onboarding-step-head"><h3>Patterns for your use case</h3><p>Open one to explore its UI and ask how it works.</p></div><div className="v2-workspace__onboarding-patterns">{recommended.slice(0, 4).map((match) => <button type="button" className="v2-workspace__editorial-specimen" key={match.pattern.id} data-pattern={match.pattern.id} data-selected={selectedPatternId === match.pattern.id} aria-pressed={selectedPatternId === match.pattern.id} onClick={() => loadPattern(match.pattern.id, "matches")}><span className="v2-workspace__editorial-specimen-copy"><small>{match.differences.length ? "RELATED PATTERN" : "MATCHED PATTERN"}</small><strong>{match.pattern.name}</strong><span>{CHANNEL_LABEL[match.pattern.channels[0]]}</span></span><PatternCrop pattern={match.pattern} /></button>)}</div></section> : null}
          </div> : null}
          {stage === "catalog" ? <div className="v2-workspace__catalog"><p className="v2-workspace__micro">{catalogPage * CATALOG_PAGE_SIZE + 1}–{Math.min((catalogPage + 1) * CATALOG_PAGE_SIZE, patterns.length)} of {patterns.length}</p>{patterns.slice(catalogPage * CATALOG_PAGE_SIZE, (catalogPage + 1) * CATALOG_PAGE_SIZE).map((item) => <button type="button" className="v2-workspace__result" key={item.id} data-selected={selectedPatternId === item.id} onClick={() => loadPattern(item.id, "catalog")}><span><strong>{item.name}</strong><small>{item.summary}</small></span></button>)}<div className="v2-workspace__rail-actions"><button type="button" onClick={() => moveThrough("Loading previous patterns", "Turning the catalog page", () => setCatalogPage((page) => Math.max(0, page - 1)), 320)} disabled={catalogPage === 0} aria-label="Previous catalog page">Previous</button><button type="button" onClick={() => moveThrough("Loading more patterns", "Turning the catalog page", () => setCatalogPage((page) => Math.min(Math.ceil(patterns.length / CATALOG_PAGE_SIZE) - 1, page + 1)), 320)} disabled={(catalogPage + 1) * CATALOG_PAGE_SIZE >= patterns.length}>Next</button></div></div> : null}
          {pattern ? <div className="v2-workspace__current"><span>ON CANVAS</span><strong>{pattern.name}</strong><button type="button" onClick={openCanvas}>View canvas</button></div> : null}
        </aside>
        <section className="v2-workspace__canvas" ref={canvasRef} aria-label="Pattern canvas">
          {pattern && workspace ? <>
            <div className="v2-workspace__canvas-head"><div><span className="v2-workspace__eyebrow">CATALOG PATTERN</span><h1>{pattern.name}</h1></div></div>
            <div className="v2-workspace__catalog-preview">
              <div className="v2-workspace__reference-head"><span>PATTERN UI</span><span>Explore the example and ask questions in the conversation</span></div>
              <Suspense fallback={<p className="v2-workspace__micro">Loading pattern view…</p>}><ChannelPreview key={pattern.id} pattern={pattern} compact /></Suspense>
            </div>
            <div className="v2-workspace__canvas-foot"><Link href={`/v2/patterns/${pattern.id}`}>View catalog source</Link></div>
          </> : null}
        </section>
        <aside className="v2-workspace__conversation" aria-label="Pattern conversation">
          {!pattern || !workspace ? <div className="v2-workspace__chat-empty"><strong>Start with a pattern</strong><p>Choose a moment or open the catalog. Then ask how it works or describe another behavior to explore.</p></div> : <>
            <div className="v2-workspace__thread" ref={threadRef} aria-live="polite">
              {workspace.thread.map((message) => message.reasoning
                ? <div key={message.id} className="v2-workspace__message v2-workspace__message--reasoning"><ReasoningCard data={message.reasoning} onOpenCanvas={openCanvas} /></div>
                : message.recommendations
                  ? <div key={message.id} className="v2-workspace__message v2-workspace__message--recommendations"><span className="v2-workspace__assistant-avatar">H</span><RecommendationCard data={message.recommendations} onOpenPattern={(item) => loadPattern(item.patternId, "catalog", { behavior: message.recommendations!.behavior, item })} /></div>
                : <div key={message.id} className="v2-workspace__message" data-role={message.role}>{message.role === "assistant" ? <span className="v2-workspace__assistant-avatar">H</span> : null}<p>{message.text}</p></div>)}
            </div>
            <div className="v2-workspace__suggestions" aria-label="Suggested questions">
              {workspace.reasoning.fit === "catalog"
                ? <button type="button" onClick={() => setPrompt("What does this pattern solve?")}>What does it solve?</button>
                : <button type="button" onClick={() => setPrompt("Why does this pattern fit my situation?")}>Why this pattern?</button>}
              <button type="button" onClick={() => setPrompt("When should it appear?")}>When does it appear?</button>
              <button type="button" onClick={() => setPrompt("What can the person do in response?")}>What can they do?</button>
            </div>
            <div className="v2-workspace__behavior-examples" aria-label="Example behaviors for pattern suggestions"><span>TRY A BEHAVIOR</span><div>{BEHAVIOR_EXAMPLES.filter((example) => example.patternId !== pattern.id).slice(0, 2).map((example) => <button key={example.patternId} type="button" onClick={() => submitQuestion(example.prompt)}>{example.label}</button>)}<button type="button" onClick={() => submitQuestion("Can you recommend more patterns related to this behavior?")}>More like this</button></div></div>
            <form className="v2-workspace__composer" onSubmit={sendMessage}><label htmlFor="v2-studio-prompt" className="sr-only">Ask about this pattern or describe an agent behavior</label><textarea id="v2-studio-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask or describe an agent behavior…" rows={2} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><button type="submit" disabled={!prompt.trim()}>Ask</button></form>
            <p className="v2-workspace__chat-note">Suggestions come from catalog behavior. Describe the moment and the response you need for a closer match.</p>
          </>}
        </aside>
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
    <div className="v2-workspace__onboarding-step-head"><h3>{kind === "moves" ? "What should your agent do then?" : "Patterns for your use case"}</h3>{kind === "patterns" ? <p>Open one to explore its UI and ask how it works.</p> : null}</div>
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

function RecommendationCard({ data, onOpenPattern }: { data: StudioRecommendationResponse; onOpenPattern: (item: StudioRecommendation) => void }) {
  return <section className="v2-workspace__recommendations" aria-label="Suggested catalog patterns">
    <span className="v2-workspace__recommendations-label">PATTERNS TO EXPLORE</span>
    <p>{data.intro}</p>
    <div>{data.items.map((item) => {
      const pattern = getV2Pattern(item.patternId);
      if (!pattern) return null;
      return <button key={item.patternId} type="button" onClick={() => onOpenPattern(item)} aria-label={`Open ${pattern.name} on the canvas`}>
        <span>{item.match}</span>
        <strong>{pattern.name}</strong>
        <small>{item.reason}</small>
        <em>Open on canvas <span aria-hidden="true">→</span></em>
      </button>;
    })}</div>
  </section>;
}

function sentenceCase(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1); }
