"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { suggestionsFor } from "@/lib/studio/agent";
import {
  ATTENDANCE_LABEL,
  IRREVERSIBILITY_LABEL,
  TOPOLOGY_LABEL,
  type AgentProposal,
  type Scenario,
  type ThreadMessage,
} from "@/lib/studio/types";
import "@/components/chat/advisor-landing.css";

type ChipKey = "topology" | "attendance" | "irreversibility";

const CHIP_QUESTION: Record<ChipKey, string> = {
  topology: "How many agents, and do they work together?",
  attendance: "Is someone watching while it works?",
  irreversibility: "Can it do things you cannot take back?",
};

const CHIP_OPTIONS: Record<ChipKey, Array<[string, string]>> = {
  topology: Object.entries(TOPOLOGY_LABEL),
  attendance: Object.entries(ATTENDANCE_LABEL),
  irreversibility: Object.entries(IRREVERSIBILITY_LABEL),
};

function chipValue(scenario: Scenario, key: ChipKey): string {
  if (key === "topology") return TOPOLOGY_LABEL[scenario.topology];
  if (key === "attendance") return ATTENDANCE_LABEL[scenario.attendance];
  return IRREVERSIBILITY_LABEL[scenario.irreversibility];
}

/**
 * A recommendation or a refusal. Both render the same way on purpose: the
 * person reads a headline, the reasoning, and then picks. There is no apply
 * button anywhere in this pane, and nothing on the canvas moves until an
 * option is chosen. A refusal differs only in that none of its options carry
 * out the thing that was asked for.
 */
function Proposal({
  proposal,
  refusing,
  taken,
  onChoose,
}: {
  proposal: AgentProposal;
  refusing: boolean;
  taken?: number;
  onChoose: (index: number, reason?: string) => void;
}) {
  const [showCite, setShowCite] = useState(false);
  const [reasons, setReasons] = useState<Record<number, string>>({});

  return (
    <div className={`studio-prop${refusing ? " studio-prop--refusal" : ""}`}>
      <p className="studio-prop__kind">
        {refusing ? "Declined" : "What I would do"}
      </p>
      <p className="studio-prop__head">{proposal.head}</p>
      <p className="studio-prop__why">{proposal.why}</p>

      {proposal.cites ? (
        <p className="studio-cite">
          <button type="button" onClick={() => setShowCite((open) => !open)}>
            {showCite ? "Hide where this comes from" : "Where this comes from"}
          </button>
          {showCite ? <span>{proposal.cites}</span> : null}
        </p>
      ) : null}

      <div className="studio-prop__opts">
        {proposal.options.map((option, index) => {
          const isTaken = taken === index;
          const reason = reasons[index] ?? "";
          const blocked = Boolean(option.reasonPrompt) && reason.trim() === "";

          return (
            <div
              key={option.label}
              className={`studio-opt${option.best ? " studio-opt--best" : ""}${
                isTaken ? " studio-opt--taken" : ""
              }${taken !== undefined && !isTaken ? " studio-opt--spent" : ""}`}
            >
              <button
                type="button"
                className="studio-opt__btn"
                disabled={taken !== undefined || blocked}
                onClick={() => onChoose(index, reason.trim() || undefined)}
              >
                <span className="studio-opt__label">
                  {option.label}
                  {option.best ? (
                    <span className="studio-opt__flag">what I would do</span>
                  ) : null}
                </span>
                <span className="studio-opt__commits">
                  commits you to {option.commits}
                </span>
              </button>

              {option.reasonPrompt && taken === undefined ? (
                <label className="studio-opt__reason">
                  {option.reasonPrompt}
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(event) =>
                      setReasons((current) => ({
                        ...current,
                        [index]: event.target.value,
                      }))
                    }
                  />
                </label>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Message({
  message,
  onChoose,
  onOpen,
}: {
  message: ThreadMessage;
  onChoose: (messageId: string, index: number, reason?: string) => void;
  onOpen: (situationId: string) => void;
}) {
  if (message.from === "person") {
    return (
      <ChatMessage role="user" showAvatar={false}>
        <p className="advisor-bubble advisor-bubble--user">{message.text}</p>
      </ChatMessage>
    );
  }

  if (message.kind === "confirmation") {
    return (
      <ChatMessage role="assistant">
        <div className="studio-confirm">
          <p className="studio-confirm__kind">Done</p>
          <p>{message.text}</p>
        </div>
      </ChatMessage>
    );
  }

  if (message.kind === "answer") {
    return (
      <ChatMessage role="assistant">
        <p className="studio-answer">{message.text}</p>
        {message.cites ? <Cite text={message.cites} /> : null}
        {message.opens ? (
          <button
            type="button"
            className="osh-cta-solid studio-answer__open"
            onClick={() => onOpen(message.opens as string)}
          >
            Open it
          </button>
        ) : null}
      </ChatMessage>
    );
  }

  return (
    <ChatMessage role="assistant">
      <Proposal
        proposal={message.proposal}
        refusing={message.kind === "refusal"}
        taken={message.taken}
        onChoose={(index, reason) => onChoose(message.id, index, reason)}
      />
    </ChatMessage>
  );
}

function Cite({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <p className="studio-cite">
      <button type="button" onClick={() => setOpen((value) => !value)}>
        {open ? "Hide where this comes from" : "Where this comes from"}
      </button>
      {open ? <span>{text}</span> : null}
    </p>
  );
}

export function AgentPane({
  scenario,
  thread,
  askedIds,
  openSituationId,
  onAsk,
  onSend,
  onChoose,
  onOpen,
  onEditScenario,
}: {
  scenario: Scenario;
  thread: ThreadMessage[];
  askedIds: string[];
  openSituationId: string | null;
  onAsk: (questionId: string) => void;
  onSend: (text: string) => void;
  onChoose: (messageId: string, index: number, reason?: string) => void;
  onOpen: (situationId: string) => void;
  onEditScenario: (patch: Partial<Scenario>) => void;
}) {
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<ChipKey | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = threadRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [thread.length]);

  const suggestions = suggestionsFor(openSituationId, askedIds);

  function submit() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    onSend(text);
  }

  return (
    <section className="studio-agent" aria-label="Agent">
      <header className="studio-agent__head">
        <b title={scenario.description || scenario.name}>{scenario.name}</b>
        {(Object.keys(CHIP_QUESTION) as ChipKey[]).map((key) => (
          <div key={key} className="studio-chipwrap">
            <button
              type="button"
              className="studio-chip"
              aria-expanded={editing === key}
              onClick={() => setEditing(editing === key ? null : key)}
            >
              {chipValue(scenario, key)}
            </button>

            {editing === key ? (
              <div className="studio-chipmenu" role="dialog">
                <p>{CHIP_QUESTION[key]}</p>
                {CHIP_OPTIONS[key].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className="studio-radio"
                    aria-pressed={chipValue(scenario, key) === label}
                    onClick={() => {
                      onEditScenario({ [key]: value } as Partial<Scenario>);
                      setEditing(null);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </header>

      <div className="studio-thread" ref={threadRef}>
        {thread.map((message) => (
          <Message
            key={message.id}
            message={message}
            onChoose={onChoose}
            onOpen={onOpen}
          />
        ))}
      </div>

      <footer className="studio-composer">
        {suggestions.length > 0 ? (
          <div className="advisor-scenario-pills studio-suggestions">
            {suggestions.map((question) => (
              <button
                key={question.id}
                type="button"
                className="advisor-scenario-pill"
                onClick={() => onAsk(question.id)}
              >
                {question.question}
              </button>
            ))}
          </div>
        ) : (
          <p className="studio-suggestions__spent">
            Every scripted question has been used. Anything typed now gets the
            fallback, which is the honest answer for a build with no model in it.
          </p>
        )}

        <div className="advisor-chat-input-row">
          <textarea
            id="studio-agent-input"
            className="advisor-chat-input studio-input"
            rows={1}
            value={draft}
            placeholder="Ask about a situation, a pattern, or the whole scenario"
            aria-label="Ask the agent"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
          />
          <button
            type="button"
            className="osh-cta-solid advisor-chat-send"
            onClick={submit}
          >
            Send
          </button>
        </div>
      </footer>
    </section>
  );
}
