# Vendored HAX SDK artifacts

The HAX SDK ships components by copying source into your repo (`hax add
artifact <name>`), not as a runtime import. These are those copies, taken by
hand because the usual CLI step was not run here.

- **Source:** https://github.com/outshift-open/hax
- **Pinned commit:** `e9f19b02398d7430a8de675baf3d4d803ce585bf`
- **Package:** `@outshift/hax` (the CLI; the components themselves are source)

## Re-syncing

To update any artifact to the latest upstream, run the official CLI in the
project root and re-apply the two deviations below:

```bash
npx @outshift/hax add artifact <name>
```

## What was copied, and the only changes made

Files are byte-for-byte upstream **except import paths**, which were rewritten
from `@/lib/utils` and `@/components/…` to `@/vendor/hax/…` so they resolve
inside this folder instead of the host app. Nothing else in a component file
was touched.

Two deliberate omissions keep CopilotKit out of the build, which the artifacts
do not need in order to render:

1. **`lib/utils.ts` is trimmed to `cn` only.** Upstream also exports
   `zodToCopilotParameters` / `createLoggingWrapper`, which import
   `@copilotkit/shared`. The artifacts call neither. `cn` is unchanged.
2. **Per-artifact `action.ts`, `index.ts` and `description.ts` were not
   copied.** Those carry the `use…Action` CopilotKit hook and its re-exports —
   the live agent wiring. The visual component and its `types.ts` are all a
   pattern preview needs. Import the component from its own file, e.g.
   `@/vendor/hax/artifacts/source-attribution/source-attribution`.

## Artifacts present (12 of 15)

capability-manifest · contextual-explanation · details · diagnostic-report ·
findings · form · inline-rationale · rationale · source-attribution ·
thinking-process · timeline · workshop-card

The other three — **code-editor** (Monaco), **mindmap** (@xyflow/react +
elkjs) and **data-visualizer** (chart.js) — were not vendored. They are shown
on their pattern pages as the SDK docs' preview image instead, to avoid
pulling heavy editor/graph/chart runtimes into the bundle.

## Styling

Component styles resolve through the shadcn-style Tailwind tokens
(`bg-card`, `text-muted-foreground`, …) that the bridge in `app/v2.css` and
`tailwind.config.ts` maps onto the Outshift palette. The component files
themselves carry no hard-coded colours to change.
