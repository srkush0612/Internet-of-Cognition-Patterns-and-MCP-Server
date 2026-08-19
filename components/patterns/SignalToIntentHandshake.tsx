import { PatternComponentCard } from "./PatternComponentCard";
import { PatternInboxShell } from "./PatternInboxShell";
import { LightningIcon } from "./icons";

type HandshakeStep = {
  label: string;
  text: string;
  kind: "noticed" | "interpreted" | "proposed";
  confidence?: string;
};

const HANDSHAKE_STEPS: HandshakeStep[] = [
  {
    label: "I noticed",
    kind: "noticed",
    text: "5xx errors on svc-payments jumped 4× in the last 3 minutes.",
  },
  {
    label: "I think it means",
    kind: "interpreted",
    text: "A retry storm from the checkout retry loop, not a capacity shortfall.",
    confidence: "Medium confidence",
  },
  {
    label: "I plan to",
    kind: "proposed",
    text: "Pause the retry job and scale payments replicas from 3 to 6.",
  },
];

function HandshakeBody({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`handshake${compact ? " handshake--compact" : ""}`}>
      <div className="handshake__steps">
        {HANDSHAKE_STEPS.map((step) => (
          <div
            key={step.label}
            className={`handshake__step handshake__step--${step.kind}`}
          >
            <div className="handshake__step-head">
              <span className="handshake__step-label">{step.label}</span>
              {step.confidence ? (
                <span className="handshake__confidence">{step.confidence}</span>
              ) : null}
            </div>
            <p className="handshake__step-text">{step.text}</p>
          </div>
        ))}
      </div>

      <div className="handshake__actions">
        <button
          type="button"
          className="handshake__btn handshake__btn--primary"
        >
          Confirm &amp; proceed
        </button>
        <button type="button" className="handshake__btn">
          Correct interpretation
        </button>
        <button type="button" className="handshake__btn handshake__btn--ghost">
          Not now
        </button>
      </div>
    </div>
  );
}

export function SignalToIntentHandshake({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <PatternComponentCard
      patternKey="SignalToIntentHandshake"
      dotColor="#3b5ec6"
      title="Before I act"
      contextLabel="Triage agent"
      icon={<LightningIcon size={compact ? 15 : 18} />}
      footerLeft="No irreversible step until you respond"
      footerRight="waiting on you"
      compact={compact}
    >
      <HandshakeBody compact={compact} />
    </PatternComponentCard>
  );
}

const HANDSHAKE_INBOX_AGENTS = [
  {
    name: "Triage agent",
    preview: "Retry storm on svc-payments — proposing a fix…",
    timestamp: "just now",
    status: "active" as const,
  },
  {
    name: "Telemetry agent",
    preview: "5xx rate climbing on payments",
    timestamp: "2m ago",
    status: "alert" as const,
  },
  {
    name: "Deploy agent",
    preview: "Standing by to scale replicas",
    timestamp: "4m ago",
    status: "waiting" as const,
  },
];

const HANDSHAKE_INBOX_MESSAGE =
  "I think I know what is going on with the payments errors, but I want your read before I touch anything. Here is what I saw, what I think it means, and what I would do. Correct me if my interpretation is off.";

export function SignalToIntentHandshakeInbox() {
  return (
    <PatternInboxShell
      agents={HANDSHAKE_INBOX_AGENTS}
      activeAgentName="Triage agent"
      message={HANDSHAKE_INBOX_MESSAGE}
    >
      <SignalToIntentHandshake compact />
    </PatternInboxShell>
  );
}
