# v2: the behavior model

Pattern page copy and preview work follows the repository's
[v2 pattern page conventions](../../AGENTS.md#v2-pattern-page-conventions).

This directory is the whole of v2's data. It is a transcription of `context.md` —
the Studio redesign brief — into typed files, plus the queries the v2 pages need.
It does not import, extend, or replace `lib/patterns.ts`, which is still what v1,
the MCP server, and every pattern page read.

| File | What it holds |
| --- | --- |
| `types.ts` | `Level`, `Mode`, `Channel`, `Audience`, `Evidence`, `ModeDef`, `Pattern`, `Interaction` — section 6, field names unchanged because the MCP server will expose them |
| `modes.ts` | The nine modes, their families, responses, and the four rejected candidates — section 4 |
| `levels.ts` | Levels, channels, audiences, their labels and sentence forms, and which of them each level allows — sections 3 and 10 |
| `catalog.ts` | The 23 patterns — section 7 |
| `gaps.ts` | Empty modes, missing patterns, thin levels, judgment calls — sections 8 and 9 |
| `spec.ts` | The behavior-spec sentence: slots, composition, matching, `instantiate` — section 5 |
| `catalog.test.ts` | Validation, including the per-mode and per-level counts the document states |

## What is grounded and what is synthesis

**Grounded.** Pattern names, `source`, `merged_from`, `evidence`, level notes, and
the triggers and channels of the research-sourced entries. Those come from the
published pattern pages. Summaries for research-sourced entries are their v1
one-liners, trimmed.

**Synthesis.** Primary and secondary modes, primary levels, every spec sentence,
audiences, and the channels of the SDK entries. Five spec sentences are the
document's own worked examples, verbatim; the other eighteen were written to its
template. Section 9's list of calls that need validating is carried in
`JUDGMENT_CALLS` and rendered on the pattern pages that each one touches, so
nothing in the UI presents a synthesised decision as a finding.

The counts in `catalog.test.ts` are the guard. Change a pattern's mode or level by
hand and a test fails rather than the catalog quietly disagreeing with the
document it came from.

## What the document asks for that is not here

- **Open UI Kit.** Section 12 says all v2 UI uses `@open-ui-kit/core` and reads
  colour from `theme.palette.vars`. It is not installed: it pulls MUI 7, emotion,
  recharts, framer-motion and material-react-table, which is a dependency
  decision of its own and would land on the earlier build too. v2 is built on the
  Outshift tokens the repo already has. Three things stand in for it, each in one
  place so adopting the kit is a remap rather than a rewrite:
  - the six spec-slot accents (`--v2-slot-*`) for `accentA`–`accentF`;
  - `.v2-btn--primary` / `.v2-btn--secondary` for the kit's interactive tokens,
    replacing the site's pill CTAs everywhere inside v2;
  - `HeroParticles` reads its colours out of the stylesheet with
    `getComputedStyle` rather than taking hex values, which is the same contract
    the kit's `useTheme()` would give it.

  Every accent pair needs a contrast check when the kit does land.
- **`composes_with` / `conflicts_with`.** Fields in the model, no values anywhere.
  The document defines them and supplies none, and a composition graph invented
  here would read as a finding. The pattern page says so rather than hiding the
  empty section.
- **Pattern designs.** Section 11, steps 3–6. Capability Manifest is the first
  pattern with a context-aware preview under the conventions above. Other
  pattern pages still show each channel's *shape* carrying the opening, with a
  caption saying it is not the finished design. Their previews can be revised
  one pattern at a time.
- **The MCP server.** Section 10's alignment is documented at `/v2/mcp-server` and
  implemented nowhere. The running server still speaks v1.

## One addition beyond the document

`Pattern.v1_slugs` is not in section 6. It records which v1 pattern slugs an entry
was built from, so a v2 page can link to the research page without re-deriving the
mapping from `merged_from` prose. A test asserts every slug exists in v1 and that
all 17 are claimed exactly once.
