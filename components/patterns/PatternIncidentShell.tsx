import type { ReactNode } from "react";

export type PatternIncidentParticipant = {
  name: string;
  role: "human" | "agent";
};

export type PatternIncidentTimelineItem = {
  time: string;
  label: string;
};

export function PatternIncidentShell({
  queueLabel,
  ticketId,
  ticketTitle,
  elapsed,
  cardEnds,
  participants,
  timeline,
  children,
}: {
  queueLabel: string;
  ticketId: string;
  ticketTitle: string;
  elapsed: string;
  cardEnds: string;
  participants: PatternIncidentParticipant[];
  timeline: PatternIncidentTimelineItem[];
  children: ReactNode;
}) {
  return (
    <div className="pattern-incident">
      <header className="pattern-incident__header">
        <div className="pattern-incident__ticket-row">
          <span className="pattern-incident__queue">{queueLabel}</span>
          <span className="pattern-incident__ticket-id">{ticketId}</span>
        </div>
        <h3 className="pattern-incident__title">{ticketTitle}</h3>
        <div className="pattern-incident__meta">
          <span className="pattern-incident__elapsed">{elapsed}</span>
          <span className="pattern-incident__meta-sep">·</span>
          <span className="pattern-incident__ends">{cardEnds}</span>
        </div>
        <ul className="pattern-incident__participants" aria-label="Participants">
          {participants.map((person) => (
            <li
              key={person.name}
              className={`pattern-incident__participant${
                person.role === "human"
                  ? " pattern-incident__participant--human"
                  : ""
              }`}
            >
              {person.name}
            </li>
          ))}
        </ul>
        <ol className="pattern-incident__timeline" aria-label="Ticket timeline">
          {timeline.map((item) => (
            <li key={item.time} className="pattern-incident__timeline-item">
              <span className="pattern-incident__timeline-time">{item.time}</span>
              <span className="pattern-incident__timeline-label">{item.label}</span>
            </li>
          ))}
        </ol>
      </header>

      <section
        className="pattern-incident__activity"
        aria-labelledby="pattern-incident-activity-heading"
      >
        <h4 className="pattern-incident__activity-label" id="pattern-incident-activity-heading">
          Agent activity
        </h4>
        <div className="pattern-incident__slot">{children}</div>
      </section>
    </div>
  );
}
