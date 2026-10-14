"use client";

import type { ComponentType } from "react";
import { SDK_SAMPLES } from "@/lib/v2/sdk-samples";

// Vendored HAX SDK artifacts, imported from their own files (not the barrel
// index, which re-exports the CopilotKit action layer we did not vendor).
import { HAXSourceAttribution } from "@/vendor/hax/artifacts/source-attribution/source-attribution";
import { HAXTimeline } from "@/vendor/hax/artifacts/timeline/timeline";
import { HAXThinkingProcess } from "@/vendor/hax/artifacts/thinking-process/thinking-process";
import { HAXFindings } from "@/vendor/hax/artifacts/findings/findings";
import { DiagnosticReportCard } from "@/vendor/hax/artifacts/diagnostic-report/diagnostic-report";
import { HAXDetails } from "@/vendor/hax/artifacts/details/details";
import { HAXCapabilityManifest } from "@/vendor/hax/artifacts/capability-manifest/capability-manifest";
import { HAXWorkshopCard } from "@/vendor/hax/artifacts/workshop-card/workshop-card";
import { HAXContextualExplanation } from "@/vendor/hax/artifacts/contextual-explanation/contextual-explanation";
import { HAXInlineRationale } from "@/vendor/hax/artifacts/inline-rationale/inline-rationale";
import { HAXRationale } from "@/vendor/hax/artifacts/rationale/rationale";
import { HAXForm } from "@/vendor/hax/artifacts/form/form";

/**
 * Renders a HAX SDK artifact by its upstream name, with the sample props in
 * `sdk-samples.ts`. Twelve components are vendored and render live; three, 
 * code-editor, mindmap, data-visualizer, carry heavy editor/graph/chart
 * runtimes and are shown as the SDK docs' own preview image instead.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const COMPONENTS: Record<string, ComponentType<any>> = {
  "source-attribution": HAXSourceAttribution,
  timeline: HAXTimeline,
  "thinking-process": HAXThinkingProcess,
  findings: HAXFindings,
  "diagnostic-report": DiagnosticReportCard,
  details: HAXDetails,
  "capability-manifest": HAXCapabilityManifest,
  "workshop-card": HAXWorkshopCard,
  "contextual-explanation": HAXContextualExplanation,
  "inline-rationale": HAXInlineRationale,
  rationale: HAXRationale,
  form: HAXForm,
};

const DOCS_IMAGES: Record<string, { src: string; label: string }> = {
  "code-editor": {
    src: "https://hax-design-prod-s3.s3.us-east-2.amazonaws.com/v4_sdk_code_editor_c829ba648c.png",
    label: "Code Editor",
  },
  mindmap: {
    src: "https://hax-design-prod-s3.s3.us-east-2.amazonaws.com/v4_sdk_mindmap_357455c6f9.png",
    label: "Mindmap",
  },
  "data-visualizer": {
    src: "https://hax-design-prod-s3.s3.us-east-2.amazonaws.com/v4_sdk_data_visualizer_ea095ad957.png",
    label: "Data Visualizer",
  },
};

const DOCS_SLUG: Record<string, string> = {
  "code-editor": "code-editor",
  mindmap: "mindmap",
  "data-visualizer": "data-visualizer",
};

export function hasSdkPreview(name: string): boolean {
  return name in COMPONENTS || name in DOCS_IMAGES;
}

export function SdkPreview({ name }: { name: string }) {
  const image = DOCS_IMAGES[name];
  if (image) {
    return (
      <figure className="m-0">
        {/* A plain img, not next/image: these are external, and the static
            export has no image optimiser. The runtime is the reason it is a
            picture, Monaco, @xyflow and chart.js are too heavy to vendor for
            a preview. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={`${image.label}, from the HAX SDK documentation`}
          className="w-full rounded-[10px] border border-line"
          loading="lazy"
        />
        <figcaption className="mt-2 text-xs leading-relaxed text-faint">
          Preview from the HAX SDK docs.{" "}
          <a
            href={`https://outshift.design/sdk/${DOCS_SLUG[name]}`}
            target="_blank"
            rel="noreferrer"
            className="text-ink underline underline-offset-2"
          >
            Open the {image.label} component
          </a>
          .
        </figcaption>
      </figure>
    );
  }

  const Component = COMPONENTS[name];
  if (!Component) return null;
  const props = SDK_SAMPLES[name] ?? {};
  return (
    <div className="v2-sdk-embed">
      <Component {...props} />
    </div>
  );
}
