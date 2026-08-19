# Pattern Library — Project Context (for Claude chat)

Paste this whole file into a new Claude conversation to continue the work.
Claude in chat cannot see the repo, so when you ask for a change, also paste the
current contents of the file(s) named below. This doc explains the project, the
conventions to hold, what is built, the design direction, and the recipe for
adding a pattern.

---

## 1. What this project is

A **Next.js pattern library** that documents 16 agent-UX interaction patterns for
trustworthy human-agent systems. The patterns are grounded in practitioner
research (14 interviews across two studies) and cross-referenced with a set of
HAX "Persistent Coordination Components." Each pattern gets a detail page with a
live UI mockup, so the library doubles as a design-review artifact, not just a
written catalog.

- Framework: Next.js 15.5 (App Router), TypeScript, Tailwind, plain CSS modules
  in `app/*.css`. React server components by default (mockups are static; no
  `"use client"` unless interaction is needed).
- Run locally: `npm install` then `npm run dev` → http://localhost:3000
- Typecheck: `npx tsc --noEmit -p tsconfig.json` (run this after any change)
- Routes: `/` (maturity grid), `/patterns/[slug]` (detail: About / Standalone /
  In an agent inbox / Evidence tabs), `/gallery` (token-themed variant).

---

## 2. File map (the ones that matter)

- `lib/patterns.ts` — **single source of truth.** The `Pattern` type and the
  array of all 16 patterns (copy, evidence, backing strength). Also
  `positioningFindings` (GTM findings with no component) and helper functions.
- `components/PatternDetailShell.tsx` — renders the detail page. Has bespoke
  hand-written About copy for `presence-boundary` and `credential-boundary`; all
  other patterns render from structured copy fields (see below). Also renders the
  research-backing summary in the Evidence section.
- `components/patterns/pattern-registry.tsx` — maps a slug to its
  `PATTERN_STANDALONE` and `PATTERN_INBOX` components. `hasDesignReady(slug)` is
  true when a slug is in `PATTERN_STANDALONE`; that drives the "Ready" tag.
- `components/patterns/*.tsx` — one file per bespoke pattern component.
- `components/patterns/PatternComponentCard.tsx` — shared card chrome
  (label bar, icon + title + context, body, footer). Most standalone components
  wrap their body in this.
- `components/patterns/PatternInboxShell.tsx` — reusable "agent inbox" embed:
  agent sidebar + a message bubble + the embedded compact component. Use this for
  every pattern's inbox demo.
- `components/patterns/icons.tsx` — small SVG icon set (LockIcon, EyeIcon,
  LightningIcon, FilterIcon, StarIcon, etc.).
- `app/pattern-components.css` — all bespoke component CSS. Design tokens live in
  its `:root` block. Add new pattern styles here.
- `app/globals.css` — page/detail styles, plus `.backing-summary` and evidence
  styles.

---

## 3. The `Pattern` type (in `lib/patterns.ts`)

```ts
export type BackingStrength = "Strong" | "Moderate" | "Thin" | "None";
export type Pattern = {
  slug: string;
  title: string;
  oneliner: string;
  explanation: string;   // legacy "About" callout
  example: string;       // legacy one-line interaction example
  hasReferenceDesign?: boolean;
  evidenceStatus?: "pending";
  evidence?: { quote: string; attribution: string }[];
  pairsWith?: string;    // slug of a sibling pattern
  note?: string;
  // Structured detail-page copy. When present, the About tab renders these.
  whatItSolves?: string;
  interactionModel?: string;
  whereItEmbeds?: string;
  factChips?: string[];
  // From the Combined Research + Design Synthesis workbook.
  backingStrength?: BackingStrength;
  participants?: string;
  researchNote?: string;
};
```

`getPatternStatus` returns "Grounded" if there is >=1 evidence quote, else
"Unverified". `backingStrength` is a richer, separate signal from the research
synthesis and is shown in the Evidence section via `.backing-summary`.

---

## 4. Locked conventions (hold all of these)

- **Domain for all sample content: network management / dev-ops.** Deploys, EKS
  clusters, router firmware, rollbacks, maintenance windows, change tickets.
  Recurring props: `edge-router-7`, `svc-payments`, firmware `4.11/4.12`,
  `CHG-2231`, PR `#4821`.
- **The agent is generic.** Refer to it as "Agent" or a role ("Rollback agent",
  "Triage agent", "Deploy agent"). No named persona, no logo.
- **No em dashes anywhere** in UI copy or prose. Use commas, colons, periods.
- **Copy voice:** concise, outcome-tied, plain. Audience is a design/product team.
- **Light mode**, tokens from `pattern-components.css :root`. Key colors:
  accent blue `#3b5ec6`, success green `#16a34a`, warning amber `#b45309`,
  boundary red `#e85d3f`, borders `#e5e9f0`. Cards radius 18px (14px compact).
- **Every standalone component takes a `compact` prop** and shrinks type/padding
  for the inbox embed. Add `--compact` CSS variants.
- After any change, run `npx tsc --noEmit` and expect exit 0.

---

## 5. Status — 6 of 16 patterns have bespoke UI + full copy

Done (in `pattern-registry.tsx`, render a real component + structured copy):
1. Presence Boundary — orb + 5-step state track + scope panel (pre-existing)
2. Signal-to-Intent Handshake — three-row "noticed / reading / plan" card
   (built this session; **redesign pending**, see section 7)
3. Background Work Ledger — tagged timeline (queried/assumed/acted/result) +
   open-question callout
8. Dependency and Lineage View — citation chain + disputed-root flag +
   blast-radius line
9. Authority Gradient — per-area autonomy rows, suggest→act-alone, risk-colored
11. Credential Boundary — split-wall two-agent reasoning (pre-existing)

Remaining 10 (still fall back to a generic card + example line, need copy + UI):
- assumption-surface
- memory-commitment-review (has `hasReferenceDesign` flag but no component yet)
- concurrent-workspace-awareness
- review-as-dialogue
- shared-cognitive-state (has `hasReferenceDesign` flag but no component yet)
- disclosure-gradient
- decision-ledger
- proposed-commits
- deferred-detail
- convergence-point
- certainty-boundary

---

## 6. Design direction (decided, apply going forward)

The goal is that patterns stop looking the same. Instead of every pattern being
the same white card, give each one a **visual archetype that matches its idea**,
and layer a **color identity per pattern family** on top. Candidate archetypes:

- Graph canvas (dotted grid, nodes + edges) → Dependency & Lineage,
  Shared Cognitive State
- Instrument panel (labeled meters/tracks, risk-colored) → Authority Gradient,
  Certainty Boundary
- Diff / before-after (two facing panels) → Memory Commitment Review,
  Review as Dialogue
- Timeline scrubber (horizontal playhead) → Deferred Detail, Background Ledger
- Split wall → Credential Boundary (already)
- Orb + state track → Presence Boundary (already)
- Two live cursors on one doc → Concurrent Workspace Awareness
- Nested progressive reveal → Disclosure Gradient
- Color-zoned workflow map (green fixed → amber → red generative) →
  Certainty Boundary

Family color idea: trust/observation = blue, audit/lineage = amber, boundaries =
red, autonomy = green, memory = violet. Keep the "one system" feel; do not make
16 unrelated one-offs.

---

## 7. Immediate next task: redesign Signal-to-Intent Handshake

The pattern is: the agent states what it **noticed**, what it **thinks that
means** (the uncertain leap, with confidence), and what it **proposes to do**,
then waits for confirm/correct before any irreversible step. The current UI is
three stacked rows. The chosen redesign is **"Swappable reading"**:

- The interpretation is the one editable pivot. Show the agent's chosen reading
  selected, with the alternative causes it also considered listed below it
  (e.g. "Retry storm" [selected], "Capacity shortfall", "Upstream dependency
  down").
- Picking a different reading re-derives the proposed action shown underneath
  ("→ so I'll pause retries, scale 3→6").
- Keep a small "held until you respond" lock cue above the action.
- This makes *correcting the inference* a real, low-effort interaction instead of
  a "Correct" button that dumps the user into typing.

Implement it as the standalone body (with `compact` variant) plus the inbox demo
via `PatternInboxShell`. If it needs the selector to actually toggle, make the
component `"use client"` and hold the selected reading in `useState`.

---

## 8. Recipe: add or upgrade a pattern

1. Create `components/patterns/<Name>.tsx` exporting `<Name>` (standalone,
   `{ compact }: { compact?: boolean }`) and `<Name>Inbox`. Wrap the standalone
   body in `PatternComponentCard`; build the inbox with `PatternInboxShell`
   (pass 3 agents, an active agent, a message, and the compact component as
   children).
2. Register both in `components/patterns/pattern-registry.tsx`
   (`PATTERN_STANDALONE` and `PATTERN_INBOX`, keyed by slug).
3. In `lib/patterns.ts`, add `whatItSolves`, `interactionModel`,
   `whereItEmbeds`, and `factChips` to that pattern object.
4. Add the component's CSS to `app/pattern-components.css`, including
   `--compact` variants, using the `:root` tokens.
5. No em dashes; network-ops domain; generic agent.
6. Run `npx tsc --noEmit -p tsconfig.json` and confirm exit 0.

When you register a slug in `PATTERN_STANDALONE`, its card automatically gets the
"Ready" tag and its detail page renders the real component instead of the
fallback.

---

## 9. How to work with Claude in chat

- Tell Claude which pattern you are working on and paste this file first.
- Then paste the current contents of the files it needs to edit (usually
  `lib/patterns.ts` for copy, `pattern-registry.tsx`, the target component file,
  and the relevant slice of `pattern-components.css`).
- Ask for full file contents or exact diffs back, then paste them into your repo
  in Cursor and run `npm run dev` + `npx tsc --noEmit` to verify.
