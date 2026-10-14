# Studio change brief

**Supersedes:** `studio-implementation-brief.md` (v1, already implemented)
**Read this as a diff, not a respec.** Most of v1 stands: the three states, the no-fabrication rule, the pushback and continuity behaviours, and the Playground archive all stay as built.

**A note on naming.** Change 10 renames `Encounter` to `Situation` throughout. Sections before Change 10 use "encounter" because that is what exists in the code today, read them as describing the as-built thing that is about to be renamed.

**Why the changes:** v1 was written before anyone had read the live library at https://epbhm84q.reviewa.work. Two things turned out to be true that v1 got wrong. Every pattern already ships live components, and the library's own examples already lean toward an operations domain. Both change the build in ways worth doing now rather than later.

---

## Change 1: Drop the worked-example pipeline, embed the live components

**Biggest change. Likely deletes code.**

v1 said worked examples were authored content per pattern, and defined a `WorkedExample` schema with markup or an image. That was wrong. Every pattern page in the library already has Standalone and In context tabs with a working component.

- Remove the `WorkedExample` schema and any seeding, admin, or upload path built for it.
- On the canvas screen, render the pattern's **existing live component** beside the required-elements list, with numbered markers mapping component parts to elements.
- When a required element has been removed, the component renders with that part **visibly absent and marked removed**, struck through, amber, labelled. On the reference frame this is the single most legible thing on the screen: the "Correct interpretation" control shown as removed, next to the two that remain.
- The marker mapping (which component part corresponds to which element) is the only new content this needs, and it is a short list per pattern rather than a rendering.

If component reuse across pages is not currently possible, say so rather than reimplementing them, that is an architecture question worth surfacing, not routing around.

## Change 2: Replace the sample scenario

The meeting agent was placeholder. Replace it with the **on-call incident**, which is now the reference scenario throughout the Figma frames.

- A telemetry agent watches the fleet, a triage agent interprets what it sees, a deploy agent can act. The on-call engineer is asleep.
- Topology: a few, handing off. Duration: longer. Reversibility: not really.
- It exercises nine patterns in one night, and it gives Memory Commitment Review, the library's thinnest pattern, a real home, because the root cause is revised mid-incident and everything built on the earlier belief becomes stale.
- It also matches the domain the library's own components already use: Signal-to-Intent Handshake's component is a triage agent proposing to pause a retry job and scale payments replicas.

Everything else about the sample from v1 holds: `isSample`, read-only until copied, opens from first run, lands on the encounter map, shows at least one accepted gap and one continuity flag.

## Change 3: Derive the encounter list from the patterns

v1 left the list open and I supplied ten placeholder encounters for a meeting agent. Replace them. Each encounter should exist because a pattern in the library answers it.

The nine on the reference frames, with the pattern each maps to:

| Encounter | Pattern |
|---|---|
| The agents pick up the alert | Presence Boundary |
| Triage proposes before it touches anything | Signal-to-Intent Handshake |
| Triage isn't sure it's the retry loop | Certainty Boundary |
| Deploy wants to scale replicas | Authority Gradient |
| Telemetry and triage read the signal differently | Convergence Point |
| The root cause changes at 03:40 | Memory Commitment Review |
| The engineer comes back at 07:00 | Background Work Ledger |
| "Why did it roll back?" in the postmortem | Decision Ledger |
| Forty actions, one summary to read | Deferred Detail |

**These titles and this mapping are still mine, not the team's.** Seed them so the sample works, mark the content file as unverified, and build the 17 × N matrix as a reporting step, see "What to report back".

## Change 4: Show evidence honestly, including its limits

v1 said to display backing strength. Go further.

- Display the participant count alongside backing strength where the library has it (Convergence Point: 2, Signal-to-Intent Handshake: 3).
- Where a pattern's evidence note states a limitation, **render the limitation**. Signal-to-Intent Handshake's is that trust themes support explaining intent before acting, but the handshake step itself is inferred rather than something practitioners requested. Studio showing that is more persuasive than Studio hiding it, and it is the difference between a way to decide and a set of opinions.
- Never summarise or rewrite an evidence note in component code. Render what the library holds.

## Change 5: Anti-patterns need a status field

No anti-pattern vocabulary exists in the library yet, so everything the pushback flow shows is currently proposed.

- Add `status: proposed | in-library` to the `AntiPattern` schema.
- Render `proposed` visibly in the UI, next to the name.
- The one on the reference frames, "Rubber-stamp checkpoint," for removing the correction option from a confirm/correct/defer pattern, is my name, not the library's. Seed it as `proposed`.

## Change 6: Handle pattern readiness

The library has 17 patterns, 8 ready. v1 did not account for this.

- Carry readiness through from the library and show it.
- Decide and flag: does Studio offer not-yet-ready patterns with a marker, or withhold them? Withholding makes several encounters unanswerable. Showing them risks people building on something unfinished. This is a product call, not an implementation one, surface it.

## Change 7: Single-pattern encounters surface as library gaps

v1 said to skip the choice when only one pattern answers an encounter. Add to that: say so explicitly, as a **library gap**, no other pattern answers this yet, and if your team handles it differently that is worth writing up.

This turns a thin spot into an invitation rather than something the UI quietly hides.

## Change 8: The record reports back on the library

Add a section to the record screen: what this run revealed about the library itself.

- Anti-patterns surfaced that have no name yet.
- Encounters answered by only one pattern, which may mean a definition is too narrow.
- Thin-evidence patterns this scenario is a strong candidate to strengthen.

Studio feeding the library is a better story than Studio only consuming it, and this section is where that becomes visible.

## Change 9: Reword two of the three intake questions

"How long does it run unattended?" was asking two things at once, duration, and whether anyone is watching, and they come apart. A system can run an hour with someone watching, or finish in ten seconds at 3am with nobody there. The second is what drives the risk.

Replace with:

- **Is someone watching while it works?**, Yes, they are in it · Sometimes · No, they find out afterwards
- **Can it do things you cannot take back?**, No · Some · Yes

Topology stays as it is. The helper line under them becomes: these two decide which encounters carry the most risk, and nobody watching plus nothing reversible is the hardest combination.

Stack the two vertically rather than side by side, the longer option labels collide in two columns.

The risk rule is unchanged in shape: it is still a deterministic mapping from these answers to which encounters carry `at risk`. Only the inputs are renamed and re-scoped, so update the rule's input values, not its structure.

## Change 10: Rename `Encounter` to `Situation`, and split the screen in two

"Encounter" implies two parties meeting. It fits the first few and strains on the rest, forty actions and one summary to read is not a meeting, and the postmortem three days later is not either. "Situation" is the word the pattern form arrived with, it needs no explanation on landing, and it survives the weakest item in the list.

- Rename the `Encounter` type, its fields, routes and copy to `Situation`. Cheap now, annoying once Pattern Choice and the Canvas exist.
- Keep "decisions" as the word on the record screen. Two words for two different things is correct: a situation exists whether or not you decide; a decision is what you did about it.

**Split the old encounter map into two screens.**

**Screen 3, Situations.** The agent puts the situations forward. No patterns, no matches, no progress states, nothing rated. Nothing can be "answered" before anything has been done, and a list that arrives pre-solved removes the moment of recognition that makes the screen worth anything.

- An agent framing bar at the top, first person, stating plainly that it put these forward **from the pattern library and the research**, not guessed from the description, and that everything kept is what it uses to recommend patterns next.
- **All situations start on.** This is the load-bearing default. If the user selects from a blank list they will pick the ones they had already worried about, and the value was in the ones they had not. Default-off turns the best screen in the product into a form.
- Turning one off is a decision, not a filter: it names the consequence (which patterns drop out of consideration), asks for a reason, and keeps the reason with the scenario. Same shape as accepting a gap.
- Per row, show what it feeds, "2 patterns will be considered", so the link to the next screen is visible per situation, not just stated once.
- An "add a situation" row at the bottom. A user adding one the library has no pattern for is a library gap found in the field, and it costs almost nothing to support.

**Screen 4, Situation map.** The same list once patterns are attached, with the three states and the risk flags. This is the screen people return to.

## Change 11: Model calls: scope, and the rule that governs them

v1 said no model calls anywhere in the Studio path. Correct for v1, wrong as a permanent rule, the dev team will add them.

**The rule: a model call may phrase, never adjudicate.** It may change wording. It may never change which knowledge claims are made.

Legitimate, later:

- Writing the example line under a situation in the user's own domain. The situation is fixed; only its illustration is localised.
- Drafting the reason text when someone dismisses a situation or accepts a gap, a draft the person edits before it is kept.
- Pre-selecting the three intake answers from the free-text description, shown as a suggestion the user confirms.
- Turning the record into prose for a review document.
- Answering questions inside a situation, which is what Chat already does.

Never, at any version:

- Deciding which situations exist, or their order. Fixed from the library. A model choosing would silently omit, which is the one failure this product cannot survive.
- Generating or rewriting evidence notes, backing strength, participant counts or quotes.
- Deciding which pattern answers a situation. That is the authored matrix.
- Naming anti-patterns.
- Writing required elements for a pattern.

**Two content channels that never mix.** Library content is authoritative and never generated. Drafted content is always marked as drafted and always editable. Do not write model output into a field that holds library content, and do not render the two in the same visual treatment. The failure to design against is a model-written sentence that a user reads as research.

## Change 12: Make the situations screen teach what a situation is

Nothing on the screen currently says what a situation *is*. Someone landing cold reads nine sentences and has to induce the category. Four mechanisms, each doing different work. All four are needed; the definition alone is not enough.

**1. Define by contrast in the agent framing bar.** Abstraction does not land. The contrast does, and it is also the argument for the whole screen:

> A situation is a moment where the people and the agents have to deal with each other, and something has to happen. Not a feature you might build, but a moment that arrives whether you designed for it or not. Triage will form a low-confidence reading at 03:12. The engineer will come back at 07:00.

Definition, then two instances from the user's own system, in the same breath.

**2. Every example line is a timestamped instant.** 03:08. 03:11. 03:12. 03:40. 07:00. The regularity teaches the shape by repetition, and it makes the list read as one night rather than a checklist. Keep this consistent: one concrete moment per situation, not a description of a category.

**3. Rows expand to three fields.** A person who does not get it will click. Expanding shows:

- **What has to be decided** at that moment.
- **If nobody decides** what happens by default. This is the real definition, delivered by demonstration: for the handshake situation it is "it acts on its own reading, and the approval you logged says nothing about whether the reading was right."
- **Why this is on the list**, which is where "why these nine?" gets answered per row, since the rail cannot carry nine explanations.

**4. A rail card stating the three criteria.** What makes something a situation and not a feature:

- *It happens on its own.* You do not choose to have it. You only choose what happens when it does.
- *A person is involved.* Something has to reach someone, be withheld from them, or wait for them.
- *A pattern answers it.* If the library has nothing to say about it, it is not on this list. It is a gap.

The third criterion is the honest boundary and should not be softened. It is also the rule that decides whether a user-added situation joins the list or gets logged as a library gap.

### The agent's voice

First person, and specific about provenance: it **put these forward from the pattern library and the research**, not guessed them from the description. It must never imply it generated the list, because it did not, and because a suggested list is contestable while a guessed one is worthless.

It should also state the consequence plainly: everything kept is what it uses to recommend patterns next.

### Two more things on that screen

**Per row, show what it feeds**, "2 patterns will be considered", so the link to the next screen is visible per situation rather than stated once in a footer. A dismissed row reads "not considered".

**Dismissing a situation names what drops out.** Not a generic warning. Name the patterns: turning off "telemetry and triage read the signal differently" drops Convergence Point, which is the only pattern in the library answering it. Then ask for the reason and keep it.

### Consistency check

The situation map that follows must agree with what was kept. If eight of nine are kept, it says eight, with the dismissed one shown as dismissed rather than missing. Two screens disagreeing on the count is the kind of thing that gets noticed in a demo.

## Change 13: Copy style: no em or en dashes

Not a preference, a standard. No em dashes or en dashes anywhere in UI copy, seeded content, empty states, or code comments. Rewrite the sentence rather than substituting another mark: a full stop, a comma, a colon, or "because" almost always reads better and forces the clause to stand on its own.

Where a dash was separating a label from a value, use a full stop or a middle dot. Where it was doing parenthetical work, either commas or a separate sentence.

---

## Decisions on the two questions you raised

**Not-ready patterns: show them, with a marker.** Withholding them makes encounters unanswerable, which breaks the claim the encounter map rests on. An encounter that leads nowhere is worse than one that says the pattern for it is not built yet.

Keep readiness and evidence strength as **two separate badges**. Readiness is build state (a pattern with no component). Evidence strength is research state (thin, moderate). A pattern can be ready and thin, or unready and well-evidenced, collapsing them into one signal is the sort of flattening this library exists to avoid.

Where **every** pattern answering an encounter is not ready, say so on the encounter map. That is a finding worth surfacing, not a gap to hide.

**Embedding: do not modify the pattern components.** Render each component untouched and draw Studio's markers and a "this element is missing here" callout as an **annotation overlay on top of the embed**.

Reasoning: the components are the library's own shipping artifacts. Making nine of them Studio-aware couples them to Studio, and every future pattern then has to implement a Studio prop to be embeddable, a permanent tax for one screen's legibility. The removal signal is already carried by the elements list and the consequence panel, so the overlay reinforces rather than carries it.

One exception worth the detour: if a **single shared wrapper** can take a suppressed-elements list keyed by stable element ids, defined once rather than edited into nine files, that is better than the overlay and worth doing. Bespoke edits to nine component files are not. If neither is cheap, ship the overlay and note it.

---

## Unchanged, do not rework

- The route structure, now seven screens rather than six (Change 10 splits the map).
- Three situation states: `unanswered`, `answered`, `answered with a gap`, with at-risk independent of state.
- Three intake questions in total, and topology changing difficulty rather than membership. Two of the three are reworded in Change 9; the structure is the same.
- Pushback on deletion and live continuity checking, including the not-designed versus not-reachable distinction.
- No model calls in the Studio path **for v1**. See Change 11 for what becomes legitimate later and the rule that governs it.
- Playground archived, not deleted, still reachable at its path.
- The no-fabrication rule and the "not yet in the library" empty states.

## What to report back

1. Whether the live pattern components can be embedded in Studio as-is, or what stands in the way.
2. The 17 × 9 matrix of patterns against these situations. If most cells hold exactly one pattern, the situation layer is not earning its place, that finding matters more than shipping the screen, and should come back before more content is seeded.
3. Which patterns have a published interaction model precise enough to derive required elements from, as Signal-to-Intent Handshake does. If most do, the content bottleneck is much smaller than assumed.
4. Anything in the v1 build that the incident scenario breaks and this brief has not covered.
5. Whether any of the nine situations fails the first criterion in Change 12 (it happens on its own). "Forty actions, one summary to read" is the one to look hardest at, since the summary existing at all is arguably a design choice. If it fails, reword it to the thing that does arrive on its own: someone has to take in what happened.

---

# How to work through this

One commit per step, in this order. Stop after step 1 so I can look before you carry on.

**1. Rename `Encounter` to `Situation` everywhere.** Types, fields, routes, seeds, copy, tests. No behaviour change in this commit. Do this first because it touches everything and gets worse once Pattern Choice and the Canvas exist. Save this brief to `docs/studio-change-brief.md` in the same commit.

**2. Copy sweep for dashes.** Remove every em dash and en dash from UI copy, seeded content, empty states and code comments. Rewrite the sentence rather than swapping in another mark. Change 13.

**3. Split the situation list into two screens.** Changes 10 and 12. Screen 3 is situations only: no patterns, no matches, no progress states. Screen 4 is the same list with patterns attached. The details that carry the value are the default-on rule, naming which patterns drop when a situation is turned off, the expandable rows, and the agent's voice.

**4. Phase 2: Pattern Choice and the Canvas.** Use the decisions already in the brief. Show not-ready patterns with a marker, keep readiness and evidence strength as separate badges, and do not modify the pattern components.

# Rules that override everything else

- **Nothing on screen is written by you.** Pattern names, evidence, backing strength, participant counts and quotes come from the library. Where authored content does not exist yet, render an explicit "not yet in the library" state and log what was missing. An invented sentence is a worse bug than a crash, because it is the exact failure this product exists to prevent.
- **The situation list, its order, and the situation-to-pattern mapping in this brief are placeholders**, written during design, not verified research. Seed them so the sample runs, mark the content file unverified, and do not treat them as truth.
- **No model calls in this work.** When they are added later the rule is: a model call may phrase, never adjudicate.
- **If anything here conflicts with what is actually in the code or the library, stop and tell me** rather than picking an interpretation. This brief was written from the Figma frames and the public pattern pages, not from the repo, so there will be places where it is wrong about what exists.

# Report back

After step 1, the rename diff summary. Then separately:

1. Whether the live pattern components can be embedded in Studio as-is, or what stands in the way.
2. The matrix of the 17 patterns against the 9 situations. If most cells hold exactly one pattern, say so before seeding more content, because it means the situation layer is not earning its place and that finding matters more than shipping the screen.
3. Which patterns have a published interaction model precise enough to derive required elements from, the way Signal-to-Intent Handshake does. If most do, the content work is much smaller than assumed.
4. Whether any of the nine situations fails the first criterion in Change 12, that it happens on its own. "Forty actions, one summary to read" is the one to look hardest at.
5. Anything in the v1 build that the incident scenario breaks and this brief has not covered.
