/**
 * Sample props for the vendored HAX SDK artifacts.
 *
 * Kept here, beside the pattern data, rather than inline in a page (Task B,
 * integration rule 2). Most samples use the INC-2231 incident; the Capability
 * Manifest sample follows its SDK reference so its distinct states are visible.
 *
 * Keyed by the artifact's upstream directory name, the same string a
 * pattern's `implementation.sdk_component` or a variant's `sdk_component`
 * carries, so the registry can look a sample up by that one id.
 */

export const SDK_SAMPLES: Record<string, Record<string, unknown>> = {
  "source-attribution": {
    title: "Where this came from",
    claim:
      "The 5xx spike on payments-svc traces to the checkout retry loop, not a capacity ceiling.",
    sources: [
      { id: "s1", title: "payments-svc error logs, 03:08-03:12", url: "#" },
      { id: "s2", title: "checkout retry config (deploy 4f2a)", url: "#" },
      { id: "s3", title: "replica saturation dashboard", url: "#" },
    ],
  },

  timeline: {
    title: "Overnight activity",
    items: [
      {
        id: "t1",
        title: "Telemetry flagged the 5xx spike",
        description: "payments-svc errors up 4× in three minutes.",
        timeAgo: "03:08",
        status: "completed",
      },
      {
        id: "t2",
        title: "Triage proposed a restart",
        description: "Held for operator consent.",
        timeAgo: "03:11",
        status: "completed",
      },
      {
        id: "t3",
        title: "Deploy scaled replicas 3 → 6",
        description: "Approved, then watched.",
        timeAgo: "03:40",
        status: "completed",
      },
      {
        id: "t4",
        title: "Awaiting postmortem sign-off",
        description: "Root cause recorded.",
        timeAgo: "07:00",
        status: "in-progress",
      },
    ],
  },

  "thinking-process": {
    title: "How triage reasoned",
    badge: "medium confidence",
    steps: [
      {
        id: "p1",
        title: "Read the signal",
        description: "5xx on payments-svc, climbing, not flat.",
        status: "completed",
      },
      {
        id: "p2",
        title: "Ruled out capacity",
        description: "CPU and memory headroom were normal.",
        status: "completed",
      },
      {
        id: "p3",
        title: "Settled on a retry storm",
        description: "The checkout retry loop matched the shape.",
        status: "completed",
      },
    ],
    metrics: [
      { label: "Confidence", value: "68%" },
      { label: "Time to call", value: "3m" },
    ],
  },

  findings: {
    title: "What the night turned up",
    findings: [
      {
        id: "f1",
        title: "Retry loop, not capacity",
        description:
          "The checkout retry config in deploy 4f2a amplified a transient error into a storm.",
        sources: [
          { label: "deploy 4f2a diff", href: "#" },
          { label: "retry logs", href: "#" },
        ],
      },
      {
        id: "f2",
        title: "Scaling masked it for two hours",
        description:
          "More replicas absorbed the load, so the real cause stayed hidden until 03:40.",
        sources: [{ label: "replica timeline", href: "#" }],
      },
    ],
  },

  "diagnostic-report": {
    title: "Diagnostic report",
    items: [
      {
        id: "d1",
        suspectedCause: "Checkout retry storm",
        confidence: 68,
        confidenceLevel: "medium",
        rationale: "Retry loop in deploy 4f2a amplified a transient 5xx.",
        recommendedAction: "Pause the retry job",
      },
      {
        id: "d2",
        suspectedCause: "Replica saturation",
        confidence: 90,
        confidenceLevel: "high",
        rationale: "p99 held above target until replicas scaled 3 → 6.",
        recommendedAction: "Keep 6 replicas until traffic falls",
      },
    ],
  },

  details: {
    title: "payments-svc",
    subtitle: "checkout-latency incident",
    description: "State of the one service the incident touched.",
    stats: [
      { label: "Error rate", value: "0.4%" },
      { label: "Replicas", value: "6" },
      { label: "p99 latency", value: "820ms" },
    ],
    substats: [
      { label: "Peak 5xx", value: "4.1%" },
      { label: "Recovered", value: "03:48" },
    ],
  },

  "capability-manifest": {
    data: {
      agentName: "Data Analyst",
      agentRole: "Agent",
      statusText: "Capability handshake initiated · Ready for interaction",
      agentTags: [
        { label: "v2.1", variant: "filled" },
      ],
      capabilities: [
        { id: "sql", name: "SQL Query Execution", description: "Database read-only access", status: "enabled" },
        { id: "visualization", name: "Data Visualization", description: "Charts & graphs", status: "enabled" },
        { id: "export", name: "File Export", description: "CSV, JSON, PDF", status: "enabled" },
        { id: "schema", name: "Schema Modification", description: "Approval required", status: "pending" },
        { id: "write", name: "Direct DB Write", description: "Restricted", status: "disabled" },
      ],
      alerts: [
        {
          id: "rate-limit",
          title: "Rate Limit Active",
          description: "API requests limited to 100/min during peak hours",
          variant: "warning",
        },
      ],
      connectionStatus: "connected",
      sessionId: "HAX-2024-001",
    },
  },

  "workshop-card": {
    title: "Incident retro: INC-2231",
    description: "Walk the timeline, agree the fix, assign follow-ups.",
    eventType: "Postmortem",
    status: "confirmed",
    date: "Oct 7, 2026",
    time: "10:00",
    duration: "45 min",
    location: "War room / video",
    attendeeCount: 4,
    attendees: [
      { id: "u1", name: "On-call engineer" },
      { id: "u2", name: "Service owner" },
      { id: "u3", name: "SRE lead" },
    ],
  },

  "contextual-explanation": {
    title: "Why replicas changed",
    alertTitle: "payments-svc scaled 3 → 6",
    alertDescription:
      "Deploy raised the replica count at 03:40 after the retry theory was revised to a capacity shortfall.",
    details: [
      { label: "Trigger", value: "Sustained 5xx after the retry fix" },
      { label: "Approved by", value: "On-call engineer" },
      { label: "Reverted", value: "No" },
    ],
    primaryButtonLabel: "Acknowledge",
    secondaryButtonLabel: "See the trace",
  },

  "inline-rationale": {
    assessmentType: "incident_assessment",
    intent: "warn",
    title: "Why triage wants to restart payments-svc",
    description:
      "The 5xx spike matches a retry storm, and a restart clears the stuck retry queue without a deploy.",
    confidence: 68,
    summary: { impact: "medium", exploitability: "low", tags: ["payments-svc"] },
    rationale: [
      { label: "Signal", value: "5xx up 4× in three minutes" },
      { label: "Likely cause", value: "Checkout retry loop" },
      { label: "Reversible", value: "Yes, restart only" },
    ],
  },

  rationale: {
    decision: "Pause the retry job before touching replicas",
    variant: "decision",
    reasoning:
      "The retry loop is the cheapest thing to stop and the most likely cause. Scaling can wait for the result.",
    confidence: 68,
    confidenceDescription: "Medium, inferred from error shape, not measured.",
    criteria: [
      { label: "Reversibility", value: "Fully reversible", sentiment: "positive" },
      { label: "Cost", value: "No added spend", sentiment: "positive" },
      { label: "Certainty", value: "Inferred, not measured", sentiment: "neutral" },
    ],
  },

  form: {
    title: "Confirm the restart",
    fields: [
      {
        type: "select",
        label: "Service",
        name: "service",
        options: [
          { label: "payments-svc", value: "payments" },
          { label: "checkout-svc", value: "checkout" },
        ],
        required: true,
      },
      {
        type: "checkbox",
        label: "I have read the proposed plan",
        name: "ack",
        required: true,
      },
      {
        type: "textarea",
        label: "Reason (logged for the team)",
        name: "reason",
        placeholder: "Why now, and what you expect to happen",
        rows: 3,
      },
    ],
  },
};
