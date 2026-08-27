# Presence Boundary Pattern — Instructions & Rules

## Pattern Summary

**Name:** Presence Boundary  
**Question it answers:** "Why did some agents enter the process late? What information triggered them to join?"  
**Key insight:** Shows visibility gaps. When agents learn at different times, this pattern reveals what each agent knew and when they knew it.

---

## What This Pattern Does

Maps agent participation timeline. Shows: what information triggered each agent to enter, what they were blind to initially, when context shifts.

Shows:
- Initial state (who was aware, who wasn't)
- Trigger events (what made agents enter/engage)
- Information flow (what each agent learned when)
- Escalation points (when knowledge gaps forced escalation)
- Final state (who was involved by end)

---

## Research Findings: Why This Pattern Is Needed

**From 14 practitioner interviews, we found:**

**Core need (direct quote):**  
"Decisions change when new information surfaces. We need to show who knew what when. Billing didn't flag it until day 3. That's when everything shifted."

**Typical scenario:**  
Day 1: Billing detects issue. Day 2: Finance joins, escalates severity. Day 3: Legal finds fraud signal, changes resolution. Each agent saw different information at different times.

**Problem this solves:**  
"We make decisions with incomplete information. When information surfaces, who learns it? How does that trigger escalation? We lose that story."

---

## Field Definitions & Requirements

### Required Fields

**initial_state**
- Type: string (who was initially aware? of what?)
- Example: "Only Billing aware: duplicate charge detected"
- Error if missing: "Who initially noticed the problem?"

**escalation_triggers**
- Type: mapping (agent/time → event that brought them in)
- Format: "Day 1 (Billing): detected charge. Day 2 (Finance): revenue impact flagged. Day 3 (Legal): fraud pattern identified."
- Example: See field guide
- Error if missing: "What events brought each agent into the process?"

**information_progression**
- Type: string (what new information changed the picture at each step?)
- Example: "Initially: one charge anomaly. Then: pattern analysis (symmetric charges). Then: processor audit (4+ customers affected)."
- Error if missing: "What information became visible at each escalation?"

### Strongly Recommended Fields

**visibility_gaps**
- Type: string (what was each agent blind to initially?)
- Example: "Billing: didn't see pattern analysis. Finance: didn't see fraud indicators. Legal: didn't see initial charge."
- Warning if missing: "What was each agent unaware of at first?"

**decision_impact**
- Type: string (how did new information change the decision?)
- Example: "Initial plan: monitor. After pattern analysis: investigate. After processor audit: refund + incident report."
- Warning if missing: "How did new information change what needed to happen?"

### Optional Fields

**final_state**
- Who was involved by end? What did they collectively know?

**learning**
- What patterns of information visibility matter?

---

## Validation Rules (For Code)

```
REQUIRED VALIDATION:
  if (!initial_state || initial_state.trim().length === 0) {
    error: "Who initially knew about the issue?"
    action: DISABLE_SAVE
  }
  
  if (!escalation_triggers || escalation_triggers.trim().length === 0) {
    error: "What events brought each agent in?"
    action: DISABLE_SAVE
  }
  
  if (!information_progression || information_progression.trim().length === 0) {
    error: "What information surfaced at each step?"
    action: DISABLE_SAVE
  }

RECOMMENDED VALIDATION:
  if (!visibility_gaps || visibility_gaps.trim().length === 0) {
    warning: "What was each agent initially blind to?"
    action: ALLOW_SAVE_BUT_SHOW_WARNING
  }
  
  if (!decision_impact || decision_impact.trim().length === 0) {
    warning: "How did new information change the decision?"
    action: ALLOW_SAVE_BUT_SHOW_WARNING
  }

ANTI-PATTERNS:
  if (!includes_time_markers) {
    warning: "Use time/day markers (Day 1, Hour 4, etc.) to show when agents entered"
    action: SHOW_SUGGESTION
  }
```

---

## User-Facing Guidance

### Recommendation Message

```
✓ Presence Boundary  
Recommended based on your scenario

Why this pattern?  
• Problem/information surfaced over time
• Different agents learned at different moments
• Decision changed as more information emerged

Research shows this is needed when:  
'Decisions change when new information surfaces. 
We need to show who knew what when.'

[Try this] [Learn more]
```

### Extraction Questions (Priority Order)

1. **"Who initially noticed the problem or issue?"**  
   → Fills initial_state

2. **"What events or discoveries brought each agent in?"**  
   → Fills escalation_triggers  
   → Example: "Day 1: Billing. Day 2: Finance (when they saw scale). Day 3: Legal (when they analyzed pattern)"

3. **"What new information surfaced at each step?"**  
   → Fills information_progression  
   → Example: "Initially: anomaly. Then: pattern. Then: fraud signal"

4. (Optional) **"What was each agent blind to at first?"**  
   → Fills visibility_gaps

5. (Optional) **"How did new information change what you decided to do?"**  
   → Fills decision_impact  
   → Example: "Started monitoring. Ended investigating. Ended refunding."

### Error Messages

**Missing initial state:**  
"Who first noticed the problem? That's where the story starts."

**Missing escalation events:**  
"What happened that brought Finance in? Then Legal? Use timestamps (Day 1, Hour 4, etc.)"

**Missing information progression:**  
"What new information emerged at each step? That's what changed the picture."

### Warning Messages

**Missing visibility gaps:**  
"💡 What was each agent not seeing at first? This shows why escalation was needed."

**Missing decision impact:**  
"💡 How did the decision change as information surfaced? That's the pattern."

---

## Field Guide: Good vs. Bad

### initial_state

**❌ Too vague:**
- "We detected something"
- "The issue started"

**✓ Good:**
- "Only Billing aware: duplicate charge on card ending 4412, $99.99, flagged by reconciliation"
- "Only monitoring system aware: CPU spike to 95%. No alert sent to Engineering yet."
- "Only Product aware: NPS dropped 8 points. Other teams didn't know."

**Pattern:**  
"[Agent] aware: [specific finding]. [Other agents]: unaware."

---

### escalation_triggers

**❌ Too vague:**
- "Finance heard about it"
- "Legal got involved"

**✓ Good:**
- "Day 1 (Billing): detected charge. Day 2 (Finance): revenue reconciliation flagged account impact. Day 3 (Legal): fraud analysis pattern-matched to known compromises."
- "Hour 1 (monitoring): CPU spike. Hour 2 (Engineering): alert finally sent. Hour 3 (Operations): incident severity escalated to P1."

**Pattern:**  
"[Time] ([Agent]): [triggering event]. [Time] ([Agent]): [different trigger]."

---

### information_progression

**❌ Too vague:**
- "More information came out"
- "We learned things"

**✓ Good:**
- "Initially: single charge anomaly (could be sync error). Day 2: pattern analysis revealed symmetric charges (fraud signature). Day 3: processor audit found 4+ customers affected, same pattern."
- "Initially: spike visible only in metrics. Hour 2: spike correlated to deployment. Hour 3: specific service identified. Hour 4: root cause found (memory leak)."

**Pattern:**  
"Initially: [what was known]. Then: [new information]. Then: [different information]."

---

## Common Mistakes & Auto-Corrections

### Mistake 1: Parallel Agents (No Escalation)

**What user does:**  
"Billing, Finance, and Legal all knew from the start."

**Why it's a problem:**  
This is Credential Boundary (multiple roles), not Presence Boundary (agents joining over time).

**Auto-correction:**  
"They were all involved from the start? Then this is about why each role was needed (Credential Boundary), not when they joined (Presence Boundary). What's the pattern you want to show?"

### Mistake 2: Just a Timeline

**What user does:**  
"Day 1: Something happened. Day 2: Something else. Day 3: Resolution."

**Why it's a problem:**  
Timeline without connecting to agent participation and information visibility.

**Auto-correction:**  
"What information did each agent have at each stage? When did they JOIN because of new info? That's the Presence Boundary pattern."

### Mistake 3: Missing the "Why"

**What user does:**  
"Billing noticed. Then Finance. Then Legal."

**Why it's a problem:**  
This says who joined, not WHY. What information triggered each entry?

**Auto-correction:**  
"What information made Finance need to join? What information triggered Legal? That's the key."

---

## When to Recommend Other Patterns

### If agents had different information/assumptions all along
→ **Also use Assumption Surface** (shows underlying beliefs)

### If presence correlated with disagreement
→ **Also use Convergence Point** (shows how conflict converged)

### If roles had different authorities
→ **Also use Credential Boundary** (shows why each role was needed)

---

## Metrics for Success

User has created a good Presence Boundary instance if:
- ✓ Clear initial state (who knew, who didn't)
- ✓ Escalation events timestamped (Day 1, Hour 2, etc.)
- ✓ Information progression visible (what new info at each step)
- ✓ Visibility gaps explained (why agents were blind)
- ✓ Decision impact clear (how new info changed what to do)
- ✓ Someone can see: "Oh, THAT'S when Legal entered" with clear cause

**Practitioner quote:**  
"I can see who knew what when, and why each agent joined when they did."

---

## Anti-Patterns

❌ All agents present from start → Use Credential Boundary  
❌ No escalation or new information → Wrong pattern  
❌ Timeline without agent participation → Missing the point  
❌ Events without information visibility → Too vague

---

## Example Scenarios

### Example 1: Incident Response (From Interview Research)

```
Initial state:
- Only Billing aware: duplicate charge on customer card (4:15 PM)
- Thought: data sync error (recoverable)

Escalation triggers & information progression:
- Day 1, 4:15 PM (Billing): detected charge; thought: data sync
- Day 2, 9:00 AM (Finance): revenue reconciliation found $15K impact across accounts; 
  escalated: "Not isolated, pattern exists"
- Day 2, 2:00 PM (Legal): fraud analysis identified symmetric charges (same amount, 
  ~1 hour apart); finding: "Fraud signature, not sync error"
- Day 3, 10:00 AM (Security): processor audit revealed 4+ customers affected, same pattern; 
  escalated: "Compromised payment processor"

Visibility gaps:
- Billing: didn't see pattern across customers, didn't analyze charge timing
- Finance: didn't see fraud indicators, only revenue impact
- Legal: didn't have initial charge data, only pattern
- Security: wasn't in loop until audit needed

Decision impact:
- Initial (Billing only): "Monitor and sync"
- After Finance: "Investigate severity" (not just one customer)
- After Legal: "Full investigation" (fraud signature, not sync error)
- After Security: "Immediate refunds + processor audit + incident report"

Learning: Information surfaces at layers; early layers can miss pattern. 
Need escalation paths to surface pattern-level insights.

Research finding: "Decisions change when new information surfaces. 
We need to show who knew what when."
```

### Example 2: Infrastructure Crisis (From Interview Research)

```
Initial state:
- Only monitoring system aware: CPU spike 95% at 3:00 PM
- No alert sent (threshold misconfigured)

Escalation triggers & information progression:
- 3:00 PM (Monitoring): spike detected, no alert
- 3:15 PM (Engineering): customer reports slowness; manually checks monitoring
- 3:30 PM (Operations): page Engineering on-call; suggests deployment correlation
- 3:45 PM (Database): identified memory leak in new query optimization
- 4:00 PM (CTO): requested immediate rollback decision

Visibility gaps:
- Monitoring: couldn't alert (threshold issue)
- Engineering: didn't see monitoring data until told
- Operations: didn't know root cause, only timing correlation
- Database: wasn't alerted until escalation reached them

Decision impact:
- At 3:15 PM: debug locally
- At 3:30 PM: broader investigation
- At 3:45 PM: rollback decision

Learning: Automated visibility doesn't guarantee visibility. 
Alert thresholds matter more than metrics themselves.

Research finding: "Decisions change when new information surfaces."
```

---

## System Message Guidelines

**DO:**
- ✓ "Shows who knew what when" (clear)
- ✓ "What triggered Finance to enter?" (asks about causation)
- ✓ "How did new information change the plan?"
- ✓ "Use timestamps to show escalation flow"

**DON'T:**
- ❌ "Documents a timeline" (too generic)
- ❌ Generic guidance without escalation/information

---

## Implementation Checklist (For Cursor)

**Validation:**
- [ ] Error if initial_state missing
- [ ] Error if escalation_triggers missing
- [ ] Error if information_progression missing
- [ ] Warning if visibility_gaps missing
- [ ] Warning if decision_impact missing
- [ ] Suggest using time markers (Day, Hour, timestamps)

**Guidance:**
- [ ] Show field tips with examples
- [ ] Ask extraction questions in order
- [ ] Guide toward "what information triggered this agent?"

**Messages:**
- [ ] Recommendation references research
- [ ] Errors guide toward visibility/escalation thinking
