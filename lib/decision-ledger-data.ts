export type LedgerAttribution =
  | "agent-decision"
  | "operator-added-context"
  | "operator-declined";

export type LedgerAlternative = {
  text: string;
};

export type OpenLedgerRecord = {
  action: string;
  changeRef: string;
  agentReason: string;
  alternatives: LedgerAlternative[];
  policyVersion: string;
  inputs: string[];
};

export type SealedLedgerRecord = {
  id: string;
  action: string;
  changeRef: string;
  attribution: LedgerAttribution;
  agentReason: string;
  operatorContext?: string;
  declineReason?: string;
  alternatives: LedgerAlternative[];
  inputs: string[];
  policyVersion: string;
  sealedAgo: string;
};

export const ATTRIBUTION_LABEL: Record<LedgerAttribution, string> = {
  "agent-decision": "Agent decision",
  "operator-added-context": "Operator added context",
  "operator-declined": "Operator declined",
};

export const ATTRIBUTION_CHIP_HINT: Record<LedgerAttribution, string> = {
  "agent-decision": "Committed with the agent reason as written",
  "operator-added-context": "Operator context stored alongside the agent reason",
  "operator-declined": "Action stopped with a recorded reason",
};

export const INITIAL_OPEN_RECORD: OpenLedgerRecord = {
  action: "Restart svc-payments",
  changeRef: "CHG-2231",
  agentReason:
    "Memory use on svc-payments has climbed for six hours and is close to the limit. A restart clears it and takes under one minute.",
  alternatives: [
    { text: "Wait for the scheduled restart tonight" },
    { text: "Move traffic to the standby instance first" },
  ],
  policyVersion: "Change policy 7.3",
  inputs: [
    "Memory at 91 percent of limit, rising for six hours",
    "Restart takes under one minute",
  ],
};

export const SEEDED_SEALED_RECORDS: SealedLedgerRecord[] = [
  {
    id: "sealed-1",
    action: "Scale svc-payments to six instances",
    changeRef: "CHG-2224",
    attribution: "operator-declined",
    agentReason:
      "Request rate has doubled and latency is climbing at the current instance count.",
    declineReason:
      "The traffic is a load test finance is running against staging credentials. It ends at 18:00. Scaling would hide the misrouting rather than fix it.",
    alternatives: [
      { text: "Scale to four instances and reassess in an hour" },
      { text: "Shed load from the lowest priority queue" },
    ],
    inputs: [
      "Request rate up 104 percent over ninety minutes",
      "Latency at 380ms against a 200ms target",
    ],
    policyVersion: "Change policy 4.1",
    sealedAgo: "8 days ago",
  },
  {
    id: "sealed-2",
    action: "Roll svc-payments back to build 812",
    changeRef: "CHG-2205",
    attribution: "agent-decision",
    agentReason:
      "Error rate crossed the alert threshold nine minutes after deploy.",
    alternatives: [
      { text: "Hold and watch for another five minutes" },
      { text: "Roll forward to build 814 instead" },
    ],
    inputs: [
      "Error rate 4.2 percent against a 1 percent threshold",
      "Build 812 ran clean for eleven days",
    ],
    policyVersion: "Change policy 2.9",
    sealedAgo: "12 days ago",
  },
  {
    id: "sealed-3",
    action: "Drain edge-router-4",
    changeRef: "CHG-2218",
    attribution: "operator-added-context",
    agentReason:
      "Peer capacity covers the load and the maintenance window opens in twenty minutes.",
    operatorContext:
      "Draining now because the vendor engineer is on site today and will not be back this quarter.",
    alternatives: [
      { text: "Drain at the start of the scheduled window" },
      { text: "Split the load across edge-router-5 and edge-router-7 first" },
    ],
    inputs: [
      "Peer utilisation 41 percent",
      "Maintenance window opens at 14:00",
    ],
    policyVersion: "Change policy 7.3",
    sealedAgo: "19 days ago",
  },
];

export const SERVICE_NAME = "svc-payments";
