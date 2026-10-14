"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Circle, type LucideIcon } from "lucide-react";
import { SDK_SAMPLES } from "@/lib/v2/sdk-samples";
import type {
  CapabilityManifestData,
  CapabilityStatus,
} from "@/vendor/hax/artifacts/capability-manifest/types";

const icons = {
  enabled: CheckCircle2,
  pending: AlertCircle,
  disabled: Circle,
  error: AlertCircle,
} satisfies Record<CapabilityStatus, LucideIcon>;

/** The SDK manifest shown inside a responsive v2 host surface. */
export function CapabilityManifestPreview({
  surface,
}: {
  surface: "settings_panel" | "chat_ui";
}) {
  const [chatExpanded, setChatExpanded] = useState(false);
  const data = SDK_SAMPLES["capability-manifest"].data as CapabilityManifestData;
  const capabilities =
    data.capabilityGroups?.flatMap((group) => group.capabilities) ??
    data.capabilities ??
    [];
  const connection = data.connectionStatus ?? "disconnected";
  const connectionLabel = data.connectionLabel ?? (
    connection === "connected" ? "Connected" :
    connection === "connecting" ? "Connecting" :
    connection === "error" ? "Connection error" : "Disconnected"
  );
  const available = capabilities.filter((capability) => capability.status === "enabled");
  const pending = capabilities.filter((capability) => capability.status === "pending");
  const restricted = capabilities.filter((capability) => capability.status === "disabled");
  const errors = capabilities.filter((capability) => capability.status === "error");
  const avatarInitials = (data.agentName ?? "Agent")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const connectionStatus = (
    <span className="v2-capability-manifest__connection" data-status={connection}>
      <span className="v2-capability-manifest__dot" aria-hidden="true" />
      {connectionLabel}
    </span>
  );

  const manifest = (
    <section className="v2-capability-manifest" aria-label={`${data.agentName} capability manifest`}>
        <header className="v2-capability-manifest__header">
          <div className="v2-capability-manifest__headline">
            <div className="v2-capability-manifest__identity">
              <h3>
                {data.agentRole ? `${data.agentRole}: ` : ""}
                {data.agentName}
              </h3>
              {data.agentTags?.map((tag) => (
                <span
                  key={tag.label}
                  className="v2-capability-manifest__tag"
                  data-variant={tag.variant ?? "default"}
                >
                  {tag.label}
                </span>
              ))}
            </div>
            {connectionStatus}
          </div>
          {data.statusText ? <p>{data.statusText}</p> : null}
        </header>

        <ul className="v2-capability-manifest__summary" aria-label="Capability summary">
          <li data-status="enabled"><strong>{available.length}</strong> available</li>
          <li data-status="pending"><strong>{pending.length}</strong> needs approval</li>
          <li data-status="disabled"><strong>{restricted.length}</strong> restricted</li>
          {errors.length > 0 ? <li data-status="error"><strong>{errors.length}</strong> in error</li> : null}
        </ul>

        <div className="v2-capability-manifest__body">
          <h4>{data.capabilitiesLabel ?? "Capabilities"}</h4>
          <ul className="v2-capability-manifest__list">
            {capabilities.map((capability) => {
              const Icon = icons[capability.status];
              return (
                <li key={capability.id} data-status={capability.status}>
                  <Icon aria-hidden="true" size={20} strokeWidth={2} />
                  <div>
                    <span className="v2-capability-manifest__name">{capability.name}</span>
                    {capability.description ? <span className="v2-capability-manifest__description">{capability.description}</span> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {data.alerts?.map((alert) => (
          <div key={alert.id} className="v2-capability-manifest__alert" role="status" data-variant={alert.variant}>
            <AlertTriangle aria-hidden="true" size={20} strokeWidth={2} />
            <div>
              <strong>{alert.title}</strong>
              <p>{alert.description}</p>
            </div>
          </div>
        ))}

        {data.sessionId ? (
          <footer className="v2-capability-manifest__footer">
            <span>Session: {data.sessionId}</span>
          </footer>
        ) : null}
    </section>
  );

  if (surface === "chat_ui") {
    return (
      <div className="v2-capability-chat">
        <header className="v2-capability-chat__header">
          <span className="v2-capability-chat__avatar" aria-hidden="true">{avatarInitials}</span>
          <div>
            <strong>{data.agentName}</strong>
            <span>Agent conversation</span>
          </div>
        </header>
        <div className="v2-capability-chat__thread">
          <div className="v2-capability-chat__user">
            <span>You</span>
            <p>What can you do with this dataset?</p>
          </div>
          <div className="v2-capability-chat__agent-message">
            <span className="v2-capability-chat__avatar v2-capability-chat__avatar--reply" aria-hidden="true">{avatarInitials}</span>
            <div className="v2-capability-chat__reply">
              <span>{data.agentName}</span>
              <p>I can run read-only queries, visualize, and export this dataset. Database changes need approval or are restricted.</p>
              <section className="v2-capability-chat__summary" aria-label={`${data.agentName} capability summary`}>
                <div className="v2-capability-chat__summary-head">
                  <strong>Capabilities for this session</strong>
                  {connectionStatus}
                </div>
                <p>
                  {available.length} available · {pending.length} needs approval · {restricted.length} restricted
                  {errors.length > 0 ? ` · ${errors.length} in error` : null}
                </p>
                <ul className="v2-capability-chat__available" aria-label="Available capabilities">
                  {available.map((capability) => <li key={capability.id}>{capability.name}</li>)}
                </ul>
                <div className="v2-capability-chat__limits">
                  {pending.map((capability) => (
                    <p key={capability.id}><strong>{capability.name}:</strong> {capability.description ?? "Approval required"}</p>
                  ))}
                  {restricted.map((capability) => (
                    <p key={capability.id}><strong>{capability.name}:</strong> {capability.description ?? "Restricted"}</p>
                  ))}
                  {errors.map((capability) => (
                    <p key={capability.id}><strong>{capability.name}:</strong> {capability.description ?? "Unavailable"}</p>
                  ))}
                </div>
                {data.alerts?.map((alert) => (
                  <p className="v2-capability-chat__alert" key={alert.id}>
                    <strong>{alert.title}:</strong> {alert.description}
                  </p>
                ))}
                <button
                  type="button"
                  className="v2-capability-chat__expand"
                  aria-expanded={chatExpanded}
                  onClick={() => setChatExpanded((expanded) => !expanded)}
                >
                  {chatExpanded ? "Hide full manifest" : "View full manifest"}
                </button>
                {chatExpanded ? <div className="v2-capability-chat__expanded">{manifest}</div> : null}
              </section>
            </div>
          </div>
        </div>
        <div className="v2-capability-chat__composer" aria-hidden="true">
          Message {data.agentName}…
        </div>
      </div>
    );
  }

  return (
    <div className="v2-capability-host">
      <div className="v2-capability-host__header">
        <span>Agent setup</span>
        <span className="v2-capability-host__context">Connection details</span>
      </div>
      {manifest}
    </div>
  );
}
