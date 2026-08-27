# Deferred Detail Pattern — Instructions & Rules

## Pattern Summary

**Name:** Deferred Detail  
**Question it answers:** "How did this process unfold over time? What phases, handoffs, and escalations happened?"  
**Key insight:** Shows temporal decomposition. When a complex process happens in phases with handoffs between agents, this pattern reveals the sequence and why detail was deferred.

---

## What This Pattern Does

Documents processes that unfold in stages. Shows: what was decided/done at each phase, why detail was deferred, where handoffs occurred, what triggered transitions.

Shows:
- Phase/stage breakdown
- What each agent owned at each phase
- Why detail was deferred (not decided upfront)
- Handoff points and what triggered them
- Evolution of the process over time
- Final outcome

---

## Research Findings: Why This Pattern Is Needed

**From 14 practitioner interviews, we found:**

**Core need (direct quote):**  
"We don't decide everything upfront. We discover as we go. Phase 1 is exploration. Phase 2 is prototyping. Phase 3 is scaling. Each phase has different constraints and decisions."

**Typical scenario:**  
Q1: Research options (light weight decision). Q2: Prototype (medium commitment). Q3: Scale (full commitment). Each phase built on prior learning. Decisions weren't pre-determined.

**Problem this solves:**  
"We make decisions that evolve. We defer detail because we don't have enough information. But we lose the record of why detail was deferred and what unlocked the next phase."

---

## Field Definitions & Requirements

### Required Fields

**overall_goal**
- Type: string (what was the multi-phase effort trying to accomplish?)
- Example: "Migrate from legacy payment system to modern platform"
- Error if missing: "What was the overall goal? (This is pursued across phases)"

**phases**
- Type: ordered array (phase name, duration, owner, what was delivered)
- Format: "Phase 1 [Q1]: Evaluation [Finance + Eng]. Phase 2 [Q2]: Pilot [Eng]. Phase 3 [Q3]: Rollout [Ops]."
- Example: See field guide
- Error if missing: "What phases happened? In what order?"

**deferred_details**
- Type: mapping (phase → what wasn't decided yet, and why)
- Format: "Phase 1: Didn't decide on scale (no real-world data yet). Phase 2: Didn't decide on ops model (needed pilot results)."
- Example: See field guide
- Error if missing: "What detail was deferred from each phase and why?"

### Strongly Recommended Fields

**handoff_points**
- Type: mapping (phase boundary → what triggered transition, who owned what)
- Example: "Phase 1→2: Evaluation complete, pilot approved. Finance handed to Engineering."
- Warning if missing: "What triggered each phase transition?"

**phase_learnings**
- Type: string (what did each phase teach us?)
- Example: "Phase 1: Confirmed cost savings (20%). Phase 2: Discovered integration complexity. Phase 3: Showed team didn't need ops retraining."
- Warning if missing: "What did you learn from each phase?"

### Optional Fields

**constraints_by_phase**
- What constraints existed at each phase?
- Example: "Q1: Budget constraint. Q2: Team capacity constraint. Q3: Timeline constraint."

**decision_gates**
- Go/no-go decisions at each phase boundary
- Example: "Phase 1→2 gate: cost savings must be >15% (was 20%, go). Phase 2→3 gate: pilot must be stable (it was, go)."

---

## Validation Rules (For Code)

```
REQUIRED VALIDATION:
  if (!overall_goal || overall_goal.trim().length === 0) {
    error: "What was the overall goal being pursued?"
    action: DISABLE_SAVE
  }
  
  if (!phases || phases.length < 2) {
    error: "Deferred Detail requires 2+ phases. If single decision, use Decision Ledger."
    action: DISABLE_SAVE
  }
  
  if (!deferred_details || deferred_details.trim().length === 0) {
    error: "What detail was deferred from each phase and why?"
    action: DISABLE_SAVE
  }

RECOMMENDED VALIDATION:
  if (!handoff_points || handoff_points.trim().length === 0) {
    warning: "What triggered each phase transition? (Phase 1→2 gate, etc.)"
    action: ALLOW_SAVE_BUT_SHOW_WARNING
  }
  
  if (!phase_learnings || phase_learnings.trim().length === 0) {
    warning: "What did each phase teach you?"
    action: ALLOW_SAVE_BUT_SHOW_WARNING
  }

ANTI-PATTERNS:
  if (phases.length === 1) {
    error: "Only 1 phase? This is single decision (Decision Ledger), not deferred process."
    action: DISABLE_SAVE
  }
  
  if (!temporal_markers) {
    warning: "Use time markers (Q1, Month 2, Phase 1, etc.) to show sequence clearly"
    action: SHOW_SUGGESTION
  }
```

---

## User-Facing Guidance

### Recommendation Message

```
✓ Deferred Detail  
Recommended based on your scenario

Why this pattern?  
• Multi-phase process that unfolded over time
• Detail deferred because you discovered as you went
• Shows why each phase couldn't predict the next

Research shows this is needed when:  
'We don't decide everything upfront. Each phase has 
different constraints and decisions.'

[Try this] [Learn more]
```

### Extraction Questions (Priority Order)

1. **"What was the overall goal being pursued?"**  
   → Fills overall_goal

2. **"What phases happened in sequence?"**  
   → Fills phases  
   → Example: "Q1: Research. Q2: Pilot. Q3: Scale. Q4: Optimize."

3. **"What was decided at each phase?"**  
   → Fills phases (decision/deliverable)  
   → Example: "Q1: decided on vendor. Q2: decided on scope. Q3: decided on timeline."

4. **"What detail was deferred from each phase and why?"**  
   → Fills deferred_details  
   → Example: "Q1: deferred scale (no data). Q2: deferred ops model (needed pilot results)."

5. (Optional) **"What triggered each phase transition?"**  
   → Fills handoff_points  
   → Example: "Phase 1 complete → Phase 2 started. Pilot stable → Rollout approved."

6. (Optional) **"What did each phase teach you?"**  
   → Fills phase_learnings

### Error Messages

**Missing overall goal:**  
"What was the multi-phase effort trying to accomplish?"

**Only 1 phase:**  
"Deferred Detail is for multi-phase processes. If it's a single decision, use Decision Ledger."

**Missing deferred details:**  
"What wasn't decided at each phase? Why did you defer it? (Usually: not enough information yet)"

### Warning Messages

**Missing handoff info:**  
"💡 What triggered each phase transition? (Phase 1 complete, results good → Phase 2 approved)"

**Missing learnings:**  
"💡 What did each phase teach you that enabled the next phase?"

---

## Field Guide: Good vs. Bad

### phases

**❌ Too vague:**
- "Phase 1, Phase 2, Phase 3"
- "Start, middle, end"

**✓ Good:**
- "Q1 (Research & Evaluation): Finance + Engineering. Deliverable: vendor selection report + cost analysis. Duration: 8 weeks."
- "Month 1-2 (Discovery): Product + Engineering. Deliverable: requirements, technical spec, prototype. Owner: Product Lead."
- "Phase 1 (MVP): Ship core features. Owner: Engineering. Timeline: 6 weeks. Constraints: team of 3, no new hires."

**Pattern:**  
"[Time] ([Name]): [owner]. Deliverable: [what shipped]. Duration: [weeks/months]."

---

### deferred_details

**❌ Too vague:**
- "Decided later"
- "Wasn't sure yet"

**✓ Good:**
- "Q1: Deferred scale discussion (no real-world data on usage patterns yet). Deferred ops model (needed pilot results to understand load)."
- "Phase 1: Deferred rollout strategy (needed to know integration complexity). Deferred training plan (needed to see actual issues in pilot)."
- "Month 1: Deferred architecture (needed to validate that vendor's API was performant). Deferred security hardening (needed to see which data flows mattered most)."

**Pattern:**  
"[Phase]: Deferred [detail] (no [information needed yet]). Deferred [detail] (needed [result from next phase])."

---

### handoff_points

**❌ Too vague:**
- "Moved to next phase"
- "Transition happened"

**✓ Good:**
- "End of Q1: Evaluation complete, cost savings validated (20% vs. target 15%). Gate passed: approved for pilot. Ownership: Finance → Engineering for implementation."
- "Pilot complete (M2 end): Integration works, load testing shows 3x capacity needed. Gate passed: production-ready. Ownership: Engineering → Operations for rollout planning."

**Pattern:**  
"End of [Phase]: [gate criteria] [result]. Gate: [approved/blocked]. Ownership: [A] → [B]."

---

## Common Mistakes & Auto-Corrections

### Mistake 1: Single Phase Disguised as Multiple

**What user does:**  
"Phase 1: Decision. Phase 2: Implementation (same decision, just execution)."

**Why it's a problem:**  
If Phase 2 is just "implement Phase 1's decision", there's no deferred detail. It's a single decision.

**Auto-correction:**  
"Phase 2 just executes Phase 1? Or did Phase 2 discover something that changed the decision? If discovery happened, that's Deferred Detail. Otherwise, it's Decision Ledger."

### Mistake 2: Missing the "Why" on Deferred Details

**What user does:**  
"Phase 1: chose vendor. Phase 2: chose scale. Phase 3: chose ops model."

**Why it's a problem:**  
Says what was decided, not WHY detail was deferred. Missing the key insight.

**Auto-correction:**  
"Why didn't you decide scale in Phase 1? Why Phase 2? (Usually: 'didn't have load data yet'). That's the deferred detail insight."

### Mistake 3: Linear Waterfall Assumed

**What user does:**  
"Phase 1 learnings were unknown until end. Phase 2 couldn't start until Phase 1 was 100% done."

**Why it's a problem:**  
Most real processes have overlap, feedback, iteration. Pure waterfall is rare.

**Auto-correction:**  
"Did phases overlap? Did Phase 1 findings affect Phase 2 mid-way? Real processes are messier than waterfall. That's okay to show."

---

## When to Recommend Other Patterns

### If multiple agents disagreed within/across phases
→ **Also use Convergence Point** (shows how conflict resolved)

### If phases were driven by different assumptions
→ **Also use Assumption Surface** (shows different beliefs)

### If different roles owned different phases
→ **Also use Credential Boundary** (shows why each role was needed)

### If agents entered the process at different phases
→ **Also use Presence Boundary** (shows who knew what when)

---

## Metrics for Success

User has created a good Deferred Detail instance if:
- ✓ 2+ phases clearly sequenced (temporal order)
- ✓ Each phase's output/learning visible
- ✓ Deferred details named (what wasn't decided, why)
- ✓ Handoff points clear (what triggered transitions)
- ✓ Next phase enabled by prior learning
- ✓ Someone can see: "Phase 1 deferred X because we lacked Y. Phase 2 provided Y, enabling Z decision in Phase 3."

**Practitioner quote:**  
"I can see how each phase discovered something that enabled the next decision."

---

## Anti-Patterns

❌ Single phase → Use Decision Ledger  
❌ No discovery/learning between phases → Not truly deferred detail  
❌ Phases in parallel (not sequential) → Might be Credential Boundary  
❌ Missing "why" on deferred details → Loses the insight

---

## Example Scenarios

### Example 1: Platform Migration (From Interview Research)

```
Overall goal: Migrate payment system from legacy on-premise to modern cloud platform

Phases:
Q1 (Research & Evaluation, 8 weeks):
  Owner: Finance + Engineering
  Deliverable: Vendor selection, cost analysis, technical requirements
  Constraints: Limited pilot budget

Q2 (Pilot Implementation, 12 weeks):
  Owner: Engineering (Platform Team)
  Deliverable: Working pilot, integration tests, load testing results
  Constraints: 3 engineers, parallel to legacy system

Q3 (Production Rollout, 8 weeks):
  Owner: Operations + Engineering
  Deliverable: Full production migration, monitoring, runbooks
  Constraints: Zero downtime requirement

Deferred details:
Q1: Deferred ops model discussion (needed pilot data on incident patterns)
Q1: Deferred rollout strategy (needed to understand integration complexity)
Q2: Deferred scaling decisions (needed real-world load data from pilot)
Q2: Deferred team training (needed to see actual failure modes)

Handoff points:
Q1→Q2 gate: Cost savings validated (20% vs. target 15%), technical feasibility confirmed
  → Ownership: Finance hands to Engineering; Engineering owns pilot
Q2→Q3 gate: Pilot stable under 10x load, all edge cases documented
  → Ownership: Engineering hands to Operations; Operations owns rollout

Phase learnings:
Q1: Confirmed cost savings, identified API performance as risk
Q2: Discovered integration complexity was 3x estimated; scaling needs were higher
Q3: Team needed week of training; runbooks caught 80% of incidents before they happened

Research finding: "We don't decide everything upfront. Each phase has 
different constraints and decisions."
```

### Example 2: Product Launch (From Interview Research)

```
Overall goal: Launch new subscription product from initial concept to revenue

Phases:
M1-2 (Discovery & Design):
  Owner: Product + Design
  Deliverable: User research, feature list, prototype, business case
  Constraints: Limited user interviews (5 customers)

M3-4 (MVP Build & Beta):
  Owner: Engineering + Product
  Deliverable: Functional MVP, beta with 100 customers, metrics dashboard
  Constraints: 4 engineers, 3-month timeline

M5-6 (General Availability & Scale):
  Owner: Operations + Marketing + Product
  Deliverable: Production readiness, go-to-market, launch
  Constraints: Revenue target $50K MRR by end M6

Deferred details:
M1-2: Deferred pricing model (needed to see what features users valued)
M1-2: Deferred support model (needed to see what customers struggled with)
M3-4: Deferred scaling architecture (needed production traffic patterns)
M3-4: Deferred churn intervention (needed to understand why betas churned)

Handoff points:
M2→M3 gate: 5 customers validated core problem, willingness to pay confirmed
  → Ownership: Product → Engineering (build phase)
M4→M5 gate: Beta at 100 customers, NPS 45+, feature-complete
  → Ownership: Product → Operations (launch phase)

Phase learnings:
M1-2: Discovered target customer was not initially assumed profile; features valued differently
M3-4: Churn was high (40% at 30-day), but driven by feature gaps, not price
M5-6: Revenue target achieved at $52K MRR; churn reduced to 8% once missing features shipped

Research finding: "Phase 1 is exploration. Phase 2 is prototyping. Phase 3 is scaling. 
Each phase has different constraints and decisions."
```

---

## System Message Guidelines

**DO:**
- ✓ "Shows how decisions unfolded over time" (clear)
- ✓ "What was decided at each phase?"
- ✓ "Why was detail deferred? (Not enough info yet?)"
- ✓ "What trigger moved you from phase to phase?"
- ✓ "Use temporal markers (Q1, M2, Phase 1, etc.)"

**DON'T:**
- ❌ "Documents a project timeline" (too generic)
- ❌ Generic guidance without phases/detail deferral

---

## Implementation Checklist (For Cursor)

**Validation:**
- [ ] Error if overall_goal missing
- [ ] Error if phases < 2
- [ ] Error if deferred_details missing
- [ ] Warning if handoff_points missing
- [ ] Warning if phase_learnings missing
- [ ] Suggest temporal markers (Q, Month, Phase, Week)

**Guidance:**
- [ ] Show field tips with examples
- [ ] Ask extraction questions in order
- [ ] Guide toward "what was deferred and why?"

**Messages:**
- [ ] Recommendation references research
- [ ] Errors guide toward multi-phase thinking
