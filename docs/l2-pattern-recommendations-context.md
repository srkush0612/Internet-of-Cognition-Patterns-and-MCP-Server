# L2 Pattern Recommendations

## Purpose

Recommend interaction patterns for **L2: many agents, no person in the loop**. Use this document as design context when discussing or developing L2 patterns. It combines the attached *Let my agent talk to yours* use-case proposal with the practitioner research and pattern catalog already in this repository.

These recommendations are a synthesis, not a claim that all seven patterns have been validated. Preserve the distinction between source findings, proposal-derived ideas, and implementation choices.

## L2 definition

L2 describes coordination among multiple agents without a person participating in the exchange. The interaction itself should be legible as an agent-to-agent exchange or shared agent-facing state, rather than a human-facing interface rendered without its human.

People may establish identity, consent, policy, and authority before an L2 interaction begins or intervene through a separate L3 flow. An L2 pattern should not imply that an agent can obtain a person's approval while that person is absent.

## Scenario motivating the recommendations

The proposal describes four personal agents coordinating a birthday weekend across owners and platforms. They need to agree on dates, budget, and a venue; keep each principal's private information within its boundary; act only within granted authority; propagate changes; and establish that the task is complete using booking references.

The scenario is illustrative. The proposal's contract contents, candidate plans, and satisfaction scores are examples rather than observed personal-agent results.

## Where L2 patterns appear

L2 has no person-facing surface. These patterns should operate through agent-facing channels: **agent messages**, **shared records**, and **state signals**. Chat and settings panels are not L2 channels. A product may offer a human-readable trace in a separate operator or debugging view, but that trace is an inspection aid, not where the L2 interaction happens.

| Pattern | Primary L2 home | What peer agents exchange or read |
| --- | --- | --- |
| Intent Contract | Shared record | A versioned task contract with goal, roster, constraints, authority references, and completion conditions. Agents propose or acknowledge changes through agent messages; the accepted version is recorded. |
| Shared Meaning | Shared record, with agent messages for proposed definitions | A task glossary with canonical terms, units, and criteria. Each entry records its scope, provenance, and revision so agents use the same interpretation. |
| Boundary-Safe Exchange | Agent message through a policy or privacy broker | A permitted claim or conclusion with provenance and scope metadata. The broker enforces what can cross; restricted source data stays with its owner. |
| Constraint-Fair Selection | Shared record | Candidate options, per-principal constraints or permitted preference signals, the agreed selection rule, and the resulting choice or infeasibility. Agents submit structured evaluations rather than relying on conversational persuasion. |
| Negotiated Commitment | Agent messages plus a shared commitment record | Structured propose, counter, accept, reject, or impasse messages. The record captures the binding result, its terms, and the authority basis. |
| Change Propagation | State signal plus shared record | A versioned delta announcing what changed, which shared assumptions or decisions it affects, and what needs revalidation. Peers receive the signal and update the common record. |
| Evidence-Backed Completion | Shared record plus a completion state signal | Required completion conditions, evidence references, verification status, exceptions, and the final completion event. The signal announces completion only after the record satisfies the contract. |

The transport can be a group channel or protocol carrying these payloads; the pattern is the interaction and record semantics, not a particular vendor UI. The PDF proposes A2A over a group transport as one implementation direction, not as a requirement of the patterns.

## Recommended patterns

### 1. Intent Contract

Before coordinated work begins, agents establish a shared task frame: the goal, participating agents and whom they represent, constraints, limits of authority, and verifiable conditions for completion. The contract is inspectable and versioned so later changes can be identified.

**Pattern boundary:** Establish the task agreement. Do not treat the contract as a grant of new permissions or as a substitute for a principal's consent.

**Proposal connection:** L9-ACCORD creates an Intent Contract before agents propose a plan.

**Evidence status:** Proposal-derived hypothesis; validate whether agents can establish and maintain this contract reliably across platforms and principals.

### 2. Shared Meaning

Agents identify ambiguous terms, units, and decision criteria that affect the task, agree on operational definitions, and keep those definitions available to every participant. If the task or context changes, agents reopen only the affected definitions.

**Pattern boundary:** Align vocabulary and interpretation. Keep the broader goal, authority, constraints, and completion conditions in the Intent Contract.

**Proposal connection:** “Weekend” and “cheap dinner” receive explicit definitions before options are compared. The proposal associates this need with Engine CE-7, Shared Meaning Curator.

**Evidence status:** The ambiguity problem is grounded in the proposal's failure scenario; the pattern design remains a hypothesis.

### 3. Boundary-Safe Exchange

Agents exchange task-relevant conclusions while preserving the access boundaries of the people and organizations they represent. Each exchanged claim carries enough provenance and scope to be used safely, without exposing protected source data or reasons.

**Pattern boundary:** Govern what crosses between agents. Identity verification, consent, and authorization can be supplied by protocol or policy infrastructure; the pattern must not imply that L2 agents can ask an absent person for permission.

**Proposal connection:** Dev's agent can reveal free/busy status but not the reason. The scenario also includes an employer as a principal with its own boundary.

**Repository connection:** Extend **Credential Boundary**, which is already identified as applicable to peer agents but currently centers its primary presentation on a person-in-the-loop setting. **Source Attribution** can carry provenance with exchanged claims.

**Evidence status:** Credential Boundary has strong evidence in the repository's catalog. The cross-principal personal-agent application is proposed and still needs validation.

### 4. Constraint-Fair Selection

Agents compare candidate plans against each represented person's constraints and an agreed minimum satisfaction threshold. They select an option that satisfies the floor for everyone, or return an explicit infeasibility or impasse result when no option qualifies.

**Pattern boundary:** Choose among group preferences and constraints. Do not collapse it into **Convergence Point**, which reconciles conflicting conclusions and evidence rather than optimizing a shared choice.

**Proposal connection:** L9-CONCORD selects the option with the strongest minimum satisfaction rather than accepting the first or loudest proposal. The proposal's scores are illustrative.

**Evidence status:** Proposal-derived hypothesis. Validate its fairness criteria, how thresholds are set, and how it handles incomparable or missing preferences.

### 5. Negotiated Commitment

Agents exchange structured proposals and counterproposals, then record acceptance, rejection, or impasse. A proposal becomes binding only through an explicit commitment state; tentative language cannot silently authorize an irreversible action.

**Pattern boundary:** Negotiate and record agreement before action. Execution remains subject to the authority and consent established for each agent.

**Proposal connection:** Addresses the failure where “Friday could work” is interpreted as permission to buy a non-refundable ticket, and the failure where agents debate without reaching a binding decision.

**Repository connection:** The v2 gap analysis identifies **Negotiate** as a missing pattern: settling scope or resources before conflict, rather than reconciling conclusions after one.

**Evidence status:** A clear catalog gap plus proposal-derived use cases; the pattern's protocol and response vocabulary still need design and validation.

### 6. Change Propagation

When an agent learns that a shared assumption, constraint, or plan has changed, it publishes a structured update to affected peers. The group identifies dependent decisions and rechecks or revises them before continuing.

**Pattern boundary:** Communicate and reconcile changes to shared work. Preserve the previous state and the reason for change when needed for audit or recovery.

**Proposal connection:** A delayed flight should reach the group and trigger a dinner-time change, rather than remaining known only to one agent.

**Repository connection:** Can compose with **Shared Cognitive State**, **Activity Record**, and **Lineage View**; those patterns respectively support common state, history, and dependent-work tracing.

**Evidence status:** Scenario-derived hypothesis. Validate update delivery, conflict handling, and recovery from stale or missed updates.

### 7. Evidence-Backed Completion

Agents mark shared work complete only when each completion condition in the task agreement has supporting evidence. The completion record identifies the outcome, evidence, responsible agent, and any remaining exception or unresolved condition.

**Pattern boundary:** Verify that agreed outcomes occurred. A message saying “confirmed” is not itself proof when the task requires an external receipt or other evidence.

**Proposal connection:** The trip is done only when flight and table references exist and the agreed spending conditions have been met.

**Repository connection:** Extend **Source Attribution** and **Structured Finding** to a task-level completion gate. The proposal associates this need with Engine CE-22, Groundedness & Evidence Verification.

**Evidence status:** Proposal-derived hypothesis. The PDF reports verification-collapse measurements from IoC multi-agent experiments, but explicitly says the results have not yet been measured on personal agents.

## Existing pattern foundations

Use these existing catalog patterns as foundations or adjacent patterns rather than duplicating them without a clear distinction:

- **Credential Boundary:** partitioned access and coordination without pooling restricted data; strongest candidate to make L2-primary.
- **Convergence Point:** compare conflicting conclusions, adopt one with reasoning, or flag an impasse. Keep separate from preference-based group choice.
- **Source Attribution:** carry provenance with claims so peer agents can verify them before relying on them.
- **Capability Manifest:** let peers discover an agent's capabilities and operating limits. Identity, consent, and authority still need appropriate protocol or policy support.
- **Shared Cognitive State:** maintain common goals, assumptions, conflicts, and open questions. Distinguish ongoing shared state from the upfront Intent Contract.
- **Activity Record and Lineage View:** support event history and tracing downstream work affected by changed or disputed outputs.
- **Structured Finding:** express claims, confidence, and sources in a form that agents can compare or verify.

## Suggested initial priority

For an initial L2 design and validation pass, prioritize:

1. **Intent Contract** — establish shared purpose and completion conditions.
2. **Boundary-Safe Exchange** — define safe cross-agent information flow.
3. **Negotiated Commitment** — make agreement and authority states explicit.
4. **Constraint-Fair Selection** — test group decisions against individual constraints.
5. **Evidence-Backed Completion** — verify outcomes before declaring success.

Treat Shared Meaning and Change Propagation as important supporting patterns. They may be designed alongside the initial set if the use case depends on ambiguous terms or changing plans.

## Evidence and confidence notes

- The repository's practitioner research includes findings about access boundaries, trust, cognitive overload, and convergence. The existing pattern catalog labels evidence strength per pattern; do not transfer one pattern's evidence rating to a new proposal-derived pattern.
- The attached proposal reports multi-agent experimental measurements for herding and verification failures, but says those measurements have not yet been run on personal agents.
- The Lisbon scenario, satisfaction matrix, proposed engine mapping, and cross-vendor implementation plan are illustrative or proposed, not established findings.
- Validate L2 patterns through agent-only exchanges. Measure at least task success, minimum satisfaction or constraint violations, unauthorized disclosure, ambiguous or false commitments, change propagation, evidence completeness, and unnecessary human escalations.
- When a decision requires a person, surface it as an explicit boundary to a separate human-facing flow. Do not hide human approval inside an L2 pattern.

## Sources

- Attached proposal: `let-my-agent-talk-to-yours.pdf` (October 2026).
- Repository research patterns: [`patterns.md`](../patterns.md).
- L2 participant definition and channels: [`lib/v2/levels.ts`](../lib/v2/levels.ts).
- Existing catalog entries and evidence labels: [`lib/v2/catalog.ts`](../lib/v2/catalog.ts).
- Catalog gaps, including thin L2 coverage and missing Negotiate pattern: [`lib/v2/gaps.ts`](../lib/v2/gaps.ts).
