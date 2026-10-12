"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AUDIENCE_LABEL,
  CHANNEL_FACING,
  CHANNEL_LABEL,
  LEVEL_LABEL,
} from "@/lib/v2/levels";
import { MODE_LABEL, getMode } from "@/lib/v2/modes";
import { componentFor, renderingForChannel, componentForSlug } from "@/lib/v2/renderings";
import { SdkPreview, hasSdkPreview } from "@/components/v2/SdkPreview";
import { CapabilityManifestPreview } from "@/components/v2/CapabilityManifestPreview";
import { PresenceBoundaryPreview } from "@/components/v2/PresenceBoundaryPreview";
import { ActivityRecordPreview } from "@/components/v2/ActivityRecordPreview";
import { DeferredDetailPreview } from "@/components/v2/DeferredDetailPreview";
import { DisclosureGradientPreview } from "@/components/v2/DisclosureGradientPreview";
import { LineageViewPreview } from "@/components/v2/LineageViewPreview";
import { SDK_SAMPLES } from "@/lib/v2/sdk-samples";
import type { CapabilityManifestData } from "@/vendor/hax/artifacts/capability-manifest/types";
import { getPattern as getResearchEntry } from "@/lib/patterns";
import type { Channel, Pattern } from "@/lib/v2/types";

const MANIFEST_NOTES = {
  settings_panel: [
    { title: "Capability states", text: "Each capability shows what the agent can do in this session." },
    { title: "Approval boundary", text: "Pending and restricted work is visible before someone relies on it." },
    { title: "Live conditions", text: "The rate alert and connection state qualify what is available now." },
  ],
  chat_ui: [
    { title: "In the conversation", text: "The agent introduces its manifest where the person is already working." },
    { title: "Clear limits", text: "Approval and read-only conditions remain visible in the reply." },
    { title: "Current status", text: "The alert and connection state travel with the manifest." },
  ],
  state_signal: [
    { title: "Agent-readable", text: "A peer agent receives structured capability and status fields." },
    { title: "Same boundaries", text: "The signal preserves enabled, pending, and restricted states." },
    { title: "Changes over time", text: "Alerts and connection status can update as conditions change." },
  ],
} as const;

const AUTHORITY_NOTES = {
  settings_panel: [
    { title: "One level per area", text: "Each row sets the autonomy ceiling for one workflow, rather than changing the whole agent." },
    { title: "Risk is visible", text: "The risk tone and current level sit together so the tradeoff is legible before work starts." },
    { title: "Adjustable ownership", text: "The origin label shows who set the level, and each row can be tightened or loosened in place." },
  ],
  chat_ui: [
    { title: "Boundary in context", text: "The conversation shows where the agent reached its authority boundary during work." },
    { title: "Specific decision", text: "The operator responds to the workflow that needs a decision instead of changing global access." },
    { title: "Same policy", text: "The decision refers back to the standing per-area level configured in Settings." },
  ],
  state_signal: [
    { title: "Agent-readable policy", text: "Each workflow area carries its current autonomy level and risk tone as structured state." },
    { title: "Origin is preserved", text: "The signal records whether the agent or operator set the current level." },
    { title: "Boundary state", text: "A consuming agent can see when a workflow needs an operator decision." },
  ],
} as const;

const PRESENCE_NOTES = {
  chat_ui: [
    { title: "Current activity", text: "The agent's state and task stay beside its reply." },
    { title: "Visible boundary", text: "Reveal observation scope, action scope, and review requirement." },
    { title: "Scope decision", text: "Narrow or widen the scope and see the updated boundary." },
  ],
  shared_ui: [
    { title: "One agent at a time", text: "The expanded strip belongs to the selected agent in the workspace." },
    { title: "Current reach", text: "Observation and action permissions are shown separately." },
    { title: "Attributed change", text: "The boundary records who made the latest change." },
  ],
  state_signal: [
    { title: "Agent-readable state", text: "Peers receive activity and scope as structured data." },
    { title: "Review condition", text: "The requirement to review before applying changes travels with the signal." },
    { title: "Change attribution", text: "The signal includes who last changed the boundary." },
  ],
} as const;

const ACTIVITY_RECORD_NOTES = {
  chat_ui: [
    { title: "In the agent turn", text: "The record sits with the update in the incident conversation." },
    { title: "Events stay distinct", text: "An assumption is labeled separately from a tool action and its result." },
    { title: "Answer in context", text: "The open question accepts an answer in this preview; no production action is implied." },
  ],
  shared_ui: [
    { title: "History persists", text: "The run view keeps the timeline available after the conversation." },
    { title: "Inspect a step", text: "Expand an event to see the tool, artifact, or evidence attached to it." },
    { title: "Resolve the open item", text: "Add an owner answer to the pending sign-off question." },
  ],
} as const;

const DEFERRED_DETAIL_NOTES = {
  chat_ui: [
    { title: "Open decision", text: "Evaluation names the capacity decision that cannot yet be made." },
    { title: "Reason and evidence", text: "The pilot supplies the traffic measurement the earlier phase lacked." },
    { title: "Phase gate", text: "The decision and next owner change when the rollout gate is reached." },
  ],
  shared_ui: [
    { title: "Program context", text: "The decision gate stays inside the migration workspace." },
    { title: "Deferred commitment", text: "The reason for waiting remains attached to the capacity decision." },
    { title: "Handoff", text: "The owner and next gate show who can move the process forward." },
  ],
} as const;

const DISCLOSURE_GRADIENT_NOTES = {
  chat_ui: [
    { title: "Outcome first", text: "The agent reports the incident result in its conversation turn." },
    { title: "Progressive depth", text: "Open the rationale, then the agent handoffs, then the event trace." },
    { title: "Same incident", text: "Each layer explains the Payments API incident shown in the thread." },
  ],
  shared_ui: [
    { title: "Inside the incident workspace", text: "The result sits in its incident record beside the workspace navigation." },
    { title: "Inspect when needed", text: "Reveal the same reasoning, coordination, and trace without leaving the record." },
    { title: "Reviewable history", text: "The event sequence remains attached to the resolved incident." },
  ],
} as const;

const LINEAGE_VIEW_NOTES = {
  shared_ui: [
    { title: "Root output", text: "The disputed RCA is identified with its author and last verified time." },
    { title: "Dependency paths", text: "The remediation plan leads to the change ticket; the status page draft cites the RCA directly." },
    { title: "Shared impact", text: "The incident view summarizes affected teams and decisions for review." },
  ],
} as const;

/**
 * One tab per channel the pattern travels through.
 *
 * Each tab depicts the channel carrying the pattern. Completed patterns can
 * provide their own contextual rendering; unfinished ones use a labeled
 * channel shape until that design is ready.
 */
export function ChannelPreview({ pattern, compact = false }: { pattern: Pattern; compact?: boolean }) {
  const [active, setActive] = useState<Channel>(pattern.channels[0]);

  const variants = pattern.variants ?? [];
  const params = useSearchParams();
  const requested = params.get("variant");
  const [variantId, setVariantId] = useState<string>(
    () =>
      variants.find((v) => v.id === requested)?.id ??
      variants.find((v) => v.default)?.id ??
      variants[0]?.id ??
      "",
  );
  const variant = variants.find((v) => v.id === variantId);
  const mode = getMode(pattern.mode.primary);
  const responses = pattern.responses ?? mode.responses;

  const trigger = pattern.triggers[0] ?? "";
  const audience = pattern.audience[0];

  const channelDesign = renderingForChannel(pattern.id, active);
  const variantDesign = variant?.rendering
    ? componentForSlug(variant.rendering, active)
    : null;
  const design = variant ? variantDesign : channelDesign;
  const Design = design ? componentFor(design) : undefined;

  // A live SDK component shows when the active variant names one, or, for a
  // pattern with no variants, when the pattern's own implementation does.
  // Only on human-facing channels: an agent-to-agent payload stays the
  // headless record. An ioc variant's v1 design (above) takes precedence.
  const sdkName =
    variant?.sdk_component ??
    (variants.length === 0 ? pattern.implementation?.sdk_component : undefined);
  const showSdk =
    !design &&
    Boolean(sdkName) &&
    hasSdkPreview(sdkName as string) &&
    CHANNEL_FACING[active] === "human";
  const showManifest =
    pattern.id === "capability-manifest" &&
    (active === "settings_panel" || active === "chat_ui");
  const showManifestSignal =
    pattern.id === "capability-manifest" && active === "state_signal";
  const previewNotes = compact ? undefined : pattern.id === "activity-record"
    ? ACTIVITY_RECORD_NOTES[active as keyof typeof ACTIVITY_RECORD_NOTES]
    : pattern.id === "deferred-detail"
    ? DEFERRED_DETAIL_NOTES[active as keyof typeof DEFERRED_DETAIL_NOTES]
    : pattern.id === "presence-boundary"
    ? PRESENCE_NOTES[active as keyof typeof PRESENCE_NOTES]
    : pattern.id === "capability-manifest"
    ? MANIFEST_NOTES[active as keyof typeof MANIFEST_NOTES]
    : pattern.id === "disclosure-gradient"
      ? DISCLOSURE_GRADIENT_NOTES[active as keyof typeof DISCLOSURE_GRADIENT_NOTES]
    : pattern.id === "authority-gradient"
      ? AUTHORITY_NOTES[active as keyof typeof AUTHORITY_NOTES]
    : pattern.id === "lineage-view"
      ? LINEAGE_VIEW_NOTES[active as keyof typeof LINEAGE_VIEW_NOTES]
      : undefined;
  // Named by the entry it was drawn as, which for a renamed or merged
  // pattern is not the name at the top of this page.
  const researchName =
    design && design.slug !== pattern.id
      ? getResearchEntry(design.slug)?.title
      : null;

  return (
    <div>
      <div className={previewNotes || compact ? "v2-preview-tabs" : "flex flex-wrap gap-2"}>
        {pattern.channels.map((channel) => (
          <button
            key={channel}
            type="button"
            className={previewNotes || compact ? "v2-preview-tab" : "v2-resp"}
            data-tone={channel === active ? "primary" : undefined}
            aria-pressed={channel === active}
            onClick={() => setActive(channel)}
          >
            {CHANNEL_LABEL[channel]}
          </button>
        ))}
      </div>

      {variants.length > 0 ? (
        <div className="mt-4">
          <p className="v2-eyebrow mb-2">
            {pattern.variant_axis ?? "Variants"}
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="v2-resp"
                data-tone={entry.id === variantId ? "primary" : undefined}
                aria-pressed={entry.id === variantId}
                onClick={() => setVariantId(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className={`v2-preview mt-4${previewNotes || (compact && pattern.id === "capability-manifest") ? " v2-preview--manifest" : ""}`}>
        {pattern.id === "lineage-view" ? (
          <div className="v2-preview__frame v2-preview__frame--lineage"><LineageViewPreview /></div>
        ) : pattern.id === "disclosure-gradient" ? (
          <div className="v2-preview__frame v2-preview__frame--disclosure"><DisclosureGradientPreview key={active} surface={active as "chat_ui" | "shared_ui"} /></div>
        ) : pattern.id === "deferred-detail" ? (
          <div className="v2-preview__frame v2-preview__frame--deferred"><DeferredDetailPreview surface={active as "chat_ui" | "shared_ui"} /></div>
        ) : pattern.id === "activity-record" ? (
          <div className="v2-preview__frame v2-preview__frame--activity">
            <ActivityRecordPreview surface={active as "chat_ui" | "shared_ui"} variant={variantId} />
          </div>
        ) : pattern.id === "presence-boundary" ? (
          <div className="v2-preview__frame v2-preview__frame--presence"><PresenceBoundaryPreview surface={active} /></div>
        ) : showManifest ? (
          <div className="v2-preview__frame v2-preview__frame--manifest">
            <CapabilityManifestPreview key={active} surface={active} />
          </div>
        ) : design && Design ? (
          <>
            <div className={`v2-preview__frame${pattern.id === "authority-gradient" ? " v2-authority-preview" : ""}`}>
              <Design />
            </div>
            {!compact ? <p className="mt-3 text-xs leading-relaxed text-faint">
              The design drawn for this pattern, shown{" "}
              {design.kind === "in-context"
                ? "inside its host surface"
                : "on its own"}
              {researchName ? ` as ${researchName}` : null}. Unchanged from the
              research pages, this restores it here rather than redrawing it.
            </p> : null}
          </>
        ) : showSdk ? (
          <div className="v2-preview__frame">
            <SdkPreview name={sdkName as string} />
          </div>
        ) : showManifestSignal ? (
          <pre className="v2-code"><code>{manifestStateSignal()}</code></pre>
        ) : pattern.id === "authority-gradient" && active === "state_signal" ? (
          <pre className="v2-code"><code>{authorityStateSignal()}</code></pre>
        ) : CHANNEL_FACING[active] === "agent" ? (
          <pre className="v2-code">
            <code>
              {JSON.stringify(
                {
                  channel: active,
                  pattern: pattern.id,
                  mode: pattern.mode.primary,
                  level: pattern.level.primary,
                  from: "agent:sender",
                  to: pattern.audience,
                  opens_with: mode.opens_with,
                  trigger,
                  expects: responses,
                },
                null,
                2,
              )}
            </code>
          </pre>
        ) : active === "settings_panel" ? (
          <div className="v2-preview__frame">
            <p className="v2-eyebrow">{pattern.name}</p>
            <dl className="v2-kv mt-3">
              <dt>Declares</dt>
              <dd>{mode.opens_with}</dd>
              <dt>Set when</dt>
              <dd>{trigger}</dd>
              <dt>Applies to</dt>
              <dd>{LEVEL_LABEL[pattern.level.primary]}</dd>
              <dt>Who changes it</dt>
              <dd>{audience ? AUDIENCE_LABEL[audience] : ", "}</dd>
            </dl>
          </div>
        ) : active === "shared_ui" ? (
          <div className="v2-preview__frame">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <p className="text-sm font-semibold text-foreground">
                {pattern.name}
              </p>
              <span className="v2-tag">{MODE_LABEL[pattern.mode.primary]}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {mode.opens_with}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Shown when {lower(trigger)}.
            </p>
            <div className="v2-responses mt-4">
              {responses.map((response) => (
                <span key={response} className="v2-tag">
                  {response}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="v2-preview__frame">
            <p className="v2-eyebrow mb-3">Agent</p>
            <div className="v2-bubble">
              <p className="m-0 font-medium text-foreground">
                {mode.opens_with}
              </p>
              <p className="m-0 mt-1.5 text-muted-foreground">
                Sent when {lower(trigger)}.
              </p>
            </div>
            <div className="v2-responses mt-3">
              {responses.map((response) => (
                <span key={response} className="v2-tag">
                  {response}
                </span>
              ))}
            </div>
          </div>
        )}

        {compact ? null : previewNotes ? (
          <aside className="v2-preview-guide" aria-label="Preview notes">
            <h3>Preview notes</h3>
            <p className="v2-preview-guide__description">
              These notes explain the example. They sit outside the pattern interface shown above.
            </p>
            <ol className="v2-preview-notes">
              {previewNotes.map((note, index) => (
                <li key={note.title}>
                  <span className="v2-preview-notes__number" aria-hidden="true">{index + 1}</span>
                  <div>
                    <strong>{note.title}</strong>
                    <p>{note.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        ) : pattern.id === "activity-record" ? null : variant ? (
          <p className="mt-3 text-xs leading-relaxed text-faint">
            From {variant.original},{" "}
            {variant.source === "sdk" ? "the HAX SDK" : "the research designs"}.
          </p>
        ) : showSdk ? (
          <p className="mt-3 text-xs leading-relaxed text-faint">
            The HAX SDK component, rendered with sample content.
          </p>
        ) : null}

        {compact || design || showSdk || showManifest || showManifestSignal || pattern.id === "presence-boundary" || pattern.id === "deferred-detail" || pattern.id === "disclosure-gradient" ? null : (
          <p className="mt-3 text-xs leading-relaxed text-faint">
            No design has been drawn for{" "}
            {variant ? `the ${variant.label.toLowerCase()} variant` : "this pattern"}{" "}
            in the {CHANNEL_LABEL[active].toLowerCase()} channel. This is the
            shape of that channel carrying its opening, filled from the
            catalog.
          </p>
        )}
      </div>
    </div>
  );
}

function lower(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function manifestStateSignal(): string {
  const data = SDK_SAMPLES["capability-manifest"].data as CapabilityManifestData;
  const capabilities =
    data.capabilityGroups?.flatMap((group) => group.capabilities) ??
    data.capabilities ??
    [];
  return JSON.stringify(
    {
      type: "capability-manifest",
      agent: {
        name: data.agentName,
        role: data.agentRole,
        tags: data.agentTags?.map(({ label }) => label),
      },
      capabilities: capabilities.map(({ id, name, status, description }) => ({
        id,
        name,
        status,
        description,
      })),
      alerts: data.alerts?.map(({ id, title, description, variant }) => ({
        id,
        title,
        description,
        variant,
      })),
      connection: {
        status: data.connectionStatus,
        sessionId: data.sessionId,
      },
    },
    null,
    2,
  );
}

function authorityStateSignal(): string {
  return JSON.stringify(
    {
      type: "authority-gradient",
      agent: "Finance Agent",
      workflows: [
        { area: "Approve discount", autonomy: "act_and_review", risk: "mid", set_by: "agent" },
        { area: "Escalate to Director", autonomy: "ask_first", risk: "high", set_by: "operator", boundary: "operator_decision" },
        { area: "Compute models", autonomy: "act_alone", risk: "low", set_by: "operator" },
      ],
    },
    null,
    2,
  );
}
