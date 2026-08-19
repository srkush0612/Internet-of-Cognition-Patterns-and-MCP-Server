import { PatternComponentCard } from "./PatternComponentCard";
import { PatternInboxShell } from "./PatternInboxShell";
import { FilterIcon } from "./icons";

type LineageNode = {
  label: string;
  detail: string;
  tag?: string;
  tone?: "disputed" | "neutral";
  root?: boolean;
};

const LINEAGE_NODES: LineageNode[] = [
  {
    label: "RCA summary",
    detail: "edge-router-7 outage · authored by Triage agent",
    tag: "under dispute",
    tone: "disputed",
    root: true,
  },
  {
    label: "Remediation plan",
    detail: "Rollback firmware to 4.11, drain traffic first",
    tag: "cites RCA",
  },
  {
    label: "Change ticket CHG-2231",
    detail: "Prod rollback scheduled, 22:00 maintenance window",
    tag: "cites plan",
  },
  {
    label: "Status page draft",
    detail: "Customer-facing note pending the RCA holding",
    tag: "cites RCA",
  },
];

function LineageBody({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`lineage${compact ? " lineage--compact" : ""}`}>
      <div className="lineage__chain">
        {LINEAGE_NODES.map((node, i) => (
          <div key={node.label} className="lineage__node-wrap">
            {i > 0 ? <span className="lineage__edge" aria-hidden /> : null}
            <div
              className={`lineage__node${node.root ? " lineage__node--root" : ""}${
                node.tone === "disputed" ? " lineage__node--disputed" : ""
              }`}
            >
              <div className="lineage__node-head">
                <span className="lineage__node-label">{node.label}</span>
                {node.tag ? (
                  <span
                    className={`lineage__tag${
                      node.tone === "disputed" ? " lineage__tag--disputed" : ""
                    }`}
                  >
                    {node.tag}
                  </span>
                ) : null}
              </div>
              <p className="lineage__node-detail">{node.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="lineage__blast">
        <span className="lineage__blast-count">3 teams</span> still cite this
        summary. If the RCA is wrong,{" "}
        <span className="lineage__blast-strong">2 downstream decisions</span>{" "}
        need rework before the deploy window.
      </div>
    </div>
  );
}

export function DependencyLineageView({ compact = false }: { compact?: boolean }) {
  return (
    <PatternComponentCard
      patternKey="DependencyLineageView"
      dotColor="#b45309"
      title="What depends on this output"
      contextLabel="RCA summary"
      icon={<FilterIcon size={compact ? 15 : 18} />}
      footerLeft="Trace generated from citation graph"
      footerRight="updated 3m ago"
      compact={compact}
    >
      <LineageBody compact={compact} />
    </PatternComponentCard>
  );
}

const LINEAGE_INBOX_AGENTS = [
  {
    name: "Lineage agent",
    preview: "3 teams cite the disputed RCA…",
    timestamp: "3m ago",
    status: "alert" as const,
  },
  {
    name: "Triage agent",
    preview: "RCA summary flagged as under dispute",
    timestamp: "15m ago",
    status: "waiting" as const,
  },
  {
    name: "Change agent",
    preview: "CHG-2231 waiting on RCA to hold",
    timestamp: "20m ago",
    status: "waiting" as const,
  },
];

const LINEAGE_INBOX_MESSAGE =
  "Before you sign off on CHG-2231: the RCA summary it depends on is under dispute. Here is the blast radius — what cites this output and what breaks if the root cause turns out to be wrong.";

export function DependencyLineageViewInbox() {
  return (
    <PatternInboxShell
      agents={LINEAGE_INBOX_AGENTS}
      activeAgentName="Lineage agent"
      message={LINEAGE_INBOX_MESSAGE}
    >
      <DependencyLineageView compact />
    </PatternInboxShell>
  );
}
