export const PRESENCE_TRACK = [
  "Idle",
  "Observing",
  "Working",
  "Waiting",
  "Acting",
] as const;

export type PresenceTrackState = (typeof PRESENCE_TRACK)[number];

export const PRESENCE_STATE_CARDS = [
  {
    id: "idle",
    label: "Idle",
    tone: "idle" as const,
    description: "Present but not engaged. No observing, no action.",
  },
  {
    id: "observing",
    label: "Observing",
    tone: "observing" as const,
    description: "Passively watching context in scope. Not changing anything.",
  },
  {
    id: "working",
    label: "Working",
    tone: "working" as const,
    description:
      "Reasoning or drafting in the background. Still inside the boundary.",
  },
  {
    id: "waiting",
    label: "Waiting",
    tone: "waiting" as const,
    description:
      "Blocked on a person or an input. Holding before it proceeds.",
  },
  {
    id: "acting",
    label: "Acting",
    tone: "acting" as const,
    description:
      "Taking a real action in the world. Shown live with a pulse.",
  },
];

export const PRESENCE_DEMO = {
  state: "Working" as PresenceTrackState,
  duration: "2m",
  description: "Drafting a rollback plan for edge-router-7.",
  scopeBadge: "Act with review",
  watching: "Edge-router fleet telemetry (42 devices)",
  canActOn: "Draft changes across the fleet",
};
