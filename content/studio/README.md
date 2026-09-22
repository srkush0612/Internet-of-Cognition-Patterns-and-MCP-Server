# Studio content

These files are the only source of the situation list, the agent's script, pattern elements,
anti-patterns, entities, and the sample scenario. **Nothing in `lib/studio` or `components/studio`
invents or paraphrases this content.** Where a file has nothing to say, the UI renders an explicit
"not yet in the library" state and links to the pattern page instead.

Types for every file live in `lib/studio/types.ts`.

## What is grounded and what is placeholder

| File | Status |
| --- | --- |
| `situations.json` | **Unverified.** Titles, moments, ordering, the plain-language "what this answers" lines and the situation-to-pattern mapping were written during design exploration. They are seeded so the tool runs. They are not research. |
| `agent-script.json` | **Unverified**, and marked so in the file itself. The questions, the answers and the option labels are placeholder copy. Every claim that leans on the library carries a `cites` field naming the field it came from, so it can be checked. One answer is `computed` rather than authored: the coverage answer is generated from the library at render time and cannot drift from it. |
| `pattern-elements.json` | **Grounded**, for `signal-to-intent-handshake` only. Its six elements come from that pattern's published `interactionModel` and its `evidence` line quotes the sentence each was derived from. `domMatchText` values are the exact strings its live component renders. |
| `anti-patterns.json` | One entry, `status: "proposed"`. "Rubber-stamp checkpoint" is a name coined during design exploration. The library has no anti-pattern vocabulary, so the UI says the name is proposed wherever it shows it. |
| `entities.json` | One entity, **grounded in structure but not in research**: the interpretation written into situation 02 is declared to matter again in 06 and 08. Those two situations have no element that carries it, so the record reports it as a continuity gap. That gap is the honest current state, not a bug. |
| `sample-scenario.json` | **Partially grounded.** The premise and the intake answers are placeholder. The single decision on it uses real element ids and a real accepted-gap reason. |

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
