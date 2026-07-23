export type PatternStatus = "Grounded" | "Unverified";

// Backing strength from the Combined Research + Design Synthesis crosswalk.
// Strong: multiple participants and/or direct verbatim support.
// Moderate: one participant, or supported indirectly / by adjacent themes.
// Thin: tangential or single-mention support; largely inferred.
// None: design hypothesis with no interview support yet — validate.
export type BackingStrength = "Strong" | "Moderate" | "Thin" | "None";

export type EvidenceItem = {
  quote: string;
  attribution: string;
};

export type Pattern = {
  slug: string;
  title: string;
  oneliner: string;
  explanation: string;
  example: string;
  hasReferenceDesign?: boolean;
  evidenceStatus?: "pending";
  evidence?: EvidenceItem[];
  pairsWith?: string;
  note?: string;
  // Fields below are from the Combined Research + Design Synthesis workbook.
  backingStrength?: BackingStrength;
  participants?: string;
  researchNote?: string;
};

// A GTM / positioning finding from the synthesis that is not itself a UI
// component: handled in messaging and sales motion, not in the pattern set.
export type PositioningFinding = {
  id: string;
  title: string;
  statement: string;
  strength: BackingStrength;
  participants: string;
  recommendation: string;
};

export const patterns: Pattern[] = [
  {
    slug: "presence-boundary",
    hasReferenceDesign: true,
    title: "Presence Boundary",
    backingStrength: "Moderate",
    participants: "Everaldo",
    researchNote:
      "Users want minimal presence during active work, which supports a calm status/scope indicator. But no participant explicitly asked for a presence widget; treat the state model as design-led.",
    oneliner:
      "Shows at a glance whether an agent is idle, observing, working, waiting, or acting, what it is currently scoped to touch, and gives one place to pause it or narrow its reach. A portable HAX primitive, shown standalone and inside a host surface.",
    explanation:
      "Persistent agents do not start and stop with a chat turn. They linger around shared work. Presence Boundary makes that lingering legible and bounded: you can always see what state an agent is in, what it is allowed to touch, and stop or shrink it without leaving your work.",
    example:
      "One status orb shows the live state with a short activity line. A five-step track places that state on the idle-to-acting spectrum. A scope panel separates watching from can-act-on, with an access level. Pause, Narrow, and Widen steer the boundary.",
    evidence: [
      {
        quote:
          "We did notice that when it is transparent that there are multiple agents behind the scenes, it becomes complex enough that people don't have as much trust in the system.",
        attribution: "Everaldo Aguiar, Director of Applied AI, PagerDuty",
      },
    ],
  },
  {
    slug: "signal-to-intent-handshake",
    pairsWith: "resolution-handshake",
    title: "Signal-to-Intent Handshake",
    backingStrength: "Moderate",
    participants: "Minh, Sahil, Aman",
    researchNote:
      "Trust themes support explaining intent before acting, but the explicit handshake step is inferred, not requested. Strong candidate for the inline generative-message pattern.",
    oneliner:
      "Lets the agent explain what it noticed and what it thinks it means before it acts.",
    explanation:
      "Surprise automation erodes control. This pattern forces a brief human-readable checkpoint: what changed, why it matters, and what the agent proposes before any irreversible step.",
    example:
      "Alert fires → agent surfaces: “CPU spike on svc-payments. I interpret this as retry storm. Proposed next step: scale replicas. Proceed?”",
    evidence: [
      {
        quote:
          "I do think that there's some communication layer there that is interesting problem to solve.",
        attribution: "Minh Pham, AOP study",
      },
    ],
    note: "Sibling pattern to Resolution Handshake: agent-to-human before acting; Resolution Handshake is agent-to-agent after converging.",
  },
  {
    slug: "background-work-ledger",
    evidenceStatus: "pending",
    title: "Background Work Ledger",
    backingStrength: "Strong",
    participants: "Everaldo, Alok",
    researchNote:
      "Best-supported component: the ledger is exactly the retrospective trace plus audit log users described. Keep the live view minimal (see Presence Boundary).",
    oneliner:
      "Shows what happened while you were away: actions, tools, assumptions, results, open questions.",
    explanation:
      "Async agent work feels like a black box when users return. A ledger reconstructs the narrative so they can approve, undo, or steer without replaying raw logs.",
    example:
      "Timeline card: 09:14 queried logs · 09:16 assumed cache miss · 09:18 opened PR draft · open question: confirm owner team?",
  },
  {
    slug: "context-shaping-panel",
    pairsWith: "certainty-boundary",
    title: "Context Shaping Panel",
    backingStrength: "Thin",
    participants: "Anshu",
    researchNote:
      "Single participant, and framed as an engineering concern (session/memory/context management), not an end-user control. Reframe for end users or validate before building.",
    oneliner:
      "Manage what context the agent should use, ignore, remember, or discard.",
    explanation:
      "Wrong context drives wrong actions. This panel makes inclusion/exclusion explicit: what’s in scope for this task versus what must never leak in.",
    example:
      "Checklist: ✓ incident thread · ✓ runbook v3 · ✗ customer PII export · remember: prefer staging cluster.",
    evidence: [
      {
        quote: "Why do you want your main agent make all the decisions?",
        attribution: "Ali Nahvi, IoC concept sharing study",
      },
      {
        quote: "The more consolidation you do, the less conflict.",
        attribution: "Ali Nahvi, IoC concept sharing study",
      },
    ],
  },
  {
    slug: "memory-commitment-review",
    hasReferenceDesign: true,
    title: "Memory Commitment Review",
    backingStrength: "Thin",
    participants: "Alok (indirect), Anshu",
    researchNote:
      "The saw-vs-believes distinction is a compelling design invention but not voiced by participants. High-value if validated; test the mental model first.",
    oneliner: 'Separates "the agent saw this" from "the system now believes this."',
    explanation:
      "Ephemeral observations shouldn’t silently become durable beliefs. Review gates what gets committed to long-term memory or policy stores.",
    example:
      "Side-by-side: “Observed: latency spike Tuesday” vs “Commit to memory: payments always slow Tuesdays?” [Accept] [Edit] [Discard]",
    evidence: [
      {
        quote:
          "The regulator keeps probing us: can you explain how did you come to this outcome?",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
      {
        quote:
          "Every time we retrain, we have to keep that audit log, create documentation, make sure the right stakeholders fully understand the change between the previous model and the newly retrained model.",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
    ],
  },
  {
    slug: "concurrent-workspace-awareness",
    evidenceStatus: "pending",
    title: "Concurrent Workspace Awareness",
    backingStrength: "None",
    participants: "Sahil (tangential)",
    researchNote:
      "No interview evidence for interpreting live human edits. Pure design hypothesis, and the highest validation priority of the ten components.",
    oneliner:
      "Helps agents read live human edits as feedback, override, or unrelated work.",
    explanation:
      "Humans and agents editing the same artifact need shared situational awareness. Otherwise the agent treats every human change as noise or contradiction.",
    example:
      "Banner: “You edited paragraph 2 while Agent was drafting section 3. Treat your edit as override or parallel draft?”",
  },
  {
    slug: "review-as-dialogue",
    evidenceStatus: "pending",
    title: "Review as Dialogue",
    backingStrength: "Moderate",
    participants: "Sahil, Alok",
    researchNote:
      "Human-as-steerer is well supported (\"don't make humans the bottleneck\"). Review-as-a-learning-moment is the design extension; the steering/approval core is solid.",
    oneliner:
      "Turns approval into a learning and steering moment, not just a yes/no gate.",
    explanation:
      "Binary approve/reject wastes teaching signal. Dialogue captures why something was rejected and feeds that back into the next iteration.",
    example:
      "Instead of [Reject], user picks: “Wrong audience” → agent asks one clarifying question → revised draft.",
  },
  {
    slug: "dependency-and-lineage-view",
    evidenceStatus: "pending",
    title: "Dependency and Lineage View",
    backingStrength: "Strong",
    participants: "Alok",
    researchNote:
      "Directly answers the explainability demand (\"the regulator keeps probing us: can you explain how you came to this outcome?\"). Single participant but a sharp, high-stakes need; likely most valuable in regulated verticals.",
    oneliner:
      "Shows what claims, artifacts, and decisions depend on a given agent output.",
    explanation:
      "Downstream decisions stack on upstream agent outputs. Lineage makes blast radius visible before someone acts on stale or disputed conclusions.",
    example:
      "Graph: RCA summary → remediation plan → change ticket. Highlight: “3 teams still cite this summary.”",
  },
  {
    slug: "authority-gradient",
    title: "Authority Gradient",
    backingStrength: "Moderate",
    participants: "Alok, Ali",
    researchNote:
      "\"Mistakes within my appetite\" maps cleanly to per-area adjustable autonomy. Strong conceptual fit across two participants.",
    oneliner: "Makes autonomy level visible and adjustable by workflow area.",
    explanation:
      "Supervisor/subordinate structures help when intents collide and context must roll up. Authority Gradient exposes who can decide what, and lets operators tighten or loosen autonomy by domain.",
    example:
      "Slider per domain: “Deploy to staging: autonomous · Deploy to prod: human confirm · Data access: read-only.”",
    evidence: [
      {
        quote:
          "I think Supervisor probably is the one I would go to as the first one.",
        attribution: "Dongxue Zhou, AOP study",
      },
    ],
  },
  {
    slug: "shared-cognitive-state",
    hasReferenceDesign: true,
    title: "Shared Cognitive State",
    backingStrength: "Moderate",
    participants: "Minh, Ali, Sahil",
    researchNote:
      "Tension with Trust Through Abstraction: exposing full shared cognitive state to end users can reduce trust. Position as an operator/builder console, not an end-user surface.",
    oneliner:
      "A common view of goals, assumptions, conflicts, and open questions across humans and agents.",
    explanation:
      "When organizations can’t share data or intent across boundaries, agents need a negotiated shared state, not a fantasy single database.",
    example:
      "Shared board: goals · assumptions · open conflicts · owners. Human and agent both write; conflicts flagged before execution.",
    evidence: [
      {
        quote:
          "You are inherently assuming that in a bank we have a single database, but the reality is not.",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
      {
        quote:
          "In Oman, we are not allowed to share financial crime data with the people who are making a credit decision. The China wall between these two functions, we can't share the data.",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
      {
        quote:
          "I do think that there's some communication layer there that is interesting problem to solve.",
        attribution: "Minh Pham, AOP study",
      },
    ],
  },
  {
    slug: "credential-boundary",
    hasReferenceDesign: true,
    pairsWith: "shared-cognitive-state",
    title: "Credential Boundary",
    backingStrength: "Strong",
    participants: "Alok, Everaldo",
    researchNote:
      "Maps to Value at the Boundary (U04), the sharpest \"why multi-agent\" argument in the research. Value peaks where no single agent can legally, technically, or organizationally hold all required access. Note: this is a positioning finding as much as a UI pattern.",
    oneliner:
      "Multi-agent value is strongest where no single agent can legally, technically, or organizationally hold all required access.",
    explanation:
      "Multi-agent isn’t about more models: it’s about crossing access walls. Design for federated credentials and purpose-bound agents instead of one super-agent with every key.",
    example:
      "Fraud agent (AML scope) + credit agent (lending scope) coordinate via policy broker; neither holds the other’s raw data.",
    evidence: [
      {
        quote:
          "In Oman, we are not allowed to share financial crime data with the people who are making a credit decision. The China wall between these two functions, we can't share the data.",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
      {
        quote:
          "You are inherently assuming that in a bank we have a single database, but the reality is not.",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
    ],
  },
  {
    slug: "disclosure-gradient",
    pairsWith: "presence-boundary",
    title: "Disclosure Gradient",
    backingStrength: "Strong",
    participants: "Everaldo, Dongxue",
    researchNote:
      "Maps to Trust Through Abstraction (U01): when multiple agents are made visible during active work, trust decreases even when they perform correctly. Reveal outcomes first, reasoning and coordination only on demand.",
    oneliner:
      "Surfacing all complexity at once drives cognitive overload. Reveal outcomes first, reasoning and coordination only on demand.",
    explanation:
      "Transparency of every sub-agent erodes trust and usability. Progressive disclosure keeps the default path simple while preserving depth for skeptics and auditors.",
    example:
      "Default: “Incident mitigated.” Expand: routing decision → agent graph → full trace (postmortem mode).",
    evidence: [
      {
        quote:
          "We did notice that when it is transparent that there are multiple agents behind the scenes, it becomes complex enough that people don't have as much trust in the system.",
        attribution: "Everaldo Aguiar, Director of Applied AI, PagerDuty",
      },
      {
        quote:
          "We had iterations where the user would have to specify which agent they wanted to interact with. That very quickly became complex enough that folks were just defaulting to how they used to operate beforehand.",
        attribution: "Everaldo Aguiar, Director of Applied AI, PagerDuty",
      },
    ],
  },
  {
    slug: "decision-ledger",
    pairsWith: "memory-commitment-review",
    title: "Decision Ledger",
    backingStrength: "Strong",
    participants: "Alok",
    researchNote:
      "Maps to Audit as First-Class Concern (U03): in regulated settings every autonomous decision creates documentation and explainability debt. Capture rationale at commit time; audit can't be retrofitted.",
    oneliner:
      "In regulated environments, every agent decision comes with a documentation obligation. Auditability can't be retrofitted.",
    explanation:
      "Regulators and internal risk teams ask “how did you get here?” The ledger captures decision rationale at commit time, not after an incident.",
    example:
      "Each automated decision logs: inputs · policy version · model · approver · exportable audit packet.",
    evidence: [
      {
        quote:
          "The regulator keeps probing us: can you explain how did you come to this outcome?",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
      {
        quote:
          "Every time we retrain, we have to keep that audit log, create documentation, make sure the right stakeholders fully understand the change between the previous model and the newly retrained model.",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
    ],
  },
  {
    slug: "incident-replay-view",
    pairsWith: "dependency-and-lineage-view",
    title: "Incident Replay View",
    backingStrength: "Strong",
    participants: "Everaldo",
    researchNote:
      "Maps to Retrospective Over Live (U02): full traces are valuable in postmortems but cause cognitive overload during live execution. Design two modes: minimal live, rich retrospective.",
    oneliner:
      "Detailed agent traces overload users mid-task but become valuable in postmortem and diagnostic review.",
    explanation:
      "Mid-incident, operators want abstraction and speed. Afterward, they want rich replay. The same data shouldn’t be forced into one mode.",
    example:
      "Live mode: minimal steps + outcome. Replay mode: scrubbed timeline with agent handoffs, tool calls, and divergence points.",
    evidence: [
      {
        quote:
          "If the idea is to have this be something used in practice mid-incident, folks really want to focus on just resolving the incident. The less information you provide and the more abstraction you build in, the better.",
        attribution: "Everaldo Aguiar, Director of Applied AI, PagerDuty",
      },
      {
        quote:
          "This I can see as something that would be very informative in retrospect, when you are doing a postmortem, learning from previous incidents, finding patterns.",
        attribution: "Everaldo Aguiar, Director of Applied AI, PagerDuty",
      },
    ],
  },
  {
    slug: "resolution-handshake",
    pairsWith: "signal-to-intent-handshake",
    title: "Resolution Handshake",
    backingStrength: "Moderate",
    participants: "Aman, Sahil",
    researchNote:
      "Maps to Conflict Resolution as an Explicit Step (U08): users expect a defined convergence point that produces an adopted answer or flags an impasse for a human.",
    oneliner:
      "Practitioners expect clear explanation of how multiple agents converged on an adopted answer, not just what was decided.",
    explanation:
      "When sub-agents disagree, users need to see convergence mechanics: what was adopted, what was flagged as impasse, and why, not a opaque final string.",
    example:
      "Panel: Agent A (logs) vs Agent B (code) → conflict resolver scores sources → “Adopted: rollback” · “Impasse: root cause unsettled.”",
    evidence: [
      {
        quote:
          "Think of it as the convergence, right, that you have here. So all of these different agents would feed into that convergence point, which was a conflict resolution agent, which would further feed in, which would further output the adopted answer versus the flag impasse.",
        attribution: "Aman Chadra, IoC concept sharing study",
      },
    ],
  },
  {
    slug: "certainty-boundary",
    evidenceStatus: "pending",
    pairsWith: "context-shaping-panel",
    title: "Certainty Boundary",
    backingStrength: "Thin",
    participants: "Anshu",
    researchNote:
      "Practitioners separate deterministic/API-driven work from dynamic generation, tying the latter to hallucination risk. Single-participant, engineering-framed; validate as an end-user concept.",
    oneliner:
      "Practitioners separate deterministic/API-driven work from dynamic generation, tying the latter to hallucination risk.",
    explanation:
      "Not every step should be LLM-improvised. Bound deterministic tool paths from open-ended planning so teams know where outputs are repeatable vs generative.",
    example:
      "Workflow map: green = fixed API steps · amber = planner chooses tools · red = dynamic generation (requires review).",
  },
];

// GTM / positioning findings from the synthesis with no corresponding UI
// component. Handled in messaging and sales, not in the pattern set above.
export const positioningFindings: PositioningFinding[] = [
  {
    id: "U10",
    title: "Multi-Agent Fatigue",
    statement:
      "Users skeptical from past multi-agent disappointment resist new approaches unless a clear, differentiated angle is shown.",
    strength: "Moderate",
    participants: "Dongxue",
    recommendation:
      "Name the prior failure modes and lead with the differentiated angle; don't assume 'multi-agent' is itself a selling point.",
  },
  {
    id: "U11",
    title: "Use-Case-Led Value, Not Framework-Led",
    statement:
      "Users engage when a concrete, industry-relevant use case is mapped to the system; abstract framework-first pitches lose them.",
    strength: "Moderate",
    participants: "Everaldo, Mehrad",
    recommendation:
      "Open with problems mapped to the user's domain; make 'why not one agent' concrete per use case.",
  },
  {
    id: "U12",
    title: "Data-Boundary Trust Drives Vendor Choice",
    statement:
      "Where a user's data already lives shapes which agent vendor they trust; same-platform solutions have an adoption edge.",
    strength: "Moderate",
    participants: "Alok",
    recommendation:
      "Address data residency and privacy explicitly; anticipate the 'my data's on X so I'll buy X's agent' objection.",
  },
];

export function getPattern(slug: string): Pattern | undefined {
  return patterns.find((p) => p.slug === slug);
}

export function getPatternStatus(pattern: Pattern): PatternStatus {
  return getEvidenceCount(pattern) > 0 ? "Grounded" : "Unverified";
}

export function getEvidenceCount(pattern: Pattern): number {
  return pattern.evidence?.length ?? 0;
}

export function getFilledBarCount(quoteCount: number): number {
  if (quoteCount <= 0) return 0;
  return Math.min(quoteCount, 4);
}

export function patternsSortedByEvidence(): Pattern[] {
  return [...patterns].sort(
    (a, b) => getEvidenceCount(b) - getEvidenceCount(a),
  );
}

export function getAdjacentPatterns(slug: string): {
  prev: Pattern | null;
  next: Pattern | null;
} {
  const index = patterns.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? patterns[index - 1]! : null,
    next: index < patterns.length - 1 ? patterns[index + 1]! : null,
  };
}

export function isEvidencePending(pattern: Pattern): boolean {
  return pattern.evidenceStatus === "pending";
}
