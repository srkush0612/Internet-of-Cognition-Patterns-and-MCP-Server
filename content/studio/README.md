# Studio content

These files are the only source of the encounter list, pattern elements, anti-patterns, entities, and
the sample scenario. **Nothing in `lib/studio` or `components/studio` invents or paraphrases this
content** — where a file is empty, the UI renders an explicit "not yet in the library" state instead.

Types for every file below live in `lib/studio/types.ts`.

## Status of what's seeded right now

Some content here is now real (grounded in the live pattern library) and some is still placeholder
authored during design exploration, explicitly **not** the team's content yet. Each file says which
below. Nothing here was fabricated to fill a gap — where I couldn't ground something in the real
library, it stays empty.

- **`encounters.json`** — 9 encounters, **unverified**. Titles, ordering, and the pattern each maps to
  came from the on-call-incident narrative, not from the research. Treat as a placeholder shape to
  validate the mechanism, not a shipped list.
- **`pattern-elements.json`** — **grounded**, but only for `signal-to-intent-handshake`. Its six elements
  (noticed / interpreted / proposed / confirm / correct / defer) are derived directly from that
  pattern's published `interactionModel`/`factChips` (`lib/patterns.ts`) and its real component
  (`components/patterns/SignalToIntentHandshake.tsx`) — not invented. The other 16 patterns have no
  elements seeded; see the report on which of them even have a structured-enough interaction model to
  derive elements from without guessing.
- **`anti-patterns.json`** — one entry, **`status: "proposed"`**, correctly. "Rubber-stamp checkpoint" is
  a name coined during design exploration for what removing `sith-correct-interpretation` reintroduces —
  no anti-pattern vocabulary exists in the library yet. The UI must never render a `proposed` anti-pattern
  as if it were verified research.
- **`entities.json`** — empty, and can't be honestly filled in yet. Continuity checking needs an entity
  placed via one pattern's elements and declared relevant to an encounter answered by a *different*
  pattern. Right now only `signal-to-intent-handshake` has elements, so there's no second pattern to
  place the same entity in — adding one here would either be inert or require inventing elements for a
  second pattern, which is exactly the kind of gap-filling this file exists to avoid.
- **`sample-scenario.json`** — the on-call incident, **partially grounded**: the premise, topology,
  attendance, and irreversibility are real; the one seeded decision (for
  `triage-proposes-before-touching`) demonstrates the `answered_with_gap` behavior using the grounded
  Signal-to-Intent Handshake elements above, but its reasoning text is mine, written to make the
  mechanism demonstrable, not sourced from a real incident. The other 8 encounters are intentionally left
  unanswered — there's no grounded content for those patterns yet. **The sample cannot yet show a
  continuity flag** (see `entities.json` above) — that's a real gap in what's demonstrable today, not an
  oversight in the seed file.

## No worked-example content

There's deliberately no `worked-examples.json` — the canvas screen embeds each pattern's own live
component (`components/patterns/pattern-registry.tsx`'s `PATTERN_STANDALONE`) instead of an authored
example. See the accompanying report for what that does and doesn't make possible today.

## Encounter-to-pattern coverage

Once a real encounter list exists, it's worth reporting the shape of the resulting matrix — cells with
exactly one pattern each would mean the encounter layer isn't earning its place. That's a content/product
review, not something this codebase decides for you.
