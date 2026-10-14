# Studio, build it as a behaviour simulator

Studio is not a pattern browser and not an editor with a preview. It is a **simulator**: a pattern is a behaviour spec, and the canvas is a running agent you watch obey it. Editing the spec changes the agent's behaviour, and you see the change. This is the one thing a pattern library has never been, so it is the thing to get right.

Use what already exists: the **16 pattern UIs** you have built, and the **existing design language** from the Patterns pages. Do not invent new visual styling — reuse the tokens, components, chips, and type already in the site. The simulator is new structure, not a new skin.

## The core loop

1. A **spec** — the behaviour-spec sentence, with its slots live and editable.
2. An **agent that runs against whatever the spec currently says** — it hits the trigger, performs the mode, and waits for exactly the responses the spec allows.
3. The run is shown as **the cast the spec's level implies** (see below).
4. **Editing the spec changes the behaviour on the next step.** Drag a response out and the agent can no longer offer it — in every view. Change the level and the cast transforms.

The feeling to reach: you are not filling a form and seeing a preview. You are reshaping a running agent and watching it obey the new rules.

## Editing the spec, two ways, same object

Both edit the one underlying spec:

- **A chip palette.** Draggable slot-chips — modes, levels, responses, channels. Drag a mode onto the sentence to swap it; drag a response chip in or out; drag the level up or down. The sentence is the readable form of the program.
- **Direct manipulation of the running view.** Remove a response on the agent's own card and it leaves the spec too. The preview is not read-only; touching it edits the spec.

Keep the sentence and the run in sync at all times. An edit in either place re-derives the other.

## Run control

Step-based, with a play button that auto-steps. Each step animates so it is legible but still moves. The agent progresses through the moment: reach the trigger, perform the mode, surface the responses, settle on the one the user (or a simulated peer) picks. Stepping is the default because it is readable; play is for letting it run in a demo.

## The cast changes with the level — this is the heart of it

The level slot decides who is in the exchange, and the canvas shows a **different cast** for each. Dragging the level transforms the cast live. This transformation is the whole thesis made physical.

- **L1 — one agent.** A single agent and the person using it. The pattern's UI (one of your 16) is what the person sees. One surface.
- **L3 — agents and one person.** The agent acts, the person is in the loop. The pattern UI is the surface the person responds on. The person is a participant you can act as.
- **L2 — agents only, no person.** This is the important one and it is NOT "the surface goes dark and a JSON blob remains." At L2 there is no single agent and no person. There are **two agents**, and the pattern is the **exchange between them**. Surface a legible back-and-forth: each turn is one of the mode's moves (assert, counter, adopt, flag impasse), three or four turns, not twenty. Any turn can be opened to show the actual message payload, but the thing on screen is the interaction, not a static blob. The responses in the spec drive what each agent can do — drag "flag impasse" out and the agents can only adopt, and you watch them forced to converge.

Dragging L3 → L2: a person leaves and a second agent arrives. Same pattern, different cast — a screen becomes an exchange. Dragging L2 → L3: the second agent collapses into "the operator settles it." Make this a real transformation, animated, not a swap of two static panels.

Hold **L4 (agents and many people)** for later. Build L1, L2, L3.

## Editing to something the library cannot support is the best moment

The simulator breaking is more instructive than it succeeding, so make the failures legible rather than preventing them:

- Drag the level to **agents only** on a pattern that needs a person, and the agent cannot run it — the exchange cannot form because a required participant is missing. Say so, in place.
- Drag a **required response** out and the mode is now incoherent — the agent flags that it can no longer do what the mode is for. (Example: take `correct` out of a Propose pattern and confirm/decline collapse into one real choice; the agent should say the checkpoint now carries no information.)
- These are the behaviour pushback made literal. Do not block the edit — let it happen and let the agent react to it. That reaction is the point.

### When it breaks, offer the way out — do not just report the break

A break is a fork, not a wall. But the right response depends on which kind of break it is, so distinguish them:

- **The same pattern is now incoherent** (a required response dragged out, a required element removed). The pattern is still the right one; it is just broken. Offer: restore what was removed, or accept it as a recorded gap. Do NOT suggest a different pattern here — switching patterns is the wrong fix for a self-inflicted hole.

- **The pattern no longer fits what you asked for** (the level changed to one the pattern cannot serve, the mode effectively changed under it). This pattern is now wrong for the spec. Here is where alternates belong: look up other patterns that serve the new mode-and-level, and offer them. "You moved this to agents-only. Pre-Action Handshake needs a person. Convergence Point and Credential Boundary live here instead — switch to one?" Switching carries over whatever slots still apply.

- **Nothing else fits.** If the new mode-and-level is a genuine gap — Request, Delegate, or any combination the catalog does not cover — say so plainly and do not manufacture a near-miss. "Nothing in the library serves a Request at agents-only yet. This is one of the gaps. You can keep shaping it as a spec for a pattern that does not exist, and export that." The empty result is a real finding, and the Markdown export of a gap spec (above) is the thing to point them at.

Use `conflicts_with` and `composes_with` from the catalog to drive this — they have been in the schema doing nothing, and this is what they are for. An alternate is a pattern that serves the spec's current mode and level; a compose suggestion is a pattern the current one pairs with when the user is adding capability rather than replacing it.

Make the alternates checkable in place: show them as options the user can preview before committing, not a forced switch. And always keep the restore-the-break path visible alongside — leaving the pattern broken on purpose, as a recorded gap, is a legitimate choice the user is allowed to make.


## Scope

- **One pattern at a time.** No composition surface, no second pattern on the canvas yet. One pattern, fully simulatable, is the whole build.
- Pick a pattern that exists at more than one level so the cast-change is demonstrable. **Convergence Point** (resolve, native L2, reaches L3) and **Pre-Action Handshake** (propose, L3) are the two to get working first; Convergence Point is the one that proves the L2 exchange.

## The data behind it

Drive everything from the pattern data you already have — modes, levels, channels, responses, triggers. The responses a mode allows, the levels a pattern reaches, its channels: all of it comes from the catalog, not from hardcoded strings in the simulator. The simulator is a renderer over the spec; changing the spec is the only way behaviour changes.

Reuse the 16 built pattern UIs as the L1/L3 surfaces. The L2 exchange is new and has to be built, but it should be built from the same components and tokens.

## Rules that still hold

- Nothing on screen is authored by you. Pattern content, responses, evidence, level notes come from the catalog. Where something is not in the data, show the honest gap, do not invent it.
- The spec sentence is assembled from the slot fields; keep them consistent, both directions.
- No model calls in this build. The agent's "behaviour" is the spec being interpreted deterministically — it is a simulation driven by data, not a model generating responses.
- Plain-language section and slot labels, per the agreed taxonomy (what the agent does, who's involved, when it happens, who sees it and where, what you can do back).

## Report back

1. Whether the 16 built pattern UIs can be driven from the spec data, or whether they are static and need adapting to re-render when a response is dragged out.
2. Which patterns have enough in the data to simulate the L2 exchange, versus which only have a human-facing UI and so only run at L1/L3.
3. What the L2 exchange needs in the data that is not there yet — the moves each agent makes are more than the current `responses` list, and that gap is worth naming before it is faked.
4. Whether step-based running reads clearly, or whether the agent's progression needs more than animation to be legible.

---

## Taking a pattern into your own workflow

A simulator nobody can act on is a toy. The payoff is that you shape a pattern here and carry it into where you actually build. Every export must reflect **the spec as the user shaped it**, not the catalog default — if they dragged a response out, it is gone from the export too. An export that silently reverts discards their work and is worse than no export.

Four targets, because people build in different places. Offer them from the pattern, each one copy-to-clipboard or download, no account or save step:

1. **The MCP call.** The `discover`/`fetch` call that fetches this pattern, with the current spec's mode, level, channel and responses as the arguments. This is the real one — it points the user's own agents at the server. Copy to clipboard.

2. **The component code.** The built pattern UI as a component the user can paste into a React/Vue project — the same one of the 16 UIs shown on the canvas, with the shaped props filled in (the responses that remain, the level, the channel). For Cursor and Claude Code this is what they paste. Copy to clipboard.

3. **A Markdown spec file.** A `.md` that describes the pattern as the user shaped it — the one-sentence spec, the mode, level, triggers, the responses that remain, and the behaviour rules (what each response does, what happens on no response). This is the file you hand to Claude Code or Cursor as context so the agent builds the pattern correctly. It is instructions-for-an-agent, not prose for a human. Download.

4. **Figma.** Push the pattern UI into a Figma file as frames, using the existing Figma integration if one is wired up; otherwise a copyable frame or an image export as a fallback. This is for the designers who will lay it out, not wire it up.

Rules for all four:

- **Carry the shaping.** Removed responses, chosen level, chosen channel, edited trigger text — all of it is in every export. The export is a snapshot of the spec on screen, not a link to the catalog entry.
- **Stamp the provenance.** Each export names the pattern and that it came from HAX Studio, and whether it is a catalog pattern or a shaped variant of one. So when it turns up in a repo later, someone can trace it back.
- **Say what is carried and what is not.** The MCP call carries behaviour; the component carries rendering; the Markdown carries both as instructions; Figma carries only the look. Label each so nobody ships a Figma frame thinking it includes the behaviour.
- **The gap case still exports.** If the user shaped a pattern for a mode the library has no pattern for (Request, Delegate), the Markdown export still works — it describes the behaviour they specified, as a brief for building something that does not exist yet. That is the most valuable export of all, because it is a spec for a missing pattern.

Add to the report-back: whether the 16 built UIs are already componentised enough to export as paste-able code with props, or whether they are page-bound and need extracting first.
