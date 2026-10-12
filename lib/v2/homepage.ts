import type { Level } from "./types";

/**
 * Homepage content.
 *
 * The scenes, prompts and answers all live here rather than in the page, so
 * the pattern ids can be checked against the catalog by a test. Everything a
 * card claims a pattern does is the pattern's own summary, pulled at render
 * time; the only authored copy is the scene itself and the "why it fits" line.
 *
 * The incident is an example, not a transcript. It is the same INC-2231 the
 * Studio situations use, so the two tell one story.
 */

export type SceneLine = {
  actor: string;
  action: string;
  /** The problem scene's aside, e.g. "(didn't ask)". */
  aside?: string;
  /** The HAX scene's pattern, by catalog id. */
  patternId?: string;
};

export const SCENE_HEADER = {
  incident: "incident INC-2231",
  subject: "checkout-latency",
};

export const PROBLEM_SCENE: SceneLine[] = [
  { actor: "@triage", action: "restarting payments-svc", aside: "without asking" },
  {
    actor: "@planner",
    action: "rolling back deploy 4f2a",
    aside: "conflicts with @triage",
  },
  { actor: "@notify", action: "paging on-call", aside: "no reason given" },
  { actor: "operator", action: '"Why did it restart?"' },
];

export const PROBLEM_FOOTER =
  "Conflicting actions · No reasons given · Operator left guessing";

export const HAX_SCENE: SceneLine[] = [
  {
    actor: "@triage",
    action: "proposes a restart and waits",
    patternId: "pre-action-handshake",
  },
  {
    actor: "@planner",
    action: "raises a conflict, answer adopted",
    patternId: "convergence-point",
  },
  {
    actor: "@notify",
    action: "pages on-call and explains why",
    patternId: "inline-rationale",
  },
  {
    actor: "operator",
    action: "can see what each agent is allowed to do",
    patternId: "authority-gradient",
  },
];

export const HAX_FOOTER =
  "Actions explained · Replies are clear · Decision recorded";

/**
 * What each reply does in this example. Scripted for the scene, not derived
 * from the library, the library records which replies a pattern expects, and
 * says nothing about what the agent does next. The card says so.
 */
export const CHIP_OUTCOMES: Array<{ label: string; outcome: string }> = [
  {
    label: "consent",
    outcome: "@triage restarts payments-svc, and the reason is on the record.",
  },
  {
    label: "correct",
    outcome: "@triage narrows the restart to the one pod the operator named.",
  },
  { label: "decline", outcome: "@triage holds and logs the reason." },
  {
    label: "defer",
    outcome: "@triage waits, and asks again at the next error spike.",
  },
];

/** Section 5: the four setups, in plain words. */
export const SETUPS: Array<{ level: Level; line: string }> = [
  { level: "L1", line: "The agent describes its own action or state." },
  { level: "L2", line: "Agents coordinate with peers or an orchestrator." },
  {
    level: "L3",
    line: "One person can follow, guide, or approve the exchange.",
  },
  {
    level: "L4",
    line: "People and teams can see decisions and understand who owns them.",
  },
];

/** Section 6: who it's for. */
export type Audience = {
  id: string;
  title: string;
  body: string;
  workflows: string[];
  prompt: string;
  /** Pattern ids the answer names, with the reason it fits. */
  answer: Array<{ patternId: string; why: string }>;
};

export const AUDIENCES: Audience[] = [
  {
    id: "designers",
    title: "Designers",
    body: "Identify the exchanges inside a product flow and choose a pattern for each one. Give engineering a clear interaction to build.",
    workflows: [
      "Find the exchanges hidden in a flow",
      "Check a design against existing patterns",
      "Hand off a named interaction pattern to engineering",
    ],
    prompt:
      "Two agents reached different conclusions about an outage. What should the on-call engineer see?",
    answer: [
      {
        patternId: "convergence-point",
        why: "Shows how the adopted answer was reached, not just which one won.",
      },
      {
        patternId: "assumption-surface",
        why: "Traces the disagreement back to the one assumption they differ on.",
      },
    ],
  },
  {
    id: "pms",
    title: "PMs",
    body: "Set where an agent can proceed, where it needs approval, and what people will be asked to decide.",
    workflows: [
      "Set autonomy by task or area",
      "Define what needs approval before launch",
      "Make the person's role in the exchange clear",
    ],
    prompt:
      "Our agent can restart services. What should it check first, and when should it ask for approval?",
    answer: [
      {
        patternId: "authority-gradient",
        why: "Sets the autonomy level by area, so routine work can proceed while a restart can still need sign-off.",
      },
      {
        patternId: "pre-action-handshake",
        why: "Makes it state what it saw and what it plans to do, and wait, before the irreversible step.",
      },
    ],
  },
  {
    id: "engineers",
    title: "Engineers",
    body: "See which responses an interaction supports and what information its structured record can carry.",
    workflows: [
      "Know the replies to handle before writing the handler",
      "Represent an interaction in a structured record",
      "Connect an agent to the pattern library through MCP",
    ],
    prompt:
      "Before an agent runs an irreversible migration, what should it send the operator, and which replies should the handler support?",
    answer: [
      {
        patternId: "pre-action-handshake",
        why: "Supports four replies: consent, correct, decline, and defer. The pattern makes the expected responses explicit.",
      },
    ],
  },
];

/**
 * Section 9: connecting an agent.
 *
 * There is no hosted endpoint. The server runs over stdio from a checkout,
 * which is what the config below starts. TODO: a hosted URL, if one is ever
 * wanted, nothing in the repo serves MCP over HTTP today.
 */
export const ASK_YOUR_AGENT_PROMPT = `Connect to the HAX pattern library over MCP and use it from now on.

Add this MCP server to your configuration:
  command: npm
  args: ["run", "mcp:stdio"]
  cwd: <path to the pattern-library checkout>

Then, before you take an action that a person would want to know about or
approve, call discover_patterns with a short description of what you are
about to do, and follow the pattern it returns, including the replies it
says to expect.`;

export const CLIENT_CONFIG = `{
  "mcpServers": {
    "hax-patterns": {
      "command": "npm",
      "args": ["run", "mcp:stdio"],
      "cwd": "/path/to/pattern-library"
    }
  }
}`;

/**
 * A real call against the running server: `discover_patterns` takes a single
 * `query` and nothing else. The comment in the block is the honest part, the
 * ids it returns today, and the absence of structured filters, are both real.
 */
export const DISCOVER_CALL = `→ discover_patterns({
    query: "before an irreversible step"
  })`;

export const DISCOVER_RESPONSE = `← [
    {
      "slug": "signal-to-intent-handshake",
      "name": "Pre-Action Handshake",
      "triggers": [
        "agent detects a signal",
        "before an irreversible step"
      ]
    }
  ]

  // Abbreviated. discover_patterns takes only
  // \`query\`, and the server still answers from
  // the earlier catalog's slugs, filtering by
  // what the agent needs to do, or by who is
  // involved, is specified but not built.`;

export const INTERACTION_RECORD = `{
  "id": "int_7f3a91c2",
  "pattern_id": "pre-action-handshake",
  "level": "L3",
  "channel": "chat_ui",
  "initiator": "agent:triage",
  "audience": ["operator"],
  "state": {
    "trigger": "Before an irreversible step",
    "expects": ["consent", "correct", "decline", "defer"]
  },
  "response": {
    "value": "consent",
    "by": "person:on-call",
    "at": "2026-03-04T03:11:44.000Z"
  },
  "created_at": "2026-03-04T03:11:02.000Z"
}`;
