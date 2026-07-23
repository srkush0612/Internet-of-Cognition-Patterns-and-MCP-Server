import type { ReactNode } from "react";

export type PatternInboxAgent = {
  name: string;
  preview: string;
  timestamp: string;
  status: "active" | "alert" | "waiting";
};

export function PatternInboxShell({
  agents,
  activeAgentName,
  message,
  children,
  afterEmbedded,
}: {
  agents: PatternInboxAgent[];
  activeAgentName: string;
  message: string;
  children: ReactNode;
  afterEmbedded?: ReactNode;
}) {
  return (
    <div className="pattern-inbox">
      <aside className="pattern-inbox__sidebar" aria-label="Agents">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className={`pattern-inbox__agent ${
              agent.status === "active" ? "pattern-inbox__agent--active" : ""
            }`}
          >
            <div className="pattern-inbox__agent-row">
              <span
                className={`pattern-inbox__agent-dot pattern-inbox__agent-dot--${agent.status}`}
                aria-hidden
              />
              <span className="pattern-inbox__agent-name">{agent.name}</span>
              <span className="pattern-inbox__agent-time">{agent.timestamp}</span>
            </div>
            <p className="pattern-inbox__agent-preview">{agent.preview}</p>
          </div>
        ))}
      </aside>

      <div className="pattern-inbox__main">
        <div className="pattern-inbox__bubble">
          <span className="pattern-inbox__bubble-label">{activeAgentName}</span>
          <p className="pattern-inbox__bubble-text">{message}</p>
        </div>
        <div className="pattern-inbox__embedded">
          <span className="pattern-inbox__tag">
            <span className="pattern-inbox__live-dot" aria-hidden />
            {activeAgentName} · live component
          </span>
          {children}
        </div>
        {afterEmbedded}
      </div>
    </div>
  );
}
