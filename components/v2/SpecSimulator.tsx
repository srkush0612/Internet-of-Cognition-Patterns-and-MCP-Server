"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { patterns, getV2Pattern } from "@/lib/v2/catalog";
import { PATTERN_STANDALONE } from "@/components/patterns/pattern-registry";
import { LEVEL_LABEL } from "@/lib/v2/levels";
import { MODE_LABEL, MODE_ORDER, MODE_PLAIN, getMode } from "@/lib/v2/modes";
import { specFromPattern, type SpecDraft } from "@/lib/v2/spec";
import {
  buildRun,
  isShaped,
  markdownExport,
  mcpExport,
  reachableLevels,
  type RunActor,
} from "@/lib/v2/simulator";
import { answerAboutPattern } from "@/lib/v2/studio-chat";
import {
  SITUATIONS,
  situationFor,
  type Situation,
} from "@/lib/v2/situations";
import type { Level, Mode, Pattern } from "@/lib/v2/types";

const ACTOR_LABEL: Record<RunActor, string> = {
  agent: "Agent",
  "agent-a": "Agent A",
  "agent-b": "Agent B",
  person: "You",
  system: "",
};

type ChatMessage = { id: string; from: "user" | "studio"; text: string };

export function SpecSimulator() {
  // A three-step flow, each its own full screen: ask → results → simulate.
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<Mode | "any">("any");
  const [level, setLevel] = useState<Level | "any">("any");
  const [showResults, setShowResults] = useState(false);
  const [patternId, setPatternId] = useState<string | null>(null);

  const pattern = patternId ? getV2Pattern(patternId) : null;

  if (pattern) {
    return (
      <Simulator
        key={pattern.id}
        pattern={pattern}
        useCase={prompt}
        onBack={() => setPatternId(null)}
      />
    );
  }

  if (showResults) {
    return (
      <Results
        prompt={prompt}
        mode={mode}
        level={level}
        onRefine={() => setShowResults(false)}
        onPick={(id) => setPatternId(id)}
      />
    );
  }

  return (
    <Ask
      prompt={prompt}
      mode={mode}
      level={level}
      setPrompt={setPrompt}
      setMode={setMode}
      setLevel={setLevel}
      onFind={() => setShowResults(true)}
    />
  );
}

/* ------------------------------------------------- step 1: ask ------------- */

/** Keyword score: how many meaningful words of the prompt a pattern mentions. */
function scoreMatch(pattern: Pattern, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const hay = [
    pattern.name,
    pattern.summary,
    pattern.whatItSolves ?? "",
    pattern.spec,
    ...pattern.triggers,
  ]
    .join(" ")
    .toLowerCase();
  return tokens.reduce((n, t) => (hay.includes(t) ? n + 1 : n), 0);
}

const STOPWORDS = new Set([
  "the", "and", "for", "that", "with", "when", "what", "they", "this", "from",
  "into", "your", "agent", "agents", "need", "needs", "want", "wants", "have",
]);

/** One-click starters so the screen isn't a cold empty box. */
const STARTER_PROMPTS = [
  "Agents disagree on an incident's cause",
  "The agent is about to do something irreversible",
  "A belief changed mid-session",
];

function Ask({
  prompt,
  mode,
  level,
  setPrompt,
  setMode,
  setLevel,
  onFind,
}: {
  prompt: string;
  mode: Mode | "any";
  level: Level | "any";
  setPrompt: (v: string) => void;
  setMode: (v: Mode | "any") => void;
  setLevel: (v: Level | "any") => void;
  onFind: () => void;
}) {
  const ready = patterns.filter((p) => p.contentReady);
  const modesInUse = MODE_ORDER.filter((m) =>
    ready.some((p) => p.mode.primary === m),
  );
  const levelsInUse: Level[] = (["L1", "L2", "L3", "L4"] as Level[]).filter((l) =>
    ready.some((p) => reachableLevels(p).includes(l)),
  );

  const canFind = prompt.trim().length > 0 || mode !== "any" || level !== "any";

  return (
    <div className="v2-studio-ask">
      <div className="v2-studio-ask__inner">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">
          Shape an agent interaction
        </h1>
        <p className="v2-lede mt-4 max-w-[58ch]">
          Explore what starts an interaction, how the agent acts, and what the
          receiver can do next.
        </p>

        <form
          className="mt-12"
          onSubmit={(e) => {
            e.preventDefault();
            if (canFind) onFind();
          }}
        >
          <h2 className="text-2xl font-semibold text-ink">Find a pattern for your system</h2>
          <p className="mt-2 text-sm text-muted">
            Describe what you&rsquo;re handing to agents. Studio finds situations
            it could run into, then you can watch one play out.
          </p>
          <p className="v2-techlabel mt-6">Describe the system</p>
          <textarea
            id="studio-prompt"
            className="v2-select mt-2 w-full"
            rows={2}
            placeholder="A triage agent and a deploy agent disagree on the cause of an incident, and on-call needs to see how they settled it."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (canFind) onFind();
              }
            }}
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="v2-bp-field">
              <p className="v2-techlabel">Action</p>
              <p className="mt-1 text-sm text-muted">
                What does the agent need to do?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <FilterChip on={mode === "any"} onClick={() => setMode("any")}>
                  Anything
                </FilterChip>
                {modesInUse.map((m) => (
                  <FilterChip key={m} on={mode === m} onClick={() => setMode(m)}>
                    {cap(MODE_PLAIN[m])}
                  </FilterChip>
                ))}
              </div>
            </div>
            <div className="v2-bp-field">
              <p className="v2-techlabel">Participants</p>
              <p className="mt-1 text-sm text-muted">Who&rsquo;s involved?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <FilterChip on={level === "any"} onClick={() => setLevel("any")}>
                  Anyone
                </FilterChip>
                {levelsInUse.map((l) => (
                  <FilterChip
                    key={l}
                    on={level === l}
                    onClick={() => setLevel(l)}
                  >
                    {LEVEL_LABEL[l]}
                  </FilterChip>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button type="submit" className="osh-cta-solid" disabled={!canFind}>
              → Find patterns
            </button>
            <span className="v2-techlabel--faint v2-techlabel">
              or press Enter
            </span>
          </div>
        </form>

        {/* Examples, their own block. */}
        <p className="v2-techlabel mt-12">Or start from an example</p>
        <div className="v2-studio-examples mt-4">
          {STARTER_PROMPTS.map((s) => (
            <button
              key={s}
              type="button"
              className="v2-studio-examplecard"
              onClick={() => {
                // An example is a complete use case, clear any active filters
                // so leftover ones don't exclude its pattern.
                setMode("any");
                setLevel("any");
                setPrompt(s);
                onFind();
              }}
            >
              {s}
              <span aria-hidden="true" className="v2-studio-examplecard__go">
                ↗
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------- step 2: results --------- */

function Results({
  prompt,
  mode,
  level,
  onRefine,
  onPick,
}: {
  prompt: string;
  mode: Mode | "any";
  level: Level | "any";
  onRefine: () => void;
  onPick: (id: string) => void;
}) {
  // Results are SITUATIONS, each mapped to the one pattern that answers it,
  // the way v1's overview read. Filters and the prompt narrow the list.
  const matches = useMemo(() => {
    const tokens = prompt
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w));

    return SITUATIONS.filter((s) => {
      const pattern = getV2Pattern(s.patternId);
      if (!pattern) return false;
      if (mode !== "any" && pattern.mode.primary !== mode) return false;
      if (level !== "any" && !reachableLevels(pattern).includes(level))
        return false;
      if (tokens.length === 0) return true;
      const hay = `${s.title} ${s.example} ${s.trigger} ${pattern.name} ${pattern.whatItSolves ?? ""}`.toLowerCase();
      return tokens.some((t) => hay.includes(t));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, mode, level]);

  return (
    <div className="v2-studio-screen">
      <button type="button" className="v2-resp v2-resp--sm" onClick={onRefine}>
        ‹ Refine
      </button>
      <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">
        {matches.length > 0
          ? "Situations this could run into"
          : "No situation fits yet"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {matches.length > 0
          ? "Each one maps to the pattern that answers it. Ask the agent, or open a situation to watch it run."
          : "Nothing in the demo set matches that."}
      </p>

      {matches.length === 0 ? (
        <div className="v2-gap mt-6">
          <p className="v2-gap__head">Nothing matches that yet</p>
          <p className="text-sm leading-relaxed">
            Try different words, loosen a filter back on Refine, or treat it as
            one of the library&rsquo;s gaps.
          </p>
        </div>
      ) : (
        <div className="v2-results-stage mt-6">
          <ResultsChat situations={matches} onOpen={onPick} />

          <div className="v2-sit-rows">
            {matches.map((s) => {
              const pattern = getV2Pattern(s.patternId)!;
              return (
                <button
                  key={s.id}
                  type="button"
                  className="v2-sit-row osh-card text-left"
                  onClick={() => onPick(s.patternId)}
                >
                  <div className="v2-sit-row__head">
                    <span className="v2-sit-row__num">Situation {s.number}</span>
                    <span className="v2-sit-row__title">{s.title}</span>
                  </div>
                  <p className="v2-sit-row__example">{s.example}</p>
                  <div className="v2-sit-row__foot">
                    <span className="v2-sit-row__patternlabel">Pattern</span>
                    <span className="v2-sit-row__patternname">{pattern.name}</span>
                    <span className="v2-tag v2-tag--mode">
                      {MODE_LABEL[pattern.mode.primary]}
                    </span>
                    <span className="v2-sit-row__why">
                      Why {pattern.name}? {pattern.whatItSolves ?? pattern.summary}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** The agent on the situations screen, maps, explains, and opens. Scripted. */
function ResultsChat({
  situations,
  onOpen,
}: {
  situations: Situation[];
  onOpen: (patternId: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "hello",
      from: "studio",
      text: `I mapped ${situations.length} situation${situations.length === 1 ? "" : "s"} to the patterns that answer them. Ask me which fits, or open one on the right.`,
    },
  ]);
  const [input, setInput] = useState("");
  const nextId = useRef(0);
  const scroller = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages]);

  function reply(text: string) {
    const clean = text.trim();
    if (!clean) return;
    const words = clean.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const hit = situations.find((s) => {
      const pattern = getV2Pattern(s.patternId);
      const hay = `${s.title} ${s.example} ${s.trigger} ${pattern?.name ?? ""}`.toLowerCase();
      return words.some((w) => hay.includes(w));
    });
    const answer = hit
      ? (() => {
          const pattern = getV2Pattern(hit.patternId)!;
          return `That's Situation ${hit.number}, ${hit.title}. ${pattern.name} answers it: ${pattern.whatItSolves ?? pattern.summary} Open it on the right to watch it run.`;
        })()
      : `I have: ${situations.map((s) => s.title).join("; ")}. Tell me which, or open one on the right.`;
    setMessages((m) => [
      ...m,
      { id: `u${nextId.current++}`, from: "user", text: clean },
      { id: `s${nextId.current++}`, from: "studio", text: answer },
    ]);
    setInput("");
  }

  return (
    <section className="osh-card v2-sim-pane v2-sim-pane--chat">
      <header className="v2-sim-pane__head">
        <p className="v2-techlabel">Chat</p>
      </header>

      <div className="v2-sim-convo v2-chat" ref={scroller}>
        {messages.map((m) => (
          <div
            key={m.id}
            className="v2-sim-msg"
            data-side={m.from === "user" ? "right" : "left"}
            data-state="on"
          >
            <p className="v2-sim-msg__role">
              {m.from === "user" ? "You" : "Studio"}
            </p>
            <div className="v2-sim-msg__body">
              <p className="v2-sim-msg__label">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1 flex flex-wrap gap-1.5">
        {situations.map((s) => (
          <button
            key={s.id}
            type="button"
            className="v2-resp v2-resp--sm"
            title={s.title}
            onClick={() => onOpen(s.patternId)}
          >
            Open {s.number}
          </button>
        ))}
      </div>

      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          reply(input);
        }}
      >
        <input
          className="v2-select flex-1"
          placeholder="Ask which fits…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Ask about these situations"
        />
        <button type="submit" className="v2-resp v2-resp--sm" data-tone="primary">
          Send
        </button>
      </form>
    </section>
  );
}

function FilterChip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="v2-resp v2-resp--sm"
      data-tone={on ? "primary" : undefined}
      aria-pressed={on}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------- simulator --- */

function Simulator({
  pattern,
  useCase,
  onBack,
}: {
  pattern: Pattern;
  useCase?: string;
  onBack: () => void;
}) {
  const levels = reachableLevels(pattern);
  const [viewLevel, setViewLevel] = useState<Level>(pattern.level.primary);
  const [responses, setResponses] = useState<string[]>(
    () => specFromPattern(pattern).responses,
  );
  // Two tabs, collapsed by default; opening one closes the other.
  const [openPanel, setOpenPanel] = useState<"customise" | "messages" | null>(
    null,
  );

  const situation = situationFor(pattern.id);

  const draft: SpecDraft = useMemo(() => {
    const base = specFromPattern(pattern);
    return { ...base, level: viewLevel, responses };
  }, [pattern, viewLevel, responses]);

  const run = useMemo(
    () => buildRun(pattern, draft, patterns, situation),
    [pattern, draft, situation],
  );

  const mode = getMode(pattern.mode.primary);
  const allResponses = pattern.responses ?? mode.responses;

  function removeResponse(r: string) {
    setResponses((rs) => rs.filter((x) => x !== r));
  }
  function addResponse(r: string) {
    setResponses((rs) => (rs.includes(r) ? rs : [...rs, r]));
  }
  function restoreResponses() {
    setResponses(getMode(pattern.mode.primary).responses);
  }

  const contextSlug = LEVEL_LABEL[viewLevel].toLowerCase();

  return (
    <div className="v2-studio-screen flex flex-col gap-4">
      <div className="v2-sim-topbar">
        <button type="button" className="v2-sim-topbar__back" onClick={onBack}>
          ◂ Back
        </button>
        <span className="v2-sim-topbar__id">
          <b>Pattern</b> · {pattern.name}
        </span>
        <span className="v2-sim-topbar__ctx">context: {contextSlug}</span>
        {isShaped(pattern, draft) ? (
          <span className="v2-tag">shaped variant</span>
        ) : null}

        <div className="v2-sim-topbar__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className="v2-sim-tab"
            aria-selected={openPanel === "customise"}
            onClick={() =>
              setOpenPanel((p) => (p === "customise" ? null : "customise"))
            }
          >
            Customise
          </button>
          <button
            type="button"
            role="tab"
            className="v2-sim-tab"
            aria-selected={openPanel === "messages"}
            onClick={() =>
              setOpenPanel((p) => (p === "messages" ? null : "messages"))
            }
          >
            Agent messages
          </button>
        </div>
      </div>

      {useCase && useCase.trim() ? (
        <p className="v2-sim-usecase">
          <span className="v2-sim-usecase__label v2-techlabel">Use case ·</span>
          {useCase.trim()}
        </p>
      ) : null}

      <div className="v2-sim-stage" data-panel={openPanel ? "open" : "closed"}>
        {/* chat, the user's */}
        <ChatPanel
          pattern={pattern}
          draft={draft}
          situation={situation}
          useCase={useCase}
          onRemove={removeResponse}
          onAdd={addResponse}
          onView={setViewLevel}
        />

        {/* canvas, the pattern running, full width until a tab opens */}
        <section className="osh-card v2-sim-pane v2-sim-pane--canvas">
          <header className="v2-sim-pane__head">
            <p className="v2-techlabel">Canvas</p>
            <WhoReadonly
              levels={levels}
              viewLevel={viewLevel}
              onView={setViewLevel}
            />
          </header>
          <Canvas
            slug={pattern.v1_slugs[0]}
            viewLevel={viewLevel}
            responses={responses}
            situation={situation}
          />
        </section>

        {/* drawer, the open tab's panel; zero-width when collapsed */}
        <div className="v2-sim-drawer">
          {openPanel === "customise" ? (
            <section className="osh-card v2-sim-pane v2-sim-pane--sticky">
              <p className="v2-techlabel">Customise</p>
              <Customise
                pattern={pattern}
                draft={draft}
                responses={responses}
                allResponses={allResponses}
                incoherent={run.break?.kind === "incoherent"}
                onRemove={removeResponse}
                onAdd={addResponse}
                onRestore={restoreResponses}
              />
            </section>
          ) : openPanel === "messages" ? (
            <section className="osh-card v2-sim-pane v2-sim-pane--sticky">
              <p className="v2-techlabel">Agent messages</p>
              <AgentMessages run={run} />
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- the chat ------ */

function ChatPanel({
  pattern,
  draft,
  situation,
  useCase,
  onRemove,
  onAdd,
  onView,
}: {
  pattern: Pattern;
  draft: SpecDraft;
  situation?: Situation;
  useCase?: string;
  onRemove: (r: string) => void;
  onAdd: (r: string) => void;
  onView: (l: Level) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const firstResponse = (pattern.responses ?? getMode(pattern.mode.primary).responses)[0];
    const base = situation
      ? `${situation.intro} Ask me what this does or why, or tell me to change it, like “remove ${firstResponse}”.`
      : `This is ${pattern.name}. Ask me what it solves, when it happens, or what you can do back, or tell me to change it, like “remove ${firstResponse}”.`;
    const lead = useCase && useCase.trim()
      ? `For what you described, “${useCase.trim()}”, ${pattern.name} is the pattern that fits. `
      : "";
    return [{ id: "hello", from: "studio", text: lead + base }];
  });
  const [input, setInput] = useState("");
  const nextId = useRef(0);
  const scroller = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages]);

  function send(text: string) {
    const clean = text.trim();
    if (!clean) return;
    const userMsg: ChatMessage = {
      id: `u${nextId.current++}`,
      from: "user",
      text: clean,
    };
    const result = answerAboutPattern(pattern, draft, clean);
    // Apply any edit the message asked for.
    if (result.effect?.kind === "remove") onRemove(result.effect.response);
    if (result.effect?.kind === "add") onAdd(result.effect.response);
    if (result.effect?.kind === "view") onView(result.effect.level);
    setMessages((m) => [
      ...m,
      userMsg,
      { id: `s${nextId.current++}`, from: "studio", text: result.reply },
    ]);
    setInput("");
  }

  const suggestions = [
    "What does it solve?",
    "When does this happen?",
    "What can I do back?",
  ];

  return (
    <section className="osh-card v2-sim-pane v2-sim-pane--chat">
      <header className="v2-sim-pane__head">
        <p className="v2-techlabel">Chat</p>
      </header>

      <div className="v2-sim-convo v2-chat" ref={scroller}>
        {messages.map((m) => (
          <div
            key={m.id}
            className="v2-sim-msg"
            data-side={m.from === "user" ? "right" : "left"}
            data-state="on"
          >
            <p className="v2-sim-msg__role">
              {m.from === "user" ? "You" : "Studio"}
            </p>
            <div className="v2-sim-msg__body">
              <p className="v2-sim-msg__label">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1 flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            className="v2-resp v2-resp--sm"
            onClick={() => send(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          className="v2-select flex-1"
          placeholder="Ask, or say “remove …”"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Ask about this pattern"
        />
        <button type="submit" className="v2-resp v2-resp--sm" data-tone="primary">
          Send
        </button>
      </form>
    </section>
  );
}

/* ---------------------------------------------------------- the customise -- */

function Customise({
  pattern,
  draft,
  responses,
  allResponses,
  incoherent,
  onRemove,
  onAdd,
  onRestore,
}: {
  pattern: Pattern;
  draft: SpecDraft;
  responses: string[];
  allResponses: string[];
  incoherent: boolean;
  onRemove: (r: string) => void;
  onAdd: (r: string) => void;
  onRestore: () => void;
}) {
  return (
    <div className="v2-sim-controls mt-3">
      <div>
        <p className="v2-techlabel">What you can do back</p>
        <p className="v2-sim-field__hint">
          remove one and the agent can no longer offer it
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {responses.map((r) => (
            <button
              key={r}
              type="button"
              className="v2-chip-removable"
              onClick={() => onRemove(r)}
              title="Remove this response"
            >
              {r}
              <span aria-hidden="true" className="v2-chip-removable__x">
                ×
              </span>
            </button>
          ))}
          {responses.length === 0 ? (
            <span className="text-xs text-faint">None left.</span>
          ) : null}
        </div>

        {allResponses.some((r) => !responses.includes(r)) ? (
          <div className="mt-3">
            <p className="v2-sim-field__hint">Put one back</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {allResponses
                .filter((r) => !responses.includes(r))
                .map((r) => (
                  <button
                    key={r}
                    type="button"
                    className="v2-resp v2-resp--sm"
                    onClick={() => onAdd(r)}
                  >
                    + {r}
                  </button>
                ))}
            </div>
          </div>
        ) : null}

        {incoherent ? (
          <button
            type="button"
            className="v2-btn v2-btn--secondary mt-3"
            onClick={onRestore}
          >
            Restore the responses
          </button>
        ) : null}
      </div>

      <Exports pattern={pattern} draft={draft} />
    </div>
  );
}

/* ------------------------------------------------- the backend messages ---- */

function AgentMessages({ run }: { run: ReturnType<typeof buildRun> }) {
  const [step, setStep] = useState(0);
  const total = run.steps.length;
  const clamped = Math.min(step, Math.max(total - 1, 0));

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-2">
        <p className="v2-sim-field__label">What the agents actually exchange</p>
        {total > 0 ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="v2-resp v2-resp--sm"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={clamped === 0}
              aria-label="Step back"
            >
              ‹
            </button>
            <button
              type="button"
              className="v2-resp v2-resp--sm"
              onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
              disabled={clamped >= total - 1}
              aria-label="Step forward"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
      <p className="v2-sim-field__hint">
        the deterministic run behind the canvas, this is the machine side, not
        for the person using it
      </p>

      <div className="v2-sim-convo mt-3">
        {run.break?.kind === "incoherent" ? (
          <div className="v2-sim-msg" data-side="center" data-state="on">
            <div className="v2-sim-msg__body">
              <p className="v2-sim-msg__label">The agent can&rsquo;t run this.</p>
              <p className="v2-sim-msg__detail">{run.break.message}</p>
            </div>
          </div>
        ) : (
          run.steps.map((s, i) => {
            const side =
              s.actor === "agent-b" || s.actor === "person"
                ? "right"
                : s.actor === "system"
                  ? "center"
                  : "left";
            return (
              <div
                key={s.id}
                className="v2-sim-msg"
                data-side={side}
                data-state={i <= clamped ? "on" : "off"}
              >
                {ACTOR_LABEL[s.actor] ? (
                  <p className="v2-sim-msg__who">{ACTOR_LABEL[s.actor]}</p>
                ) : null}
                <div className="v2-sim-msg__body">
                  <p className="v2-sim-msg__label">{s.label}</p>
                  {s.detail ? (
                    <p className="v2-sim-msg__detail">{s.detail}</p>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------- who's involved (read-only) -- */

function WhoReadonly({
  levels,
  viewLevel,
  onView,
}: {
  levels: Level[];
  viewLevel: Level;
  onView: (l: Level) => void;
}) {
  if (levels.length <= 1) {
    return (
      <span className="v2-sim-who">
        <Dots level={viewLevel} />
        {LEVEL_LABEL[viewLevel]}
      </span>
    );
  }
  return (
    <div className="v2-sim-who-tabs" role="group" aria-label="Shown at">
      <span className="v2-sim-who-tabs__label">Shown at</span>
      {levels.map((l) => (
        <button
          key={l}
          type="button"
          className="v2-resp v2-resp--sm"
          data-tone={l === viewLevel ? "primary" : undefined}
          aria-pressed={l === viewLevel}
          onClick={() => onView(l)}
        >
          {LEVEL_LABEL[l]}
        </button>
      ))}
    </div>
  );
}

function Dots({ level }: { level: Level }) {
  const shape =
    level === "L2"
      ? ["agent", "agent"]
      : level === "L1"
        ? ["agent"]
        : level === "L4"
          ? ["agent", "person", "person"]
          : ["agent", "person"];
  return (
    <span className="v2-sim-cast" aria-hidden="true">
      {shape.map((d, i) => (
        <i key={i} data-person={d === "person" ? "true" : undefined} />
      ))}
    </span>
  );
}

/* -------------------------------------------------------------- the canvas -- */

function Canvas({
  slug,
  viewLevel,
  responses,
  situation,
}: {
  slug: string;
  viewLevel: Level;
  responses: string[];
  situation?: Situation;
}) {
  if (viewLevel === "L2") {
    const canAdopt = responses.some((r) => /adopt/i.test(r));
    const a = situation?.partyA;
    const b = situation?.partyB;
    return (
      <div className="v2-preview v2-sim-canvas">
        <div className="v2-preview__frame">
          <p className="v2-eyebrow">Shared record</p>
          <p className="mt-2 text-sm leading-relaxed text-subtle">
            The surface the agents read and write, no person is here to see a
            screen.
          </p>
          <dl className="v2-kv mt-4">
            <dt>{a ? a.name : "Agent A"}</dt>
            <dd>{a ? `${a.claim}, from ${a.basis}` : "states an answer, with its sources"}</dd>
            <dt>{b ? b.name : "Agent B"}</dt>
            <dd>{b ? `${b.claim}, from ${b.basis}` : "states a conflicting answer, with its own"}</dd>
            <dt>Outcome</dt>
            <dd>
              {responses.length === 0
                ? ", nothing to resolve with"
                : canAdopt
                  ? situation?.adopt ?? "an answer is adopted, reasoning attached"
                  : situation?.impasse ?? "an impasse is flagged"}
            </dd>
          </dl>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-faint">
          At agents-only, the pattern is the exchange, open Agent messages to
          watch it; this is the record it leaves.
        </p>
      </div>
    );
  }

  const Surface = PATTERN_STANDALONE[slug];
  return (
    <div className="v2-preview v2-sim-canvas">
      {Surface ? (
        <div className="v2-preview__frame">
          <Surface compact />
        </div>
      ) : (
        <p className="text-sm text-muted">
          No surface has been drawn for this pattern yet.
        </p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-faint">
        The pattern&rsquo;s own UI, as the person in the loop sees it. Remove a
        response under Customise and it is gone from what the agent can offer.
      </p>
    </div>
  );
}

/* ----------------------------------------------------------- the exports ---- */

function Exports({ pattern, draft }: { pattern: Pattern; draft: SpecDraft }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied((c) => (c === label ? null : c)), 1600);
    } catch {
      setCopied(null);
    }
  }

  function downloadMarkdown() {
    const text = markdownExport(pattern, draft);
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pattern.id}${isShaped(pattern, draft) ? "-shaped" : ""}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="border-t border-line pt-4">
      <p className="v2-techlabel">Export</p>
      <p className="v2-sim-field__hint">the spec as you shaped it</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="v2-resp v2-resp--sm"
          onClick={() => copy("mcp", mcpExport(pattern, draft))}
        >
          {copied === "mcp" ? "Copied" : "MCP call"}
        </button>
        <button
          type="button"
          className="v2-resp v2-resp--sm"
          onClick={() => copy("md", markdownExport(pattern, draft))}
        >
          {copied === "md" ? "Copied" : "Markdown"}
        </button>
        <button
          type="button"
          className="v2-resp v2-resp--sm"
          onClick={downloadMarkdown}
        >
          Download .md
        </button>
      </div>
    </div>
  );
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
