# HAX V3 homepage copy

Status: implemented in the V3 homepage prototype. The recovery comparison is illustrative. The component example uses the existing Capability Manifest pattern and its HAX SDK implementation.

## Navigation

Brand: HAX

Links: Patterns · Studio · MCP server

Action: Connect MCP

## Hero

Eyebrow: Human–agent interaction

Headline: One pattern library for people and agents working together at scale.

Headline emphasis: Only “working together at scale.” is blue.

Supporting copy: Explore patterns for what agents do and how people experience it—from first interaction to decisions, handoffs, and ongoing work.

Actions: Explore patterns · Open Studio

Motion: A quiet field of connected agent and person particles drifts behind the hero, with the copy entering in sequence. The field becomes static when reduced motion is requested.

## With and without HAX

Heading: See how HAX elevates the AI experience

Intro: Define when agents act, ask, defer, and hand off work—and how they involve the person in context.

Two interface panels load side by side. The separate agent actions resolve first, then the coordinated recovery proposal appears with its decision controls and takeaway. Replay restarts the sequence. The content remains visible without animation when reduced motion is requested. The recovery example follows slide 4 of the [V3 presentation](https://ru2s6zn8.reviewa.work/).

Above the panels, the comparison names each view. The HAX side links the patterns illustrated by this recovery moment: Convergence Point, Pre-Action Handshake, and Inline Rationale. The replay control sits beside those links.

Without HAX · Separate actions & requests: Triage agent runs diagnostics autonomously. Planner agent asks, “Approve rollback?” Monitor agent asks, “Restart the service?” Agents act and ask for input. The person still has to reconcile the requests, their context, and their consequences.

With HAX · Behavior + human context: Review proposed recovery. Diagnostics link the errors to the release. Rollback is proposed; restart is held to avoid conflicting actions. Active sessions may be interrupted. Response options: Approve rollback, Ask for details, Defer. Agents know when to proceed, pause, or involve a person. The person sees the context and can choose what happens next.

## Guiding principles

Heading: Five principles guide HAX.

Intro: They set the standard for trustworthy agent experiences. Each pattern shows which principle its behavior puts into practice.

- **Control:** People set an agent's boundaries, preferences, and goals; the agent adapts its autonomy to that direction.
- **Clarity:** Agents make their reasoning, context, and confidence visible so people can assess decisions.
- **Recovery:** People can undo agent actions, correct errors, and guide a safer next attempt.
- **Collaboration:** People and agents share context, exchange input, and shape work together.
- **Traceability:** Agent decisions and actions stay visible, searchable, and open to review.

Each principle links to its own page. That page explains the principle and lists every catalog pattern assigned to it, including patterns that also support it as a secondary principle. Pattern names link to their individual pages.

Source action: Read the guiding principles at Outshift Design.

Each pattern page has a compact "Principles at work" callout below "What it solves." It names a primary principle, any supported secondary principle, and the specific behavior that demonstrates each connection.

## How it works

Heading: From a prompt to behavior in your product.

Intro: Describe what you need. HAX helps your agent find the right building blocks, shape an editable behavior, and show it in your workflow.

Four illustrated interface scenes stack while the reader scrolls. The first echoes an agent prompt, the second maps pattern and interface matches, the third is an editable draft, and the fourth shows the draft in a working incident screen.

1. **Find a pattern with a prompt.** Tell your agent what you are trying to build and ask which HAX patterns fit.
2. **HAX finds the right building blocks.** The agent gets fitting patterns and the interface parts needed to show them.
3. **Create a behavior you can edit.** Review and change the trigger, proposed action, and response choices.
4. **Show the behavior in your workflow.** Place the draft in the incident workspace; edits to the draft update the example, and a person can choose a response.

## Four dimensions of participation

Heading: Four dimensions of participation.

Intro: Choose the simplest setup that fits the exchange. As more agents and people join, make responsibilities and decision rights clear.

- **One agent:** The agent describes its own action or state.
- **Many agents only:** Agents coordinate with peers or an orchestrator.
- **Many agents + one person:** One person can follow, guide, or approve the exchange.
- **Many agents + many people:** People and teams can see decisions and understand who owns them.

Each dimension links to matching patterns.

## Explore

Heading: Start with a real exchange.

Intro: These patterns address different moments in an agent workflow. Open one to inspect its behavior, participants, channels, and available component.

- **Pre-Action Handshake:** Before a consequential action, ask for a decision before the agent takes a step it cannot easily undo.
- **Convergence Point:** When agents disagree, show how they weighed conflicting answers and reached an adopted one.
- **Inline Rationale:** When an answer appears, place the agent's reason beside the output so a person can assess it. An SDK component is available.

Action: Browse the full pattern catalog.

## Featured pattern and component

Heading: One pattern, carried into the interface.

Intro: Capability Manifest defines what an agent needs to declare. Its component shows those same facts where a person sets the agent's scope. Compare the behavior with the UI in one place.

Pattern: Before a person assigns work, the agent shows what it can do, what needs approval, what is unavailable, and whether its connection is ready. It updates at connection and when capabilities change. The person can calibrate trust and set the right scope.

Component: In Settings, the manifest shows the full capability list, connection status, and an active rate limit alert. Chat can show a compact summary; a state signal carries the same facts as data.

Actions: See the pattern · Open component preview

## Target audience

Heading: Who can use HAX and how.

Intro: The same patterns guide design, product decisions, implementation, and agent behavior.

- **For designers:** Find the moments when an agent should explain, ask, or hand off, then shape the exchange.
- **For product managers:** Decide where an agent can act and where a person needs a say.
- **For engineers:** Use each pattern's states and responses to build the interaction in the product.
- **For agents:** Look up a fitting pattern during a task and follow its expected exchange.

The section uses a centered headline, dotted field, and open two-column layout. The heading and roles rise into view in a short stagger as the reader scrolls. Nearby dots respond subtly to pointer movement. It stacks the four roles on narrow screens and remains readable without motion or scripting. It has no actions.

## MCP server

Heading: Connect HAX to your agents.

Copy: The local MCP server lets an agent search the current pattern registry during a task. Connect it from a checkout, then use the setup guide to see the calls it supports.

Example lookup: `discover_patterns({ query: "before an irreversible step" })`

Status note: Current server: local stdio connection. V2 catalog alignment is still in progress.

Action: Open MCP setup guide

## Footer

Links: Patterns · What agents do · Studio · MCP server · How we built this

Credit: HAX, by Outshift
