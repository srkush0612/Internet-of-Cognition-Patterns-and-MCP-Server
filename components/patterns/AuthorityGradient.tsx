import { PatternComponentCard } from "./PatternComponentCard";
import { PatternInboxShell } from "./PatternInboxShell";
import { LockIcon } from "./icons";

const LEVELS = ["Suggest", "Ask first", "Act + review", "Act alone"] as const;

type DomainRow = {
  domain: string;
  level: number; // 0-3, index into LEVELS
  tone: "low" | "mid" | "high";
};

const DOMAIN_ROWS: DomainRow[] = [
  { domain: "Deploy to staging", level: 3, tone: "high" },
  { domain: "Deploy to prod", level: 1, tone: "low" },
  { domain: "Incident rollback", level: 2, tone: "mid" },
  { domain: "Customer data access", level: 0, tone: "low" },
];

function GradientBody({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`authority${compact ? " authority--compact" : ""}`}>
      <div className="authority__legend">
        {LEVELS.map((label) => (
          <span key={label} className="authority__legend-item">
            {label}
          </span>
        ))}
      </div>

      <div className="authority__rows">
        {DOMAIN_ROWS.map((row) => (
          <div key={row.domain} className="authority__row">
            <span className="authority__domain">{row.domain}</span>
            <div
              className={`authority__track authority__track--${row.tone}`}
              role="img"
              aria-label={`${row.domain}: ${LEVELS[row.level]}`}
            >
              {LEVELS.map((label, i) => (
                <span
                  key={label}
                  className={`authority__seg${
                    i <= row.level ? " authority__seg--filled" : ""
                  }${i === row.level ? " authority__seg--current" : ""}`}
                />
              ))}
            </div>
            <span className="authority__value">{LEVELS[row.level]}</span>
          </div>
        ))}
      </div>

      <p className="authority__note">
        Set by the on-call lead · sized to how much risk each area can absorb.
        Tighten or loosen any row without pausing the agent.
      </p>
    </div>
  );
}

export function AuthorityGradient({ compact = false }: { compact?: boolean }) {
  return (
    <PatternComponentCard
      patternKey="AuthorityGradient"
      dotColor="#3b5ec6"
      title="How much can this agent decide"
      contextLabel="Network ops"
      icon={<LockIcon size={compact ? 15 : 18} />}
      footerLeft="Autonomy per area · adjustable anytime"
      footerRight="set 4m ago"
      compact={compact}
    >
      <GradientBody compact={compact} />
    </PatternComponentCard>
  );
}

const GRADIENT_INBOX_AGENTS = [
  {
    name: "Deploy agent",
    preview: "Prod deploy needs your confirm…",
    timestamp: "just now",
    status: "active" as const,
  },
  {
    name: "Rollback agent",
    preview: "Acting with review on edge-router-7",
    timestamp: "6m ago",
    status: "waiting" as const,
  },
  {
    name: "Data agent",
    preview: "Read-only on customer records",
    timestamp: "10m ago",
    status: "waiting" as const,
  },
];

const GRADIENT_INBOX_MESSAGE =
  "I can push this change to staging on my own, but prod is set to ask-first. Here is the current autonomy map for network ops. Loosen the prod row if you want me to proceed without a confirm.";

export function AuthorityGradientInbox() {
  return (
    <PatternInboxShell
      agents={GRADIENT_INBOX_AGENTS}
      activeAgentName="Deploy agent"
      message={GRADIENT_INBOX_MESSAGE}
    >
      <AuthorityGradient compact />
    </PatternInboxShell>
  );
}
