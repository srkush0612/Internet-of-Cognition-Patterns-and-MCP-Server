# Assumption Surface Pattern — Instructions & Rules

## Pattern Summary

**Name:** Assumption Surface  
**Question it answers:** "Why did agents disagree? What different assumptions drove the conflict?"  
**Key insight:** Shows ROOT CAUSE of disagreement. When agents have conflicting positions, this reveals the different assumptions that led them there.

---

## What This Pattern Does

Maps conflicting positions back to the assumptions that caused them. Reveals hidden logic: why Agent A thought X and Agent B thought Y.

Shows:
- What each agent believed/assumed
- How those assumptions differed
- What conflicting positions those assumptions led to
- Which assumptions were validated/challenged
- How the conflict was resolved (if at all)

---

## Research Findings: Why This Pattern Is Needed

**From 14 practitioner interviews, we found:**

**Core need (direct quote):**  
"Disagreements often aren't about the decision itself—they're about different beliefs about the world. One person assumes load will increase. Another assumes it won't. That's where the real disagreement lives."

**Typical scenario:**  
Team A and Team B disagree. On surface: A wants X, B wants Y. But dig deeper: A assumes constraint C exists, B assumes it doesn't. Different world models = different positions.

**Problem this solves:**  
"We fix disagreements at the position level, but the real issue is beneath: different assumptions. Next time we hit a similar problem, we're blind to the actual root cause."

---

## Field Definitions & Requirements

### Required Fields

**agents_and_assumptions**
- Type: mapping (agent name → their key assumption)
- Format: "Agent A: [assumed X]. Agent B: [assumed Y]."
- Example: "Logs team: assumed trace volume was low. Code team: assumed trace volume would grow 10x."
- Error if missing: "What did each agent assume about the world?"

**disagreement**
- Type: string (the position conflict that resulted)
- Example: "Logs team wanted minimal trace. Code team wanted comprehensive trace."
- Error if missing: "What positions did these different assumptions create?"

### Strongly Recommended Fields

**assumption_evidence**
- Type: string (what data/reasoning supported each assumption?)
- Example: "Logs team: based on current production metrics. Code team: based on scaling projections and beta testing at 10x load."
- Warning if missing: "What made each team believe their assumption?"

**validated_assumptions**
- Type: string (which assumptions turned out to be correct?)
- Example: "Code team was right: load grew 8x in 3 months. Logs team's assumption became obsolete."
- Warning if missing: "Which assumptions were later validated or proved wrong?"

### Optional Fields

**resolution**
- How was the disagreement actually resolved?
- Example: "Adopted code team's comprehensive trace after incident revealed monitoring gaps"

**learning**
- What did we learn about how we make assumptions?
- Example: "Projections should inform assumptions, not just current state"

---

## Validation Rules (For Code)

```
REQUIRED VALIDATION:
  if (!agents_and_assumptions || agents_and_assumptions.trim().length === 0) {
    error: "What did each agent assume about the world?"
    action: DISABLE_SAVE
  }
  
  if (!disagreement || disagreement.trim().length === 0) {
    error: "What positions resulted from these different assumptions?"
    action: DISABLE_SAVE
  }

RECOMMENDED VALIDATION:
  if (!assumption_evidence || assumption_evidence.trim().length === 0) {
    warning: "What evidence backed each assumption?"
    action: ALLOW_SAVE_BUT_SHOW_WARNING
  }
  
  if (!validated_assumptions || validated_assumptions.trim().length === 0) {
    warning: "Were the assumptions later validated or proved wrong?"
    action: ALLOW_SAVE_BUT_SHOW_WARNING
  }

ANTI-PATTERNS:
  if (agents_and_assumptions.length < 20 || !disagreement) {
    warning: "Sparse assumptions. Add what each agent believed about constraints, 
              scale, risk, timeline, etc."
    action: SHOW_WARNING
  }
```

---

## User-Facing Guidance

### Recommendation Message

```
✓ Assumption Surface  
Recommended based on your scenario

Why this pattern?  
• Disagreement stems from different beliefs/assumptions
• Shows ROOT CAUSE (not just positions)
• Reveals hidden logic behind conflicting views

Research shows this is needed when:  
'Disagreements often aren't about the decision itself—
they're about different beliefs about the world.'

[Try this] [Learn more]
```

### Extraction Questions (Priority Order)

1. **"What did each agent assume about the situation?"**  
   → Fills agents_and_assumptions  
   → Example: "Team A assumed bottleneck was CPU. Team B assumed it was I/O."

2. **"What different beliefs drove their positions?"**  
   → Fills assumption_evidence  
   → Example: "Team A: based on profiling. Team B: based on database metrics."

3. **"What positions did those different assumptions create?"**  
   → Fills disagreement  
   → Example: "Team A wanted CPU optimization. Team B wanted database tuning."

4. (Optional) **"Were any assumptions later proved right or wrong?"**  
   → Fills validated_assumptions  
   → Example: "Team B was right: database was the bottleneck"

5. (Optional) **"What did you learn about assumptions?"**  
   → Fills learning  
   → Example: "Metrics should inform assumptions, not anecdotes"

### Error Messages

**Missing assumptions:**  
"What did each agent assume? What did they believe about the world? (constraints, scale, risk, etc.)"

**Missing disagreement:**  
"What positions resulted from these different assumptions?"

### Warning Messages

**Missing evidence:**  
"💡 What made each team believe their assumption? (data, experience, projections?)"

**Missing validation:**  
"💡 Were these assumptions later proved right or wrong? This teaches us about our assumptions."

---

## Field Guide: Good vs. Bad

### agents_and_assumptions

**❌ Too vague:**
- "Team A assumed one thing. Team B assumed another."
- "Different views on the issue"

**✓ Good:**
- "Logs team: assumed trace volume would stay low (based on current metrics). Code team: assumed trace volume would grow 10x (based on beta testing at scale)."
- "Finance: assumed churn rate would stay constant. Product: assumed new features would reduce churn 15%."
- "Billing: assumed error was data sync (recoverable). Legal: assumed fraud pattern existed (non-recoverable)."

**Pattern:**  
"[Agent]: assumed [belief based on reasoning]. [Agent]: assumed [different belief]."

---

### disagreement

**❌ Too vague:**
- "They disagreed"
- "Different opinions"

**✓ Good:**
- "Logs wanted minimal trace footprint. Code wanted comprehensive trace for debugging."
- "Finance wanted tight cost controls. Product wanted feature investment."
- "Billing wanted to monitor. Legal wanted to investigate immediately."

**Pattern:**  
"[Agent] wanted [position]. [Agent] wanted [opposing position]."

---

### assumption_evidence

**❌ Too vague:**
- "We thought it was right"
- "Experience"

**✓ Good:**
- "Logs: based on current production metrics (2GB/day trace, stable 6 months). Code: based on beta testing at 10x user load (20GB/day, projected to hit soon)."
- "Finance: churn historically flat for 2 years. Product: new features in beta showing 12% engagement, predicts 8-15% churn reduction."

**Pattern:**  
"[Agent]: based on [specific data/experience]. [Agent]: based on [different data/experience]."

---

## Common Mistakes & Auto-Corrections

### Mistake 1: Position vs. Assumption Confusion

**What user does:**  
"Logs wanted minimal trace. Code wanted comprehensive trace."

**Why it's a problem:**  
These are positions, not assumptions. Dig deeper: WHY did they want those?

**Auto-correction:**  
"That's what they wanted (the positions). But why? What did Logs ASSUME about trace? What did Code ASSUME? (E.g., 'Logs assumed trace cost was high.' 'Code assumed it was low.')"

### Mistake 2: Assumptions Without Disagreement

**What user does:**  
"Team A assumed X. Team B assumed Y. (No mention of conflict.)"

**Why it's a problem:**  
No disagreement = no conflict to explain. This becomes just a list of beliefs.

**Auto-correction:**  
"So both teams had different assumptions. But did this create disagreement? What positions conflicted because of these assumptions?"

### Mistake 3: Circular Reasoning

**What user does:**  
"We disagreed because we had different assumptions. Assumption A: we should do X. Assumption B: we should do Y."

**Why it's a problem:**  
The "assumption" is just the position restated. Dig deeper: what about the WORLD do they assume differently?

**Auto-correction:**  
"Back up: what about the situation/world do they assume differently? (constraints? risks? timelines? data?) Those beliefs shaped their positions."

---

## When to Recommend Other Patterns

### If disagreement was resolved (mechanics matter)
→ **Also use Convergence Point** (shows how conflict converged)

### If you want to show full decision reasoning
→ **Also use Decision Ledger** (shows why the final choice was made)

### If multiple roles were needed to resolve
→ **Also use Credential Boundary** (shows why single role couldn't decide)

---

## Metrics for Success

User has created a good Assumption Surface instance if:
- ✓ Clear assumptions named (not vague beliefs)
- ✓ Different assumptions visible (not the same belief)
- ✓ Evidence for each assumption (why they believed it)
- ✓ Disagreement explained by assumptions (causal link clear)
- ✓ Assumptions validated or questioned later (learning visible)
- ✓ Someone can read it and understand the ROOT CAUSE of conflict

**Practitioner quote:**  
"I can see why they disagreed—they were looking at different data."

---

## Anti-Patterns

❌ Positions restated as assumptions → Dig deeper to actual beliefs  
❌ No disagreement stemming from assumptions → Wrong pattern  
❌ Assumptions about people, not the world → "They're wrong" is not an assumption  
❌ Vague assumptions → "Different views" is too broad

---

## Example Scenarios

### Example 1: Infrastructure Scaling (From Interview Research)

```
Agents and assumptions:
- Logs team: assumed trace volume would remain ~2GB/day 
  (based on 6 months stable production data)
- Code team: assumed trace volume would grow 10x in next quarter 
  (based on beta testing at scaled user load)

Disagreement:
- Logs wanted minimal trace collection (low cost)
- Code wanted comprehensive trace (better debugging)

Assumption evidence:
- Logs: historical metrics showed flat growth, no indicators of change
- Code: ran load tests with 10x users, saw trace spike to 20GB/day

Validated assumptions:
- Code team was correct: user growth accelerated; trace hit 18GB/day in 8 weeks
- Logs team's assumption became obsolete due to changed market conditions

Resolution:
- Adopted comprehensive trace; migrated to cheaper trace backend to manage cost

Learning:
- Current metrics are not predictors. Growth projections matter more than 
  historical trends in high-growth environments.

Research finding: "Disagreements often aren't about the decision itself—
they're about different beliefs about the world."
```

### Example 2: Incident Response (From Interview Research)

```
Agents and assumptions:
- Billing: assumed duplicate charge was data sync error (recoverable issue)
- Legal: assumed fraud pattern existed (non-recoverable, criminal)
- Finance: assumed revenue impact was $10-50K

Disagreement:
- Billing wanted to "monitor and sync"
- Legal wanted to "investigate immediately and remediate"

Assumption evidence:
- Billing: historical data showed 2-3 sync errors per month, all recoverable
- Legal: pattern analysis showed charges were symmetric (same card, same amount, 
  hour apart) — typical fraud signature

Validated assumptions:
- Legal was correct: fraud investigation revealed compromised payment processor, 
  4 other customers affected

Resolution:
- Immediate investigation + customer refunds + processor audit
- Implemented real-time fraud scoring to catch patterns early

Learning:
- Team's historical experience can blind them to new threats. 
  Patterns matter more than individual incidents.

Research finding: "Root cause of disagreement is often hidden assumptions about 
the world, not about the decision itself."
```

### Example 3: Product Strategy (From Interview Research)

```
Agents and assumptions:
- Finance: assumed current churn rate (12%) would stay flat 
  (based on 2-year historical trend)
- Product: assumed new features would reduce churn 15% 
  (based on beta test showing +12% engagement)

Disagreement:
- Finance wanted aggressive cost control (assumes revenue stable)
- Product wanted feature investment (assumes revenue will grow if engagement grows)

Assumption evidence:
- Finance: 24 months of data, no upward/downward trend
- Product: 50-user beta with new UX showed engagement +12%, NPS +8

Validated assumptions:
- Both partially correct: Features DID reduce churn (13% → 10%), BUT seasonal 
  trends dominated (actually 8% reduction, not 15%)
- Finance's historical view was stable but missed trend signals in early beta

Resolution:
- Balanced: moderate investment in high-impact features + cost discipline

Learning:
- Small signal in beta doesn't predict large-scale impact. Need to account 
  for measurement error and scale effects.

Research finding: "Disagreements stem from different beliefs about the world."
```

---

## System Message Guidelines

**DO:**
- ✓ "Shows why agents disagreed—different assumptions" (clear)
- ✓ "What did each agent believe about the situation?"
- ✓ "Dig deeper: not just positions, but the assumptions beneath"
- ✓ "Research shows disagreements are often about hidden beliefs"

**DON'T:**
- ❌ "Documents disagreement" (too generic)
- ❌ Generic guidance without their scenario

---

## Implementation Checklist (For Cursor)

**Validation:**
- [ ] Error if agents_and_assumptions missing
- [ ] Error if disagreement missing
- [ ] Warning if assumption_evidence missing
- [ ] Warning if validated_assumptions missing
- [ ] Auto-detect position restated as assumption (suggest digging deeper)

**Guidance:**
- [ ] Show field tips with examples
- [ ] Ask extraction questions in priority order
- [ ] Suggest "dig deeper" when assumptions seem vague

**Messages:**
- [ ] Recommendation references research
- [ ] Errors are specific and guide toward root cause
