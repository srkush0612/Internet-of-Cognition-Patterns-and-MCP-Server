# Decision Ledger Pattern — Instructions & Rules

## Pattern Summary

**Name:** Decision Ledger  
**Question it answers:** "Why was this decision made?"  
**Key insight:** Preserves the reasoning behind a single decision. When NO disagreement exists, this pattern shows what was considered and why something was chosen.

---

## What This Pattern Does

Documents a decision with full context: what was being decided, what options existed, which was chosen, and why.

Shows:
- What decision needed to be made
- What options were considered
- Which option was chosen
- Why that option won (reasoning, constraints, trade-offs)
- Who decided
- When it was decided

---

## Research Findings: Why This Pattern Is Needed

**From 14 practitioner interviews, we found:**

**Core need (direct quote):**  
"We need to capture reasoning behind decisions. Six months later, someone asks 'why did we choose X?' and we've lost the context."

**Typical scenario:**  
Single decision-maker (CTO, PM) evaluates options and picks one. Team needs to understand: what made this better than alternatives? What constraints drove it?

**Problem this solves:**  
"Decisions made in the moment lose their reasoning when time passes. We want to record not just WHAT was decided, but WHY."

---

## Field Definitions & Requirements

### Required Fields

**decision**
- Type: string (1-2 sentences)
- What is being decided? (Not what was chosen, but what choice needed to happen)
- Example: "Choose between immediate rollout vs. delayed rollout with testing"
- Error if missing: "What decision needed to be made?"

**chosen**
- Type: string (the actual choice made)
- Example: "Delayed rollout with full QA cycle (2 weeks)"
- Error if missing: "Which option was chosen?"

**reasoning**
- Type: string (1-3 sentences)
- Why was chosen option picked? What made it better?
- Example: "Risk of production incident outweighs speed-to-market. Testing phase catches integration bugs before launch."
- Error if missing: "Why was this option chosen?"

### Strongly Recommended Fields

**alternatives**
- Type: string (other options that were considered)
- Example: "Immediate rollout (faster but riskier), phased rollout (middle ground)"
- Warning if missing: "What other options were considered?"

**decided_by**
- Type: string (who made the decision)
- Example: "CTO" or "Product team consensus"
- Warning if missing: "Who made this decision?"

**constraints**
- Type: string (what limited the choices)
- Example: "Team capacity was 2 weeks. Budget was fixed. No external dependencies."
- Warning if missing: "What constraints shaped this decision?"

### Optional Fields

**trade_offs**
- What was given up to choose this option?
- Example: "Speed traded for reliability"

**when_decided**
- Timestamp or date range

---

## Validation Rules (For Code)

```
REQUIRED VALIDATION:
  if (!decision || decision.trim().length === 0) {
    error: "What decision needed to be made?"
    action: DISABLE_SAVE
  }
  
  if (!chosen || chosen.trim().length === 0) {
    error: "Which option was chosen?"
    action: DISABLE_SAVE
  }
  
  if (!reasoning || reasoning.trim().length === 0) {
    error: "Why was this option chosen?"
    action: DISABLE_SAVE
  }

RECOMMENDED VALIDATION:
  if (!alternatives || alternatives.trim().length === 0) {
    warning: "What other options were considered?"
    action: ALLOW_SAVE_BUT_SHOW_WARNING
  }
  
  if (!decided_by || decided_by.trim().length === 0) {
    warning: "Who made this decision?"
    action: ALLOW_SAVE_BUT_SHOW_WARNING
  }
  
  if (!constraints || constraints.trim().length === 0) {
    warning: "What constraints shaped this choice?"
    action: ALLOW_SAVE_BUT_SHOW_WARNING
  }

ANTI-PATTERNS:
  if (reasoning.length < 5 && !alternatives) {
    warning: "Reasoning is sparse. Add context (constraints? trade-offs?) to make decision clearer."
    action: SHOW_WARNING
  }
```

---

## User-Facing Guidance

### Recommendation Message

**Confidence >= 70%:**

```
✓ Decision Ledger  
Recommended based on your scenario

Why this pattern?  
• Single decision documented with reasoning
• Clear choice made (not disagreement)
• Preserves WHY it was chosen, not just what

Research shows this is needed when:  
'We need to capture reasoning behind decisions. 
Six months later, someone asks why we chose X and we've lost the context.'

[Try this] [Learn more]
```

### Extraction Questions (Priority Order)

1. **"What decision needed to be made?"**  
   → Fills decision field  
   → Example: "Choose deployment timing"

2. **"What options were you considering?"**  
   → Fills alternatives field  
   → Example: "Immediate rollout, phased rollout, delayed rollout"

3. **"Which option did you choose?"**  
   → Fills chosen field  
   → Example: "Phased rollout over 2 weeks"

4. **"Why was that the best choice?"**  
   → Fills reasoning field  
   → Example: "Risk mitigation was higher priority than speed"

5. (Optional) **"Who made this decision?"**  
   → Fills decided_by  
   → Example: "CTO", "Product team", "Cross-functional consensus"

6. (Optional) **"What constraints shaped this?"**  
   → Fills constraints  
   → Example: "Team capacity, budget, timeline"

### Error Messages

**Missing decision:**  
"What decision needed to be made? (e.g., 'Choose between A, B, or C')"

**Missing chosen option:**  
"Which option did you actually choose?"

**Missing reasoning:**  
"Why was that option better? What made it win over alternatives?"

### Warning Messages

**Missing alternatives:**  
"💡 What other options were considered? Helps show why this choice was best."

**Missing decision authority:**  
"💡 Who made this decision? (CTO, team, consensus, etc.)"

**Reasoning too vague:**  
"💡 Add more context to reasoning. What constraints or trade-offs shaped this? What made this choice stand out?"

---

## Field Guide: Good vs. Bad

### decision

**❌ Too vague:**
- "Make a choice"
- "Decide something"

**✓ Good:**
- "Choose between immediate rollout vs. delayed rollout with testing"
- "Select deployment strategy for Q4 release"
- "Decide whether to refactor legacy payment service"

**Pattern:**  
"Choose between [option A], [option B], and [option C]"

---

### chosen

**❌ Too vague:**
- "Option 1"
- "Approved"
- "Yes"

**✓ Good:**
- "Phased rollout over 2 weeks with QA checkpoint before each phase"
- "Immediate launch, but with on-call rotation for first 48 hours"
- "Hold refactor until Q1 2025 when team capacity increases"

**Pattern:**  
Describe the actual decision, not just "we picked A"

---

### reasoning

**❌ Too vague:**
- "It was better"
- "Team agreed"
- "Seemed right"

**✓ Good:**
- "Risk of production incident outweighs speed-to-market. Testing phase catches integration bugs before launch. Historical data shows 3 bugs per major release typically found in QA."
- "Budget constraint: can't hire additional on-call staff. Phased approach allows existing team to validate each phase with lower pressure."
- "Refactor has high opportunity cost right now. Core features are shipping. Can defer 6 months without impacting roadmap."

**Pattern:**  
"[Priority] outweighs [alternative]. [Evidence or reasoning]. [Constraint or context]."

---

## Common Mistakes & Auto-Corrections

### Mistake 1: Confusing Decision with Convergence

**What user does:**  
"3 agents disagreed. We decided to go with option B."

**Why it's a problem:**  
There's disagreement here, so this is Convergence Point, not Decision Ledger.

**Auto-correction:**  
"This sounds like multiple agents disagreed and then converged. That's Convergence Point (shows HOW conflict was resolved). Decision Ledger is for single decisions without conflict. Does this have multiple opposing views?"

### Mistake 2: Reasoning Missing

**What user does:**  
"Decision: use AWS vs. Google Cloud. Chosen: AWS."

**Why it's a problem:**  
No reasoning shown. This loses the entire value of the pattern.

**Auto-correction:**  
"Why was AWS better than Google Cloud? What made you choose it? (Cost? Team expertise? Existing infrastructure?)"

### Mistake 3: Only One Option

**What user does:**  
"Decision: Should we use database X? Chosen: Yes."

**Why it's a problem:**  
No real choice = no decision. Pattern doesn't apply.

**Auto-correction:**  
"Was there another option you could have chosen instead? If not, this might be more of an approval/commitment than a decision. What alternatives existed?"

---

## When to Recommend Other Patterns

### If multiple agents disagreed
→ **Use Convergence Point** (shows how disagreement was resolved)

### If you want to show root cause of poor decisions
→ **Also use Assumption Surface** (shows what assumptions led to this choice)

### If decision happened over time with phases
→ **Also use Deferred Detail** (shows how decision evolved)

### If multiple roles/expertise were needed
→ **Also use Credential Boundary** (shows why multiple people were required)

---

## Metrics for Success

User has created a good Decision Ledger instance if:
- ✓ Clear decision statement (what choice needed to happen)
- ✓ 2+ alternatives named (showed you had options)
- ✓ Specific chosen option (not vague)
- ✓ Real reasoning (why it won, not just "we picked it")
- ✓ Constraints or context visible (what shaped the choice)
- ✓ Someone can read it in 6 months and understand why

**Practitioner quote:**  
"I can see why this decision was made, not just what was decided."

---

## Anti-Patterns

❌ Single option, no alternatives → Not really a decision  
❌ No reasoning given → Loses the whole point of pattern  
❌ Reasoning is "everyone agreed" → Too vague, needs actual reasoning  
❌ Multiple disagreeing agents → Use Convergence Point instead

---

## Example Scenarios

### Example 1: Technology Choice (From Interview Research)

```
Decision: Choose between immediate AWS migration vs. gradual multi-cloud strategy
Alternatives: 
  - Immediate full migration (fastest, riskiest)
  - Gradual migration by service (moderate risk/time)
  - Stay on-premise (lowest risk, highest cost)
Chosen: Gradual migration by service, 6-month timeline
Reasoning: Risk mitigation is highest priority given downtime incidents in past. 
Gradual approach allows testing at each step. Team capacity (3 engineers) can handle 
one service per sprint. Vendor lock-in risk is eliminated with multi-cloud eventual state.
Decided by: CTO with engineering lead consensus
Constraints: 
  - Budget: $500K for infrastructure + migration
  - Team: 3 engineers, other priorities
  - Timeline: Must complete by end of year for compliance
Research finding: "We need to capture reasoning behind decisions. Six months later, 
someone asks why we chose gradual migration and we've lost the context."
```

### Example 2: Product Decision (From Interview Research)

```
Decision: Prioritize feature A vs. feature B vs. technical debt for Q4
Alternatives:
  - All feature A (customer revenue +15%)
  - All feature B (strategic positioning but low revenue impact)
  - Split between feature A + technical debt
  - All technical debt (no revenue, high impact)
Chosen: Split: 60% feature A (revenue goal), 40% technical debt (payment system refactor)
Reasoning: Revenue target requires feature A. But payment system is failing at scale; 
each incident costs $50K. Technical debt work prevents 3-month crisis predicted by 
engineering. Balanced approach meets financial and operational goals.
Decided by: Product + Finance + Engineering (consensus after trade-off review)
Trade-offs: Feature B deferred to Q1. Reduced velocity from tech work.
Research finding: "Decisions made in the moment lose their reasoning when time passes."
```

### Example 3: Process Decision (From Interview Research)

```
Decision: Code review process — require 2 approvals vs. 1 approval
Alternatives:
  - 1 approval (faster, more bugs slip through)
  - 2 approvals (slower, catches more bugs)
  - Approval + automated tests only (fast if tests comprehensive)
Chosen: 1 approval + mandatory tests + automated linting
Reasoning: Data showed 2 approvals reduced bugs by 8% but slowed PR time by 35%. 
Equivalent reduction (10% bug reduction) achieved with strong test + lint coverage 
(only 5% velocity impact). Team prefers faster feedback. Test suite already covers 
92% of codebase.
Decided by: Engineering lead after analyzing metrics
Constraints:
  - Test suite already exists
  - Team values fast iteration
  - Production incident cost is ~$20K
Research finding: "Preserve the reasoning behind decisions."
```

---

## System Message Guidelines

**DO:**
- ✓ "Shows why a decision was made" (clear)
- ✓ "You made one choice from several options — this pattern captures why"
- ✓ "Add reasoning: what made this option better than alternatives?"
- ✓ "This is a single decision, not disagreement" (honest redirect)
- ✓ "Research shows teams need to preserve decision reasoning"

**DON'T:**
- ❌ "Documents a consensus" (too broad)
- ❌ Generic guidance without referencing their scenario
- ❌ Recommend if multiple agents clearly disagreed

---

## Implementation Checklist (For Cursor)

**Validation:**
- [ ] Error if decision is empty
- [ ] Error if chosen is empty
- [ ] Error if reasoning is empty
- [ ] Warning if alternatives missing
- [ ] Warning if decided_by missing
- [ ] Warning if reasoning too sparse

**Guidance:**
- [ ] Show field tips (good vs. bad examples)
- [ ] Ask extraction questions in priority order
- [ ] Auto-detect common mistakes
- [ ] Show specific error messages

**Messages:**
- [ ] Recommendation references research
- [ ] Warnings use gentle tone
- [ ] Errors are specific and actionable
