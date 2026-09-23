# Studio content

These files are the only source of the situation list, the agent's script, pattern elements,
anti-patterns, entities, and the sample scenario. **Nothing in `lib/studio` or `components/studio`
invents or paraphrases this content.** Where a file has nothing to say, the UI renders an explicit
"not yet in the library" state and links to the pattern page instead.

Types for every file live in `lib/studio/types.ts`.

## What is grounded and what is placeholder

| File | Status |
| --- | --- |
| `situations.json` | **Unverified.** Titles, moments, ordering, the plain-language "what this answers" lines, the `reason` for each pairing and the situation-to-pattern mapping were all written during design exploration. They are seeded so the tool runs. They are not research. |
| `agent-script.json` | **Unverified**, and marked so in the file itself. The questions, the answers and the option labels are placeholder copy. Every claim that leans on the library carries a `cites` field naming the field it came from, so it can be checked. One answer is `computed` rather than authored: the coverage answer is generated from the library at render time and cannot drift from it. |
| `pattern-elements.json` | **Grounded**, for `signal-to-intent-handshake` only. Its six elements come from that pattern's published `interactionModel` and its `evidence` line quotes the sentence each was derived from. `domMatchText` values are the exact strings its live component renders. |
| `anti-patterns.json` | One entry, `status: "proposed"`. "Rubber-stamp checkpoint" is a name coined during design exploration. The library has no anti-pattern vocabulary, so the UI says the name is proposed wherever it shows it. |
| `entities.json` | One entity, **grounded in structure but not in research**: the interpretation written into situation 02 is declared to matter again in 06 and 08. Those two situations have no element that carries it, so the record reports it as a continuity gap. That gap is the honest current state, not a bug. |
| `sample-scenario.json` | **Partially grounded.** The premise and the intake answers are placeholder. The single decision on it uses real element ids and a real accepted-gap reason. |

## `reason` is hardcoded for the demo

Each situation carries a `reason`, which is what the overview row answers with
under "Why this pattern for this situation?" and what the agent says as its one
line of why. These were written for the demo at the owner's instruction, and
they are placeholders: recognisable, not researched. The agent is to produce
this text later, at which point the field becomes its output.

Two things keep that honest in the meantime. The agent's caveats say the match
and its reason are both seeded rather than researched, and `whyThisPattern()`
in `lib/studio/agent.ts` still falls back, in order, to the pattern's own
`whatItSolves` from the library and then to a line saying nothing is on record,
so deleting a `reason` shows the gap rather than a blank.

Three patterns have no `whatItSolves` of their own and so nothing to fall back
to: Presence Boundary, Certainty Boundary and Convergence Point. Writing that
field is library work.

## `surfaces.json`: where a pattern shows up

Four tabs above the pattern on the canvas: **Standalone**, **In a thread**,
**In a shared space**, **In the console**. The three host surfaces come from
shells the repo already has: `PatternInboxShell` for a thread, the Acme renewal
demo for a shared space, and `PatternIncidentShell`, `PatternChangeShell` or
the platform runbook for the console.

Each pattern has exactly one host surface with a component built for it today,
named as `inContextSurface`, and the canvas opens on it. The other two are
**not built yet**, shown as unavailable.

To say a pattern does not belong on a surface at all, add it to that pattern's
`notHere` with a reason. That renders struck through, which reads differently
from unavailable on purpose: not built yet is a gap in the work, somewhere a
pattern does not belong is a finding. Nothing seeds those, because deciding
where a pattern belongs in a product is not derivable from the code.

Three of the in-context variants take no props and render fixed content, so an
edit cannot reach them: presence-boundary, authority-gradient and
memory-commitment-review. `PATTERN_INBOX_LIVE` in
`components/patterns/pattern-registry.tsx` records which do, checked against
every component signature, and the canvas says plainly that edits show on the
standalone view instead.

## The situation list is a placeholder, and the shape of it is a finding

Nine situations, each mapped to exactly one pattern. A one-to-one mapping means the situation layer is
not yet earning its place as a matching layer: it is a re-labelling of nine patterns. Worth reporting
when a real situation list exists, along with any situation that matches more than one pattern and any
pattern that answers more than one situation.

## Where the shaping surface comes from

Studio does not define its own editing surface. For a pattern with a schema in
`lib/editable-fields.ts` it embeds `PatternWorkspace`, the same editor the playground and the pattern
pages use, and streams the draft into the pattern's own live component through `resolveLivePreview`.
`lib/studio/shapeability.ts` works out which of three states a situation is in, from what is actually
in the repo:

- `annotated` element detail is authored here, and is marked onto the live component.
- `editable` the pattern has a live component and an edit schema, so a field edit updates it.
- `matched_only` the match stands, but there is nothing here to shape.

Nothing asserts how many situations are in each state. Change what the library has and the counts,
the groupings on the overview, and the agent's coverage answer all follow.
