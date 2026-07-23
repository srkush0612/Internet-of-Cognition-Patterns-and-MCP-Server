import type { BoundarySplitData } from "@/lib/boundary-split";
import { CredentialBoundaryCanvas } from "./CredentialBoundaryCanvas";
import { CredentialBoundaryInboxActions } from "./CredentialBoundaryInboxActions";
import { PatternInboxShell } from "./PatternInboxShell";

export const CREDENTIAL_BOUNDARY_DATA: BoundarySplitData = {
  left: {
    label: "Crime Agent",
    steps: ["Risk elevated to HIGH", "Detected structuring pattern"],
    cannotSee: "credit, income",
  },
  right: {
    label: "Credit Agent",
    steps: ["Verified income, employment", "Approved on credit criteria"],
    cannotSee: "crime flags",
  },
  outcome: {
    label: "Converged outcome",
    text: "Flagged for manual review — neither agent could resolve the conflict alone, because neither could see the other's data.",
  },
};

const CREDENTIAL_INBOX_AGENTS = [
  {
    name: "Crime Agent",
    preview: "Risk elevated to HIGH: structuring pattern detected",
    timestamp: "2m ago",
    status: "active" as const,
  },
  {
    name: "Credit Agent",
    preview: "Verified income, employment, approved on credit",
    timestamp: "5m ago",
    status: "alert" as const,
  },
  {
    name: "Review Agent",
    preview: "Waiting on boundary resolution…",
    timestamp: "12m ago",
    status: "waiting" as const,
  },
];

const CREDENTIAL_INBOX_MESSAGE =
  "I've flagged a structuring pattern and elevated the risk score to HIGH. I can't see the applicant's credit or income data — that's outside my access boundary. The Credit Agent is reasoning from the lending side. We need both perspectives before this loan can close.";

export function CredentialBoundary({ compact = false }: { compact?: boolean }) {
  return (
    <CredentialBoundaryCanvas
      data={CREDENTIAL_BOUNDARY_DATA}
      compact={compact}
      showCardChrome
    />
  );
}

export function CredentialBoundaryInbox() {
  return (
    <PatternInboxShell
      agents={CREDENTIAL_INBOX_AGENTS}
      activeAgentName="Crime Agent"
      message={CREDENTIAL_INBOX_MESSAGE}
      afterEmbedded={<CredentialBoundaryInboxActions />}
    >
      <CredentialBoundary compact />
    </PatternInboxShell>
  );
}
