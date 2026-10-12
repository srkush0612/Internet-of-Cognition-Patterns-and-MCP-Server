# V2 pattern page conventions

These rules apply when writing or changing a pattern in `lib/v2/catalog.ts`, its
page in `app/(v2)/v2/patterns/[id]/`, or its preview in `components/v2/`.
Work through patterns one at a time; use Capability Manifest as the first
completed example of this structure, not as a source of content for other patterns.

## Give each section one job

- **Hero summary:** Define the pattern in one plain sentence. Do not repeat it in
  a separate reader-facing "In one sentence" section. Give the hero editorial
  scale and a restrained Outshift color wash; keep content readiness labels
  out of the primary reading path.
- **Section navigation:** Put sticky jump links directly below the hero, beneath
  the site header. Link only to sections actually rendered, keep every
  destination reachable in one scrollable row on a narrow viewport, show the
  active section, and offset anchor targets so their headings clear both bars.
  Animate the active indicator and reveal sections as they enter view. Keep
  content visible without scripting and disable motion for reduced-motion users.
- **What it solves:** State the need and the outcome for the reader. Lead with
  what the pattern enables, then explain constraints or failure cases when they
  matter. Use a short unboxed editorial statement, separate from the interaction
  text. Keep it distinct from the hero summary and short enough to scan.
- **Behavior spec:** Show the exact authored `spec` sentence in a quiet section
  after "Who is involved" and before "How it looks". Keep its six slots
  distinguishable without making the sentence
  a large headline or card. Put the slot key and supporting facts (when, what
  the agent does, and what the receiver can do) in an expandable detail area
  within the section, as labeled rows rather than separate cards.
- **How the interaction works:** Describe the information or action sequence,
  states, and changes over time in its own unboxed section. Do not restate the
  problem, summary, or behavior sentence. Author three concise, pattern-specific
  `interactionSteps` in the catalog and show them as a horizontal sequence on
  wide screens that stacks vertically on narrow screens. Keep the longer
  `interactionModel` accurate for other consumers, but do not repeat it as a
  paragraph on the page.
- **What the agent does:** In the behavior-spec facts, explain the pattern's
  mode in terms of this pattern. Account for a secondary mode where one exists.
- **When it happens:** In the behavior-spec facts, name specific trigger moments,
  including meaningful changes after initialization.
- **Who is involved:** Consider all four v2 levels. Show a checkmark only where
  the pattern applies and explain what changes at each one. Choose the simplest
  level where the pattern works as primary. Use the same full-width, four-row
  comparison for every pattern, with the level label and description in aligned
  columns. Name the relevant person, agent, or team in each applicable row;
  do not add a separate audience footer.
- **What the receiver can do:** In the behavior-spec facts, name concrete
  decisions or actions supported by the pattern. Do not imply that a preview
  control works when it is only visual.
- **How it looks:** Show the pattern inside the surface where it appears.
  Placement belongs in the preview, not a separate "Where it appears" paragraph.
  Each channel tab must depict that channel: chat inside a conversation, settings
  inside a setup or settings view, shared UI inside its host, and agent-facing
  channels as structured data. Let the example be the visual focus; use a single
  contextual stage and concise numbered preview notes tied to visible behavior.
  Label the notes as explanation outside the rendered pattern UI.
  Do not relabel the same standalone card for different channels.
- **Capability Manifest preview:** Show the full capability list in Settings, a
  compact summary with a working reveal in Chat, and the same facts as structured
  data in State signal. Put connection status beside the agent name, derive
  capability counts from the sample, scope read-only language to database work,
  and keep approval requirements informational unless the preview implements an
  actual approval action. Let the Settings list wrap into balanced columns when
  space permits, while keeping one readable column at narrow widths. In Chat,
  identify the agent turn with its avatar beside the reply.
- **Example:** Do not add a separate Example section to the pattern page. If an
  example appears elsewhere in Studio, it must instantiate the authored behavior
  spec and agree with the preview's names, states, and permissions.
Use a consistent page spine: hero, jump navigation, what it solves, interaction,
levels, behavior spec, preview. Short prose stands on its own;
cards contain structured comparisons, previews, or code. Omit a section when
the pattern lacks distinct content for it. Do not leave a single card stranded
in one column of a two-column grid.
Align every section heading to the same left edge of the page container and use
one heading type style across the spine; vary the content treatment below the
heading instead of shifting or resizing individual headings.

Match the HAX site's hierarchy with spacious typography, a soft ambient color
wash, restrained borders, and a large interactive example. Use Open UI bridge
tokens and semantic status colors in the preview. Reserve the six spec-slot
accents for the behavior sentence and its key.

## Make previews responsive

- Design the preview for its available container width and the viewport. At
  narrow widths, let headers and tags wrap, stack secondary details, and keep
  capability states, alerts, and connection information readable.
- Preserve the information hierarchy on mobile. Reflow the component instead
  of shrinking a desktop screenshot or hiding important states. Avoid horizontal
  overflow in the preview and its surrounding page.
- Use the v2 Open UI style token bridge in `app/v2.css` (`--sh-*`) and semantic
  state tokens for surfaces, text, borders, success, warning, and error. The kit
  itself is not installed. Do not add hard-coded SDK colors to v2 previews.
- Use sample fields and status values accepted by the underlying component
  schema. The preview, example, and catalog copy must describe the same behavior.
- Inspect the rendered pattern at a wide and a narrow viewport after changing
  its preview. Check the actual chat, settings, and agent-facing variants that
  the pattern declares.
