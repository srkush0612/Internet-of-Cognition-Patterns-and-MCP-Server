# Credential Boundary Pattern — Instructions & Rules

## Pattern Summary

**Name:** Credential Boundary  
**Question it answers:** "Why couldn't a single person/role decide this? Why were multiple credentials needed?"  
**Key insight:** Shows capability gaps. When no single agent had all the expertise/authority to decide, this pattern explains why multiple roles were required.

---

## What This Pattern Does

Maps decisions to the roles/expertise needed to make them. Reveals: what knowledge gaps existed, why each role was necessary, what would have broken if any role was missing.

Shows:
- What decision needed to be made
- Which roles/credentials were involved
- What each role contributed (their domain)
- Why no single role was sufficient
- Which role had final authority (if any)

---

## Research Findings: Why This Pattern Is Needed

**From 14 practitioner interviews, we found:**

**Core need (direct quote):**  
"Complex decisions need multiple perspectives. One person doesn't have all the context. We need to show why all these roles were at the table, not just that they were."

**Typical scenario:**  
A decision requires legal knowledge AND financial knowledge AND engineering knowledge. Drop any one, and the decision fails. Pattern shows the boundaries—what each role owned.

**Problem this solves:**  
"We make decisions with 5 people in the room but don't record why. Later, someone asks 'did we need finance?' and we can't explain the gap."

---

## Field Definitions & Requirements

### Required Fields

**decision**
- Type: string (what was being decided?)
- Example: "Plan GDPR compliance rollout"
- Error if missing: "What decision required multiple roles?"

**roles_and_contributions**
- Type: mapping (role → what they contributed)
- Format: "Legal: [contributed X]. Finance: [contributed Y]. Engineering: [contributed Z]."
- Example: "Legal: identified GDPR requirements. Finance: budgeted $200K. Engineering: assessed timeline and resources."
- Error if missing: "What did each role contribute? Why was each needed?"

**capability_gaps**
- Type: string (what knowledge/authority was missing from any single role?)
- Example: "No single role had both legal authority AND budget control AND technical feasibility assessment."
- Error if missing: "What capability gaps meant you needed multiple roles?"

### Strongly Recommended Fields

**decision_authority**
- Type: string (which role had final authority?)
- Example: "Legal had veto power on GDPR aspects. Finance had budget decision. Engineering had timeline decision."
- Warning if missing: "Who had final authority on each aspect?"

**if_missing_role**
- Type: string (what would have broken if a role was missing?)
- Example: "Without legal: missed GDPR requirements ($500K fine). Without finance: overcommitted budget. Without engineering: impossible timeline."
- Warning if missing: "What would have gone wrong if any role was absent?"

### Optional Fields

**cascade_effects**
- What downstream impacts required this role?
- Example: "Legal decision shaped engineering timeline shaped product launch timeline"

**role_conflicts**
- Where did roles have differing priorities?
- Example: "Legal wanted comprehensive audit. Finance wanted minimal cost. Engineering wanted fast implementation."

---

## Validation Rules (For Code)

```
REQUIRED VALIDATION:
  if (!decision || decision.trim().length === 0) {
    error: "What decision required multiple roles?"
    action: DISABLE_SAVE
  }
  
  if (!roles_and_contributions || roles_and_contributions.trim().length === 0) {
    error: "What did each role contribute?"
    action: DISABLE_SAVE
  }
  
  if (!capability_gaps || capability_gaps.trim().length === 0) {
    error: "Why wasn't a single role sufficient?"
    action: DISABLE_SAVE
  }

RECOMMENDED VALIDATION:
  if (!decision_authority || decision_authority.trim().length === 0) {
    warning: "Which role(s) had final authority?"
    action: ALLOW_SAVE_BUT_SHOW_WARNING
  }
  
  if (!if_missing_role || if_missing_role.trim().length === 0) {
    warning: "What would have broken if any role was missing?"
    action: ALLOW_SAVE_BUT_SHOW_WARNING
  }

ANTI-PATTERNS:
  if (roles.length < 2) {
    warning: "Only 1 role involved? This might be Decision Ledger (single decision) 
              or Convergence Point (disagreement) instead."
    action: SHOW_WARNING
  }
```

---

## User-Facing Guidance

### Recommendation Message

```
✓ Credential Boundary  
Recommended based on your scenario

Why this pattern?  
• Multiple roles/expertise needed for one decision
• No single person had all the context
• Shows why the team composition mattered

Research shows this is needed when:  
'Complex decisions need multiple perspectives. 
One person doesn't have all the context.'

[Try this] [Learn more]
```

### Extraction Questions (Priority Order)

1. **"What was the decision?"**  
   → Fills decision

2. **"Which roles were involved and why?"**  
   → Fills roles_and_contributions  
   → Example: "Legal (knew compliance), Finance (had budget), Engineering (assessed feasibility)"

3. **"What capability gaps meant you needed all these roles?"**  
   → Fills capability_gaps  
   → Example: "No single person had legal authority AND financial control AND technical expertise"

4. (Optional) **"Who had final authority on each aspect?"**  
   → Fills decision_authority

5. (Optional) **"What would have broken if any role was missing?"**  
   → Fills if_missing_role  
   → Example: "No legal = GDPR violation. No finance = overspend. No engineering = missed deadline."

### Error Messages

**Missing roles:**  
"What did each role contribute? Why was each one necessary?"

**Missing capability gaps:**  
"What expertise/authority was missing from any single person?"

### Warning Messages

**Missing authority info:**  
"💡 Who had final say on each aspect? (Did legal veto? Did finance decide budget?)"

**Missing impact analysis:**  
"💡 What would have gone wrong if any role was missing? This shows why each was needed."

---

## Field Guide: Good vs. Bad

### roles_and_contributions

**❌ Too vague:**
- "Multiple teams involved"
- "Different departments"
- "Everyone contributed"

**✓ Good:**
- "Legal: identified GDPR requirements (2 key articles, fines up to €20M). Finance: budgeted $200K based on scope. Engineering: assessed feasibility (6-month timeline) and resource needs (2 FTE)."
- "Product: defined use cases and requirements. Engineering: assessed technical architecture and implementation cost. Security: identified threat model and mitigations. Operations: planned rollout and monitoring."

**Pattern:**  
"[Role]: [specific contribution — what knowledge/authority]. [Role]: [different contribution]."

---

### capability_gaps

**❌ Too vague:**
- "We needed different perspectives"
- "Complex decision"

**✓ Good:**
- "No single role had: legal authority (to approve GDPR compliance) + financial control (to approve budget) + technical expertise (to assess feasibility). Each role covered a gap."
- "Compliance officer didn't know technical architecture. Engineers didn't know regulatory requirements. Finance didn't understand business impact of both. All three gaps needed to close."

**Pattern:**  
"No single role had [expertise A] AND [expertise B] AND [authority C]."

---

### if_missing_role

**❌ Too vague:**
- "Decision would have been worse"
- "We needed everyone"

**✓ Good:**
- "Without legal: missed GDPR requirements ($500K fine risk). Without finance: overcommitted budget ($50K overspend). Without engineering: promised impossible timeline (would miss market window or burn team out)."
- "Without compliance: no governance, audit fails. Without engineering: technical debt and scalability issues. Without security: vulnerabilities in production."

**Pattern:**  
"Without [role]: [specific bad outcome]. Without [role]: [different bad outcome]."

---

## Common Mistakes & Auto-Corrections

### Mistake 1: Just "Multiple People" Involved

**What user does:**  
"5 people were in the meeting. All contributed."

**Why it's a problem:**  
This says people were involved, not why they were NEEDED. Different credential.

**Auto-correction:**  
"That's who was involved. But why did the decision NEED these specific roles? What expertise or authority gaps did each one fill?"

### Mistake 2: Only 1 Role Actually Needed

**What user does:**  
"Legal decided. But we also had engineering and finance there."

**Why it's a problem:**  
If one role could have decided alone, this is Decision Ledger, not Credential Boundary.

**Auto-correction:**  
"Could legal have decided alone? Or did you genuinely need engineering's feasibility input and finance's budget approval? If only legal decided, that's Decision Ledger."

### Mistake 3: Confusing Role with Person

**What user does:**  
"Alice (engineer), Bob (product), Carol (designer) made the decision."

**Why it's a problem:**  
Credential is about ROLES, not individuals. What expertise did each ROLE contribute?

**Auto-correction:**  
"What were their roles? (Engineer, product manager, designer?) What expertise/authority did EACH ROLE bring?"

---

## When to Recommend Other Patterns

### If roles disagreed and then converged
→ **Also use Convergence Point** (shows how roles converged)

### If roles disagreed due to different assumptions
→ **Also use Assumption Surface** (shows underlying beliefs)

### If single role made final decision
→ **Also use Decision Ledger** (shows reasoning)

---

## Metrics for Success

User has created a good Credential Boundary instance if:
- ✓ 2+ distinct roles/credentials named
- ✓ Each role's specific contribution clear
- ✓ Capability gaps explained (why all needed)
- ✓ Authority chain visible (who decided what)
- ✓ Impact if missing any role stated
- ✓ Someone can understand why THIS team composition was necessary

**Practitioner quote:**  
"I can see why all these roles were needed—each filled a gap."

---

## Anti-Patterns

❌ Single role actually decided → Use Decision Ledger  
❌ Roles present but not needed → This isn't Credential Boundary  
❌ Confusing people with roles → Focus on expertise/authority  
❌ "Everyone contributed equally" → Dig into specifics

---

## Example Scenarios

### Example 1: Compliance Program (From Interview Research)

```
Decision: Design GDPR compliance program for EU operations

Roles and contributions:
- Legal: identified 12 GDPR articles requiring compliance, assessed fines 
  (up to €20M), defined requirements
- Engineering: assessed feasibility, designed data architecture, identified 
  implementation risks
- Finance: budgeted $200K, identified cost constraints, approved resources
- Privacy officer: designed consent flow, documented policies, owned 
  regulatory relationships

Capability gaps:
- Legal alone: knew regulations but not technical feasibility or cost
- Engineering alone: could build anything but unaware of legal requirements
- Finance alone: could allocate budget but unaware of compliance or technical needs
- Privacy alone: knew process but lacked technical or financial authority
- No single role covered regulation + feasibility + budget + process

Decision authority:
- Legal had veto on compliance aspects
- Finance had veto on budget
- Engineering had timeline authority (6-month feasibility)

If missing any role:
- No legal: GDPR violation ($500K fine risk)
- No engineering: design infeasible, misses launch
- No finance: budget overrun ($100K+ over limit)
- No privacy: consent flow fails audit

Research finding: "Complex decisions need multiple perspectives. 
One person doesn't have all the context."
```

### Example 2: Payment System Decision (From Interview Research)

```
Decision: Choose payment processor (high reliability required, PCI compliance)

Roles and contributions:
- Finance: knew cost structure, payment volume requirements, SLA needs
- Engineering: assessed technical integration, reliability, incident handling
- Security: evaluated PCI compliance, fraud prevention, data handling
- Customer success: understood merchant needs, SLA expectations

Capability gaps:
- Finance alone: didn't know technical requirements or security risks
- Engineering alone: didn't know SLA economics or compliance details
- Security alone: didn't know business priorities or technical integrations
- No single role bridged business needs, technical feasibility, security, and reliability

Decision authority:
- Finance: chose based on cost+reliability trade-off
- Security: required PCI compliance (veto)
- Engineering: approved technical readiness

If missing any role:
- No finance: chose unreliable processor (would cost $2M in downtime)
- No engineering: chose processor too complex to integrate (6-month delay)
- No security: chose non-compliant processor (audit failure, customer trust loss)

Learning: Payment decisions require trade-off thinking across 3+ domains.
```

---

## System Message Guidelines

**DO:**
- ✓ "Shows why multiple roles were needed" (clear)
- ✓ "What expertise gap did each role fill?"
- ✓ "What would have broken if that role was missing?"
- ✓ "Research shows complex decisions need multiple perspectives"

**DON'T:**
- ❌ "Documents team involvement" (too broad)
- ❌ Generic guidance

---

## Implementation Checklist (For Cursor)

**Validation:**
- [ ] Error if decision missing
- [ ] Error if roles_and_contributions missing
- [ ] Error if capability_gaps missing
- [ ] Warning if decision_authority missing
- [ ] Warning if if_missing_role missing
- [ ] Auto-detect "only 1 role needed" (suggest Decision Ledger)

**Guidance:**
- [ ] Show field tips with examples
- [ ] Ask extraction questions in order
- [ ] Guide toward "what gap did this role fill?"

**Messages:**
- [ ] Recommendation references research
- [ ] Errors guide toward credential thinking (gaps, not just people)
