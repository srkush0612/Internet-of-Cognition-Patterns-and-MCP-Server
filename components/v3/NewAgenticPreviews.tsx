"use client";

/**
 * Authored, pattern-specific previews for the seven new agentic patterns.
 * Each depicts the pattern in context and uses only the `--p-*` theme tokens
 * from `.v3-preview[data-theme="..."]`, so the shadcn / Material toggle on
 * the pattern detail page switches every preview under one mechanism.
 *
 * Previews here are illustrative, not real UI. Copy, agents, and situations
 * echo the authored example on each pattern's detail page so the two agree.
 */

export type NewAgenticPreviewId =
  | "stream-of-thought"
  | "follow-up"
  | "agent-memory"
  | "task-creation"
  | "task-assignment"
  | "priority-ranking"
  | "subtask-generation";

function StreamOfThoughtPreview() {
  const steps = [
    { time: "03:08", text: "5xx spike on payments-svc, starting trace." },
    { time: "03:09", text: "Spike correlates with deploy 4f2a at 03:04." },
    { time: "03:10", text: "Candidate cause: new retry policy increased queue depth." },
    { time: "03:10", text: "Checking retry count on checkout endpoints…", active: true },
  ];
  return (
    <div className="v3-np v3-np-sot">
      <div className="v3-np__bar">
        <span className="v3-np__avatar">R</span>
        <strong>Reliability agent</strong>
        <span className="v3-np__status v3-np__status--live">
          <span className="v3-np__pulse" aria-hidden="true" />
          streaming
        </span>
      </div>
      <ol className="v3-np-sot__steps">
        {steps.map((step, index) => (
          <li key={index} data-active={step.active ? "true" : "false"}>
            <span className="v3-np-sot__dot" aria-hidden="true" />
            <div>
              <small>{step.time}</small>
              <p>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="v3-np__actions">
        <button type="button" data-primary="true">follow</button>
        <button type="button">interrupt</button>
        <button type="button">redirect</button>
      </div>
    </div>
  );
}

function FollowUpPreview() {
  return (
    <div className="v3-np v3-np-fu">
      <div className="v3-np-fu__context">
        <small>Context</small>
        <p>Drafting reply to dispute DIS-4421 (two charges over 30 days).</p>
      </div>
      <div className="v3-np-fu__message">
        <span className="v3-np__avatar">S</span>
        <div>
          <strong>Support agent</strong>
          <p>Does this dispute cover one charge or the whole series?</p>
          <small>Agent is waiting for the answer before the draft is sent.</small>
        </div>
      </div>
      <div className="v3-np-fu__reply">
        <div className="v3-np-fu__input">
          <small>Your answer</small>
          <span>Type an answer…</span>
          <span className="v3-np-fu__caret" aria-hidden="true" />
        </div>
        <button type="button">skip</button>
      </div>
      <p className="v3-np__note">On skip, the agent proceeds with a stated assumption: one charge.</p>
    </div>
  );
}

function MemoryPreview() {
  const entries = [
    { label: "Prefers to avoid restarts during business hours", when: "Added Nov 4" },
    { label: "Oncall shifts: Mon through Wed", when: "Added Oct 28" },
    { label: "Primary stack: Go and Postgres", when: "Added Sep 12" },
  ];
  return (
    <div className="v3-np v3-np-mem">
      <div className="v3-np-mem__inline">
        <span className="v3-np__avatar">M</span>
        <div>
          <small>Inline, in chat</small>
          <p>
            Remembered: prefers to avoid restarts during business hours.
          </p>
          <div className="v3-np__actions">
            <button type="button" data-primary="true">keep</button>
            <button type="button">edit</button>
            <button type="button">forget</button>
          </div>
        </div>
      </div>
      <div className="v3-np-mem__list">
        <header>
          <small>Memory in settings</small>
          <strong>3 entries</strong>
        </header>
        {entries.map((entry) => (
          <div className="v3-np-mem__row" key={entry.label}>
            <div>
              <strong>{entry.label}</strong>
              <small>{entry.when}</small>
            </div>
            <div className="v3-np-mem__row-actions">
              <button type="button">edit</button>
              <button type="button">forget</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskCreationPreview() {
  return (
    <div className="v3-np v3-np-tc">
      <div className="v3-np-tc__header">
        <span className="v3-np__avatar">T</span>
        <div>
          <small>Triage agent proposes</small>
          <strong>A new task</strong>
        </div>
      </div>
      <div className="v3-np-tc__card">
        <div>
          <small>Name</small>
          <p>Investigate checkout retry storm</p>
        </div>
        <div>
          <small>Expected result</small>
          <p>Root cause and a fix plan.</p>
        </div>
        <div>
          <small>Owner</small>
          <p>@triage</p>
        </div>
      </div>
      <div className="v3-np__actions">
        <button type="button" data-primary="true">accept</button>
        <button type="button">edit</button>
        <button type="button">decline</button>
      </div>
      <p className="v3-np__note">On accept, the task appears in the incident workspace.</p>
    </div>
  );
}

function TaskAssignmentPreview() {
  return (
    <div className="v3-np v3-np-ta">
      <div className="v3-np-ta__pair">
        <div className="v3-np-ta__agent">
          <span className="v3-np__avatar">T</span>
          <small>Assigning</small>
          <strong>Triage</strong>
        </div>
        <div className="v3-np-ta__arrow" aria-hidden="true">→</div>
        <div className="v3-np-ta__agent">
          <span className="v3-np__avatar">R</span>
          <small>Capability match</small>
          <strong>Reliability</strong>
        </div>
      </div>
      <div className="v3-np-ta__message">
        <small>Task message</small>
        <p className="v3-np-ta__title">
          Produce a 72-hour deploy diff for payments-svc.
        </p>
        <p>Context: INC-2231, latency spike, candidate: deploy 4f2a.</p>
      </div>
      <div className="v3-np__actions">
        <button type="button" data-primary="true">accept</button>
        <button type="button">decline</button>
        <button type="button">ask</button>
      </div>
      <div className="v3-np-ta__view">
        <small>Shared view</small>
        <p>Owner: Reliability, transferred from Triage.</p>
      </div>
    </div>
  );
}

function PriorityRankingPreview() {
  const tasks = [
    { rank: 1, name: "Fix broken build", why: "Blocker, one person waiting" },
    { rank: 2, name: "Renew certificate", why: "Expires in 3 days" },
    { rank: 3, name: "Update docs", why: "Deadline this week" },
  ];
  return (
    <div className="v3-np v3-np-pr">
      <div className="v3-np-pr__head">
        <div>
          <small>Three tasks in flight</small>
          <strong>Agent-proposed order</strong>
        </div>
        <button type="button" data-primary="true">accept ranking</button>
      </div>
      <ol className="v3-np-pr__list">
        {tasks.map((task) => (
          <li key={task.rank}>
            <span className="v3-np-pr__rank">{task.rank}</span>
            <div>
              <strong>{task.name}</strong>
              <small>Reason: {task.why}</small>
            </div>
            <span className="v3-np-pr__drag" aria-hidden="true">⋮⋮</span>
          </li>
        ))}
      </ol>
      <p className="v3-np__note">
        Drag to reorder; the agent updates its own weighting from the overrides.
      </p>
    </div>
  );
}

function SubtaskGenerationPreview() {
  const subtasks = [
    { n: 1, name: "Measure current p99 by endpoint" },
    { n: 2, name: "Identify the top two slow endpoints", dep: "depends on 1" },
    { n: 3, name: "Profile the top two", dep: "depends on 2" },
    { n: 4, name: "Propose fixes with risk notes", dep: "depends on 3" },
    { n: 5, name: "Measure p99 after", dep: "depends on 4" },
  ];
  return (
    <div className="v3-np v3-np-sg">
      <div className="v3-np-sg__parent">
        <small>Parent task</small>
        <strong>Reduce checkout p99 latency</strong>
      </div>
      <ol className="v3-np-sg__list">
        {subtasks.map((subtask) => (
          <li key={subtask.n}>
            <span className="v3-np-sg__rank">{subtask.n}</span>
            <div>
              <p>{subtask.name}</p>
              {subtask.dep && <small>{subtask.dep}</small>}
            </div>
          </li>
        ))}
      </ol>
      <div className="v3-np__actions">
        <button type="button" data-primary="true">accept 5 subtasks</button>
        <button type="button">edit</button>
        <button type="button">decline</button>
      </div>
    </div>
  );
}

export const NEW_AGENTIC_PREVIEWS: Record<NewAgenticPreviewId, () => React.ReactElement> = {
  "stream-of-thought": StreamOfThoughtPreview,
  "follow-up": FollowUpPreview,
  "agent-memory": MemoryPreview,
  "task-creation": TaskCreationPreview,
  "task-assignment": TaskAssignmentPreview,
  "priority-ranking": PriorityRankingPreview,
  "subtask-generation": SubtaskGenerationPreview,
};

export function getNewAgenticPreview(id: string): (() => React.ReactElement) | null {
  return NEW_AGENTIC_PREVIEWS[id as NewAgenticPreviewId] ?? null;
}
