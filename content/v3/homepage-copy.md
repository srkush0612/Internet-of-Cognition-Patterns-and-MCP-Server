# HAX V3 homepage copy

Status: implemented in the V3 homepage prototype. The recovery comparison is illustrative. The component example uses the existing Capability Manifest pattern and its HAX SDK implementation.

## Navigation

Brand: HAX

Links: Patterns · Studio · MCP server

Action: Connect MCP

## Hero

Eyebrow: Human–agent interaction

Headline: Make collaboration between people and agents work at scale.

Supporting copy: Design how agents ask, hand off work, and involve people in decisions. HAX brings those interaction patterns into the interface.

Actions: Explore patterns · Open Studio

Motion: A quiet field of connected agent and person particles drifts behind the hero, with the copy entering in sequence. The field becomes static when reduced motion is requested.

## With and without HAX

Heading: One clear decision when agents coordinate.

Intro: See how separate requests become one recovery plan with a clear choice.

The fixed comparison stage switches between two views with a short opacity fade. Its size and position remain stable. The recovery example comes from slide 4 of the [V3 presentation](https://ru2s6zn8.reviewa.work/); the heading and takeaway use plain language for homepage readers.

Without HAX 2.0 · Separate actions & requests: Triage agent runs diagnostics autonomously. Planner agent asks, “Approve rollback?” Monitor agent asks, “Restart the service?” Agents act and ask for input. The person still has to reconcile the requests, their context, and their consequences.

With HAX 2.0 · One recovery plan, with context: Review proposed recovery. Diagnostics link the errors to the release. Rollback is proposed; restart is held to avoid conflicting actions. Active sessions may be interrupted. Example response options: Approve rollback, Ask for details, Defer. Agents know when to act or wait. The person sees why rollback is proposed and can approve it, ask for details, or defer.

## How it works

Heading: From an interaction to a pattern your agents can use

Intro: Describe what needs to happen, shape the exchange, connect your agents to the pattern library, and show the behavior in context.

The four stages appear as large cards that stack while the reader scrolls. The third card has an illustrative lookup reveal; the fourth lets a reader choose a reply and see its outcome.

1. **Find the right pattern.** Describe what the agent needs to do and who is involved. Studio suggests a fitting pattern.
2. **Shape the exchange.** Preview the agent's message in its channel and make the supported replies explicit.
3. **Connect your agents.** Let an agent look up a pattern through the local MCP server when the task calls for one.
4. **Show it in the product.** Give the person a clear choice at the moment the agent needs a decision.

## Four dimensions of participation

Heading: Four dimensions of participation.

Intro: Choose the simplest setup that fits the exchange. As more agents and people join, make responsibilities and decision rights clear.

- **One agent:** The agent describes its own action or state.
- **Many agents only:** Agents coordinate with peers or an orchestrator.
- **Many agents + one person:** One person can follow, guide, or approve the exchange.
- **Many agents + many people:** People and teams can see decisions and understand who owns them.

Each dimension links to matching patterns.

## Guiding principles

Heading: Five principles guide HAX.

Intro: They set the standard for trustworthy agent experiences. Each pattern shows which principle its behavior puts into practice.

- **Control:** Let people set an agent's scope and decide when it may act. Example: Pre-Action Handshake.
- **Clarity:** Make an agent's reasoning, context, and uncertainty legible. Example: Inline Rationale.
- **Recovery:** Give people a clear way to correct mistakes and guide the next attempt. Example: Review as Dialogue.
- **Collaboration:** Show shared work, contributions, and who owns the next decision. Example: Convergence Point.
- **Traceability:** Keep agent actions and decisions attributable and open to review. Example: Activity Record.

Source action: Read the guiding principles at Outshift Design.

Each pattern page has a compact "Principles at work" callout below "What it solves." It names a primary principle, any supported secondary principle, and the specific behavior that demonstrates each connection.

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

Heading: One pattern library, four ways to use it.

Intro: Find the view that fits your work: designing an interaction, setting permissions, building an integration, or using patterns in an agent workflow.

- **Designers:** Identify exchanges in a product flow and choose a pattern for each one.
- **PMs:** Set where an agent can proceed, where it needs approval, and what people decide.
- **Engineers:** See the responses an interaction supports and the information its structured record can carry.
- **Agents:** Look up a relevant pattern during a task and use its expected replies to guide the exchange.

## MCP server

Heading: Connect HAX to your agents.

Copy: The local MCP server lets an agent search the current pattern registry during a task. Connect it from a checkout, then use the setup guide to see the calls it supports.

Example lookup: `discover_patterns({ query: "before an irreversible step" })`

Status note: Current server: local stdio connection. V2 catalog alignment is still in progress.

Action: Open MCP setup guide

## Closing

Heading: Make the behavior usable.

Copy: Find a pattern, shape its behavior in Studio, and inspect an available component in context.

Actions: Explore patterns · Open Studio
