# Convergence Point Pattern — Instructions & Rules

## Pattern Summary

**Name:** Convergence Point  
**Question it answers:** "How did multiple agents resolve their disagreement?"  
**Key insight:** Shows not just WHAT was decided, but HOW conflict was resolved and WHY that position won.

---

## What This Pattern Does

Visualizes agents with conflicting positions converging on a single decision. Shows:
- Who disagreed and on what (disagreement dimension)
- What each agent wanted (positions)
- How it was resolved (mechanism: authority, voting, compromise)
- What was actually chosen (outcome)
- Why that position won (reasoning/priority)

---

## Research Findings: Why This Pattern Is Needed

**From 14 practitioner interviews, we found:**

**Core need (direct quote from practitioners):**  
"When sub-agents disagree, users need to see convergence mechanics: what was adopted, what was flagged as impasse, and why, not an opaque final string."

**Typical scenario practitioners described:**  
Team A (logs) vs Team B (code) vs Team C (conflict resolver) disagree on approach. Users need to understand which team's concern won and why. They want to see: Team A said X, Team B pushed back on Y, Team C resolved with Z.

**Problem practitioners face:**  
"We made a decision but nobody can tell why that decision was chosen over alternatives." Convergence Point addresses this by making reasoning visible and traceable.

---

## Field Definitions & Requirements

### Required Fields

These MUST be filled. Save is disabled without them.

**agentRoster**
- Type: array of strings
- Min length: 2
- Example: `["policy-team", "legal-team", "compliance-team"]`
- Error if missing: "Add at least 2 agents to show disagreement"
- Error if < 2 agents: "Minimum 2 agents required for conflict visualization"

**disagreementDimension**
- Type: string (1-2 sentences)
- Min length: 10 characters
- Example: "Policy says immediate rollout is safe. Legal flags GDPR risk."
- Error if missing: "What are they disagreeing on? (Required)"
- Error if too vague: "Be specific: 'Policy says X. Legal says Y.' not just 'We disagreed'"

### Strongly Recommended Fields

These should be filled for complete visualization. Warning if missing, Save still works.

**resolutionMechanism**
- Type: string (1-2 sentences)
- Example: "CTO sided with legal based on regulatory risk assessment"
- Examples of good mechanisms:
  - "Authority decision: [who] sided with [whom]"
  - "Voting: [X] out of [Y] chose [position]"
  - "Compromise: we chose staged rollout (between [A] and [B])"
  - "Consensus: everyone agreed [priority] was highest"
- Warning if missing: "Add how it was decided for richer visualization"

**outcome**
- Type: string (specific, not vague)
- Example: "Staged rollout with legal review before each phase, no immediate global launch"
- Not: "Approved" or "We went with legal"
- Warning if missing: "Final outcome adds closure to the narrative"

### Optional Fields

Enhance visualization but not required.

**timeline**
- When each agent entered the debate
- Example: "Day 1: Policy proposed. Day 2: Legal raised concerns. Day 3: CTO decided."
- Useful for: Showing escalation, revealing when information surfaces

**evidence**
- Supporting quotes, decision records, links
- Example: "GDPR audit report flagged 3 compliance gaps"
- Useful for: Making decisions traceable

---

## Validation Rules (For Code Implementation)

```
REQUIRED VALIDATION:
  if (agentRoster.length < 2) {
    error: "Add at least 2 agents to show disagreement"
    action: DISABLE_SAVE
  }
  
  if (!disagreementDimension || disagreementDimension.trim().length === 0) {
    error: "What are they disagreeing on? (Required)"
    action: DISABLE_SAVE
  }

RECOMMENDED VALIDATION:
  if (agentRoster.length >= 5) {
    warning: "You have 5+ agents. Timeline visualization can get crowded. 
              Consider Conflict Network (see tension lines) or Decision Tree (see resolution path)."
    action: SHOW_ALTERNATIVE_VIEWS_TOGGLE
  }
  
  if (!resolutionMechanism || resolutionMechanism.trim().length === 0) {
    warning: "Add how it was resolved for richer visualization"
    action: ALLOW_SAVE_BUT_SHOW_WARNING
  }
  
  if (!outcome || outcome.trim().length === 0) {
    warning: "Final outcome adds closure to the narrative"
    action: ALLOW_SAVE_BUT_SHOW_WARNING
  }

AGENT COUNT BEHAVIOR:
  if (agentCount < 5) → Show Timeline only
  if (agentCount >= 5) → Show Timeline + offer Conflict Network + Decision Tree toggle
  if (agentCount > 8) → Recommend Credential Boundary or Assumption Surface
```

---

## User-Facing Guidance

### Recommendation Message (When Pattern is Suggested)

**Confidence >= 70%:**

"✓ Convergence Point  
Recommended based on your scenario

Why this pattern?  
• You have multiple agents with different positions  
• Clear disagreement detected  
• Shows how conflict was resolved (not just what was decided)

Research shows this is needed when:  
'Users need to see convergence mechanics: what was adopted, what was flagged as impasse, and why.'

[Try this] [Learn more]"

### Extraction Questions (In Chat, Priority Order)

Ask these in sequence if user hasn't filled fields:

1. **"How many agents are involved?"**  
   → Checks if >= 2 (required for pattern)

2. **"What did they disagree on?"**  
   → Fills disagreementDimension (core of pattern)  
   → Example: "Policy says X. Legal says Y."

3. **"How was it resolved? Who decided?"**  
   → Fills resolutionMechanism  
   → Example: "CTO sided with legal because regulatory risk was highest"

4. **"What was the final outcome?"**  
   → Fills outcome  
   → Example: "Staged rollout with legal review before each phase"

5. **"Any timeline info? When did things happen?"**  
   → Optional, enriches visualization

### Error Messages (When Validation Fails)

**Missing agents (< 2):**  
"Add at least 2 agents to show disagreement"

**Missing disagreement:**  
"What are they disagreeing on? (e.g., 'Policy wants X. Legal wants Y.')"

**Too vague disagreement:**  
"Be specific: tell me what each agent wanted, not just that they disagreed"

### Warning Messages (When Fields Are Empty)

**Missing resolution:**  
"💡 Add how it was resolved (who decided? authority, voting, compromise?) for richer visualization"

**Missing outcome:**  
"💡 Final outcome adds closure to the narrative (what was actually chosen?)"

**5+ agents:**  
"💡 You have 5+ agents. Timeline works for 2-4. Try Conflict Network (see who disagrees with whom) or Decision Tree (see resolution path) for better visualization of this complexity."

---

## Field Guide: Good vs. Bad Descriptions

### disagreementDimension

**❌ Too vague:**
- "We disagreed"
- "Different opinions"
- "There was conflict"

**✓ Good:**
- "Policy team wanted immediate rollout (time-sensitive). Legal team flagged GDPR risk (compliance-critical)."
- "Performance wanted low-latency always. Reliability wanted stability over speed."
- "Billing thought charge was valid data-sync issue. Finance worried revenue impact. Legal found fraud pattern."

**Pattern to follow:**  
"[Agent A] says [specific position]. [Agent B] says [specific position]."

**Inline tip to show users:**  
"Be specific about what each team wanted, not just that they disagreed. Example: 'Policy wants X. Legal wants Y.'"

---

### resolutionMechanism

**❌ Too vague:**
- "We decided"
- "We resolved it"
- "The team approved it"

**✓ Good (by type):**
- *Authority:* "CTO had final call, sided with legal because GDPR compliance is non-negotiable"
- *Voting:* "4 out of 6 voted for staged rollout (between immediate and gated approaches)"
- *Compromise:* "We chose staged rollout with legal review before each phase (split the difference)"
- *Consensus:* "After legal explained the GDPR risk, everyone agreed no rollout until audit complete"
- *Escalation:* "Escalated to legal review. Legal's GDPR concerns overrode timeline pressure"

**Pattern to follow:**  
"[Mechanism]: [Who/how], [because/why based on priority]"

**Inline tip to show users:**  
"How was it actually decided? By authority (who?), voting, compromise, consensus, or escalation? And why did that approach win?"

---

### outcome

**❌ Too vague:**
- "Approved"
- "We went with legal"
- "Accepted"

**✓ Good (specific outcome):**
- "Staged rollout with legal review before each phase. No immediate global launch."
- "GDPR audit required before any rollout. Estimated 2-week delay."
- "US rollout approved immediately. EU rollout deferred until compliance audit complete."
- "Billing bug found and fixed. Full refund issued. Incident report filed."

**Pattern to follow:**  
Describe the ACTUAL decision/action, not just who won.

**Inline tip to show users:**  
"What was actually done? Not 'we chose X' but 'we chose X: here's what that means...'"

---

## Visual Representation Guide

### With 2-4 Agents

Show **Timeline** (default):
- Agents as colored lanes
- Disagreement as "pinch" (visual tension)
- Resolution as merge point
- Outcome as final node
- Clean, sequential, easy to follow

### With 5+ Agents

Offer **three views**:

1. **Conflict Network** (recommended for 5+)
   - Agents as nodes (circles)
   - Disagreements as connecting lines (thickness = intensity)
   - Color shows agent name
   - Reveals structure of conflict ("Is it 2 vs. 3?" or "Everyone vs. one?")

2. **Decision Tree** (recommended for hierarchical conflicts)
   - Root node: core disagreement
   - Branches: each agent's position
   - Leaves: convergence point
   - Outcome: final decision
   - Shows "why" the conflict narrowed

3. **Timeline** (still available)
   - Useful for: understanding temporal flow, who moved when
   - Less useful for: visualizing complex multi-party conflict

---

## Common Mistakes & Auto-Corrections

These trigger when user input is detected. System should auto-suggest correction.

### Mistake 1: Disagreement Missing

**Detector:** agentRoster.length >= 2 BUT disagreementDimension is empty or vague

**What user does:**  
"We had 3 agents. We decided to rollout."

**Why it's a problem:**  
No conflict shown, pattern loses its value (looks like collaboration, not convergence)

**Auto-correction message:**  
"Convergence Point shows how disagreement was resolved. What did each agent want? For example: 'Team A wanted rollout. Team B feared downtime. Team C wanted gates.' What was the actual conflict?"

---

### Mistake 2: Resolution Hidden

**Detector:** disagreementDimension is filled BUT resolutionMechanism is empty

**What user does:**  
"Policy and legal disagreed on GDPR rollout timing."

**Why it's a problem:**  
We see the conflict but not how it resolved. Story is incomplete.

**Auto-correction message:**  
"How was it decided? Who had the final say? (Authority: CTO decided? Voting? Compromise? Consensus?)"

---

### Mistake 3: Outcome Too Vague

**Detector:** resolutionMechanism is filled BUT outcome is vague (just "approved", "we went with legal", etc.)

**What user does:**  
"CTO decided. Final: we went with legal."

**Why it's a problem:**  
We know who won, but not what that actually means in practice. Outcome is abstract.

**Auto-correction message:**  
"What does 'went with legal' actually mean? Be specific: 'No rollout until GDPR audit' or 'Staged rollout with legal review before each phase'?"

---

### Mistake 4: Too Many Agents for Primary Visualization

**Detector:** agentRoster.length >= 5

**What user does:**  
"We had 7 agents with different opinions."

**Why it's a problem:**  
Timeline visualization becomes crowded and hard to read with 5+ lanes

**Auto-correction message:**  
"You have 5+ agents! Timeline visualization can get crowded with this many lanes. I'm showing you Conflict Network (reveals who disagrees with whom) and Decision Tree (shows how branches narrow to resolution) as alternatives. Which helps you understand this scenario better?"

---

### Mistake 5: Wrong Pattern Choice

**Detector:** NO disagreement detected (agentRoster.length >= 1 BUT disagreementDimension suggests agreement/collaboration)

**What user does:**  
"We had 3 teams work together on rollout. We collaborated and succeeded."

**Why it's a problem:**  
This is collaboration, not conflict resolution. Wrong pattern.

**Auto-correction message:**  
"This sounds like collaboration without disagreement. Convergence Point is for conflicts that needed resolution. For teamwork without conflict, try Credential Boundary (why all 3 teams were needed) or Deferred Detail (how it unfolded over time). Does that fit better?"

---

## When to Recommend Other Patterns Instead

Use this to redirect users to better-fit patterns.

### If user says: "We made a decision, but no disagreement"
→ **Use Decision Ledger instead**  
Decision Ledger is cleaner for single-agent or unanimous decisions. It focuses on reasoning, not conflict.

### If user focuses on: "Why they disagreed" (different assumptions)
→ **Also use Assumption Surface**  
Assumption Surface shows ROOT CAUSE (what each agent assumed). Convergence Point shows RESOLUTION (how it was resolved). Use both for complete story.

### If user emphasizes: "Why multiple roles were needed"
→ **Also use Credential Boundary**  
Credential Boundary explains why no single person could decide. Convergence Point shows how they did decide. Use both to show capability split + conflict resolution.

### If user describes: "Escalation over time with information reveals"
→ **Also use Deferred Detail**  
Deferred Detail focuses on phases of escalation. Convergence Point focuses on positions and convergence. Use both if escalation matters to understanding.

---

## Extraction Questions (For Chat Integration)

Ask in this order. Skip if already answered.

**Q1: "How many agents are involved?"**  
Field: agentRoster.length  
Why: Checks if pattern fits (min 2)  
Accept: Number or agent names  
Example: "3 teams" or "policy, legal, compliance"

**Q2: "What did they disagree on?"**  
Field: disagreementDimension  
Why: Core of pattern  
Accept: "[Agent A] wanted X. [Agent B] wanted Y."  
Example: "Policy wanted immediate rollout. Legal flagged GDPR risk."

**Q3: "How was it resolved? Who decided?"**  
Field: resolutionMechanism  
Why: Shows conflict resolution mechanics  
Accept: Authority / voting / compromise / consensus / escalation  
Example: "CTO sided with legal because GDPR compliance is non-negotiable"

**Q4: "What was the final outcome?"**  
Field: outcome  
Why: Closes the story with specificity  
Accept: Specific action or decision  
Example: "Staged rollout with legal review before each phase"

**Q5 (Optional): "When did things happen? Any timeline?"**  
Field: timeline  
Why: Enriches visualization, shows escalation  
Accept: "Day 1... Day 2... Day 3..."  
Example: "Day 1: Policy proposed. Day 2: Legal raised concerns. Day 3: CTO decided."

**Q6 (Optional): "Any supporting evidence? Quotes, links, decisions?"**  
Field: evidence  
Why: Makes decisions traceable  
Accept: Quotes, links, decision records  
Example: "GDPR audit report flagged 3 compliance gaps"

---

## Metrics for Success

**From practitioner research,** a good Convergence Point instance lets users answer these questions:

✓ **Who disagreed and on what?**  
→ 2+ agents, clear disagreement (not vague)

✓ **What did each agent want?**  
→ Distinct positions named (not "we had opinions")

✓ **Who decided and how?**  
→ Mechanism named (authority, voting, compromise, consensus, escalation)

✓ **What was actually chosen?**  
→ Specific outcome (not "approved" or "we went with legal")

✓ **Why did that position win?**  
→ Visible reason ("legal risk was highest priority")

✓ **What was rejected and why?**  
→ Impasse named ("immediate rollout flagged as unsafe")

**Practitioner quote:**  
"I can look at the timeline and see why that decision was chosen, not just that it was made."

---

## Anti-Patterns (When NOT to Use Convergence Point)

**Pattern fits poorly if:**

❌ Single agent made decision (no disagreement)  
→ **Use:** Decision Ledger

❌ Team was collaborative (agreement, not conflict)  
→ **Use:** Credential Boundary or Deferred Detail

❌ Want to show reasoning without conflict  
→ **Use:** Decision Ledger

❌ 8+ agents in high conflict (timeline unreadable)  
→ **Use:** Credential Boundary (why multi-role needed) OR Assumption Surface (root causes)

---

## Example Scenarios

### Example 1: Logs vs. Code (From Interview Research)
```
Agents: 2 (logs team, code team)
Disagreement: Logs team said trace was insufficient. Code team said trace was complete.
Resolution: Conflict resolver sided with logs team — re-ran with extended trace.
Outcome: Re-traced, bug found in dependency version mismatch.
Visualization: Clean 2-lane timeline, pinch at disagreement, merge at resolution.
Source: Interview finding — "When log processing and code analysis disagree, users need 
to see who won and why, not just the final trace output."
```

### Example 2: Policy vs. Legal vs. Compliance (From Interview Research)
```
Agents: 3 (policy-team, legal-team, compliance-team)
Disagreement: Policy wanted immediate rollout (time-sensitive). Legal flagged GDPR risk. 
Compliance flagged cert issues.
Resolution: CTO decision: rollout with compliance hold on EU regions.
Outcome: US rollout immediate, EU rollout deferred 2 weeks for cert audit.
Visualization: Conflict Network shows three-way tension. Timeline shows each team's concern.
Practitioner quote (from interview): "We struggled to explain why we chose legal's region-based approach 
over immediate global rollout. A pattern like Convergence Point would make this tradeoff clear."
```

### Example 3: Agent Disagreement in Incident Response
```
Agents: 3 (billing, finance, legal)
Disagreement: Billing thought duplicate charge was a data sync issue (recoverable). 
Finance worried about revenue impact. Legal found fraud signal in pattern.
Resolution: Legal's concern triggered audit (authority = risk assessment priority).
Outcome: Found billing bug, issued full refund, filed incident report.
Timeline: Day 1 (Billing only). Day 2 (Finance joins, escalates). Day 3 (Legal joins, 
finds fraud pattern, changes resolution from "monitor" to "refund").
Visualization: Timeline shows when each agent entered debate. Pinch peaks at Day 3 
when legal reframes the problem.
Interview finding: "Sub-agents disagree, users need to see convergence mechanics: 
what was adopted, what was flagged as impasse, and why."
```

---

## System Message Guidelines

All messages to users should follow these principles:

**DO:**
- ✓ "Shows how conflict was resolved" (clear)
- ✓ "You had policy vs. legal — this pattern shows which won and why" (uses their scenario)
- ✓ "Add the resolution (who decided?) to complete the story" (action-oriented)
- ✓ "You have 1 agent, so Decision Ledger is cleaner" (honest redirect)
- ✓ "Research shows users need to see..." (reference research findings)

**DON'T:**
- ❌ "Convergence point represents agent consensus" (jargon)
- ❌ "Please add resolution" (unnecessary politeness)
- ❌ Recommend pattern when only 1 agent exists (dishonest)
- ❌ Generic guidance without referencing user's actual data

---

## Implementation Checklist (For Cursor)

Wire these into edit form + chat extraction system:

**Validation Rules:**
- [ ] Error if agentRoster.length < 2
- [ ] Error if disagreementDimension is empty
- [ ] Warning if agentRoster.length >= 5 (show alternatives toggle)
- [ ] Warning if resolutionMechanism is empty
- [ ] Warning if outcome is empty

**Inline Guidance:**
- [ ] Show good/bad examples for each field
- [ ] Ask extraction questions in priority order (Q1→Q6)
- [ ] Auto-detect 5 common mistakes and suggest corrections
- [ ] Show specific error messages (not generic)

**System Messages:**
- [ ] Recommendation references research ("One team told us...")
- [ ] Warnings use gentle tone ("💡 Add ... for richer visualization")
- [ ] Errors are specific ("Be specific about what each team wanted")
- [ ] Messages reference user's actual data when possible

**Integration Points:**
- [ ] Load this `.md` file on app start
- [ ] Parse into structured validation/guidance data
- [ ] Wire validation into form onChange (debounced 300ms)
- [ ] Wire extraction questions into chat conversation flow
- [ ] Show field tips as user types in textareas

---

## Quick Reference for Cursor

### Field Mapping

```
Form input              →  Instructions field        →  Validation rule
─────────────────────────────────────────────────────────────────────
<input "agents">        →  agentRoster               →  length >= 2 (error)
<textarea "what">       →  disagreementDimension     →  not empty (error)
<textarea "how">        →  resolutionMechanism       →  (warning if empty)
<textarea "outcome">    →  outcome                   →  (warning if empty)
<textarea "timeline">   →  timeline                  →  (optional)
<textarea "evidence">   →  evidence                  →  (optional)
```

### Error/Warning Display

```
if (validationResult.errors.length > 0) {
  // Show red box with error icon
  // Disable Save button
  // List ALL errors (not just first)
}

if (validationResult.warnings.length > 0) {
  // Show yellow/amber box with info icon
  // Allow Save but show confirmation
  // List all warnings
}
```

### Field Tips (Show Below Input)

When user focuses or types in field:

**For agentRoster:**
```
"Add 2+ agent names. Timeline works best with 2-4 agents.
5+ agents? Try Conflict Network or Decision Tree views."
```

**For disagreementDimension:**
```
"Be specific about positions. ✓ Good: 'Policy wanted X. Legal wanted Y.'
❌ Avoid: 'We disagreed'"
```

**For resolutionMechanism:**
```
"How was it decided? By authority (who?), voting, compromise, 
consensus, or escalation? Include the reasoning."
```

**For outcome:**
```
"What was actually chosen? Not just 'approved' but the specific 
decision or action taken."
```

### Error Messages (Copy-Paste Ready)

```typescript
const errorMessages = {
  agentRoster_empty: "Add at least 2 agents to show disagreement",
  agentRoster_tooFew: "Convergence Point requires 2+ agents for conflict",
  disagreementDimension_empty: "What are they disagreeing on? (Required)",
  disagreementDimension_tooVague: "Be specific: 'Policy says X. Legal says Y.' not just 'We disagreed'",
  agentCount_high: "You have 5+ agents. Timeline can get crowded. Try Conflict Network (see tensions) or Decision Tree (see resolution path).",
};

const warningMessages = {
  resolutionMechanism_empty: "💡 Add how it was resolved (authority, voting, compromise?) for richer visualization",
  outcome_empty: "💡 Specific outcome adds closure (not just 'approved')",
  agentCount_extended: "💡 With 5+ agents, consider alternative visualizations",
};
```

### Extraction Chat Flow

```
User message contains scenario
  ↓
Load extraction questions from instructions
  ↓
For each question in priority order:
  - Check if field is filled
  - If not: ask question in chat
  - User responds
  - Extract answer → form field
  - Move to next question
  ↓
When all 4 required Qs answered:
  Show: "Your instance is ready. Review preview, then Save?"
  
When user clicks Save:
  - Validate all fields
  - If errors: show them, block save
  - If warnings: show them, ask confirmation
  - If valid: proceed with save
```

### Common Mistake Detection

```typescript
// Mistake 1: Disagreement Missing
if (agentRoster.length >= 2 && !disagreementDimension?.trim()) {
  suggest("Convergence Point shows how disagreement was resolved. 
    What did each agent want? (e.g., 'Team A wanted X. Team B wanted Y.')");
}

// Mistake 2: Resolution Hidden
if (disagreementDimension?.trim() && !resolutionMechanism?.trim()) {
  suggest("How was it decided? Who had the final say? 
    (Authority, voting, compromise, consensus, or escalation?)");
}

// Mistake 3: Outcome Too Vague
if (resolutionMechanism?.trim() && (!outcome?.trim() || isVague(outcome))) {
  suggest("What does that actually mean in practice? 
    Be specific: 'No rollout until GDPR audit' not 'We went with legal'");
}

// Mistake 4: Too Many Agents
if (agentRoster.length >= 5) {
  suggest("You have 5+ agents. Timeline gets crowded. 
    Try Conflict Network (show who disagrees) or Decision Tree (show resolution branches).");
}

// Mistake 5: Wrong Pattern
if (isCollaborationNotConflict(disagreementDimension)) {
  suggest("This sounds like collaboration without disagreement. 
    Convergence Point is for conflicts. Try Credential Boundary (why all roles needed) 
    or Deferred Detail (how it unfolded).");
}
```

### Visual State Indicators

```
FORM STATE              SAVE BUTTON         PREVIEW              CHAT
─────────────────────────────────────────────────────────────────────
Empty                   Disabled (gray)     Empty                 "Try this"
Agents only             Disabled (gray)     Empty                 "Add disagreement"
Agents + Disagreement   Enabled (blue)      Shows timeline        "Good! Add resolution?"
+ Resolution            Enabled (blue)      Shows timeline        "Almost ready"
+ Outcome               Enabled (blue)      Full preview          "All set"
5+ agents               Enabled             Timeline + toggle     "Try alternatives?"
```

### Testing Edge Cases

**Should handle:**
- [ ] User types agent name without comma (auto-split or error?)
- [ ] User leaves timeline blank (optional, OK)
- [ ] User enters very long disagreement text (truncate in preview? or warn?)
- [ ] User rapidly changes agent count (debounce validation)
- [ ] User clicks Save multiple times (disable button while saving)
- [ ] Network error saving (show retry + error message)
- [ ] Pattern doesn't fit (early redirect to better pattern)

---

## Chat Extraction Flow (Step-by-Step)

### Initial Trigger

**When user clicks "Try this":**

```
System loads convergence-point instructions
System detects: formState is empty
System asks Q1: "How many agents are involved?"

Example system message:
"Let's build a Convergence Point. First: how many agents did you have?
(Need at least 2 for conflict visualization)"
```

### Q1: Agents

```
User: "We had 3 teams"
System extracts: agentRoster = ["team 1", "team 2", "team 3"]
System checks: length >= 2 ✓
System asks Q2: "What did they disagree on?"
```

### Q2: Disagreement

```
User: "Policy wanted immediate rollout but legal flagged GDPR"
System extracts: disagreementDimension = "Policy wanted immediate rollout. Legal flagged GDPR risk."
System checks: filled & specific ✓
System asks Q3: "How was it resolved?"

If user said something vague like "We disagreed":
System suggests: "Be specific: what did each team want? 
E.g., 'Policy wanted X. Legal wanted Y.'"
User re-answers, system extracts again
```

### Q3: Resolution

```
User: "CTO sided with legal"
System extracts: resolutionMechanism = "CTO sided with legal"
System checks: filled but could be more detailed
System asks: "Why did CTO side with legal? What was the priority or risk?"
User: "GDPR compliance risk was non-negotiable"
System updates: resolutionMechanism = "CTO sided with legal because GDPR compliance risk was non-negotiable"
System asks Q4: "What was the final outcome?"
```

### Q4: Outcome

```
User: "No rollout until GDPR audit"
System extracts: outcome = "No rollout until GDPR audit complete"
System checks: specific ✓
System asks Q5: "Any timeline info? When did things happen?"
```

### Q5: Timeline (Optional)

```
User: "Sure, Day 1 policy proposed, Day 2 legal raised concerns, Day 3 CTO decided"
System extracts: timeline = "Day 1: Policy proposed. Day 2: Legal raised concerns. Day 3: CTO decided."
System asks Q6: "Any supporting evidence? Links, quotes, decision records?"
```

### Q6: Evidence (Optional)

```
User: "We have a GDPR audit report flagging 3 compliance gaps"
System extracts: evidence = "GDPR audit report flagged 3 compliance gaps"
System checks: all questions answered
System shows: "Your instance is ready! Review in preview, then Save?"

[Preview shows filled form + timeline visualization]
[User reviews]
[User clicks Save]
[Validation runs]
[If valid: instance saved + shows loading state + then alternatives if 5+ agents]
```

---

## Error Recovery Examples

### User Gives Incomplete Answer to Q2

```
User: "Policy vs legal disagreed"
System: "That's clear there's disagreement, but what did each want?
  ❌ "Policy vs legal disagreed"
  ✓ "Policy wanted immediate rollout. Legal wanted staged with audits."
  Can you be more specific?"
User: "Policy wanted to go live tomorrow. Legal wanted to wait for GDPR audit."
System extracts: "Policy wanted to go live tomorrow. Legal wanted to wait for GDPR audit."
System proceeds to Q3
```

### User Picks Wrong Pattern

```
User: "We had 3 teams working together on rollout"
System detects: no conflict language
System suggests: "This sounds like teamwork without disagreement. 
  Convergence Point is for conflicts that needed resolution.
  
  Better patterns:
  • Credential Boundary (why all 3 teams were needed)
  • Deferred Detail (how it unfolded over phases)
  
  Does one of those fit better? Or is there actually a disagreement I'm missing?"

User: "Oh no, actually policy and legal disagreed on timing"
System: "Got it! Then Convergence Point is right. What did they each want?"
```

### User Provides Too Much Info

```
User: [Pastes entire incident report, 3 paragraphs]
System: "Thanks for the detail! Let me extract the key parts:
  • Agents: Policy, Legal, Finance
  • Disagreement: Policy wanted immediate launch. Legal wanted audit first.
  • Resolution: CTO sided with legal.
  • Outcome: Delayed launch 2 weeks for audit.

Does that match? Anything missing or different?"
```

---

## Accessibility & Mobile Considerations

**Form Layout (Mobile):**
- Inputs stack vertically
- Labels above inputs (not floating)
- Tips appear below field (not tooltips)
- Error messages in red box below field
- Warning messages in yellow/amber box

**Chat Layout (Mobile):**
- Questions full-width
- User answer in input at bottom
- System extracts and confirms
- Moves to next question
- Can't see full history (scroll up to see)

**Screen Readers:**
- Field labels associated with inputs
- Error/warning messages announced
- Extraction questions read naturally
- Preview updates announced ("Timeline loaded")

---

## When to Show This Instructions File in UI

**Show link to full instructions when:**
- User opens pattern for first time (info icon with "Learn more")
- User clicks "Help" on any field
- User hovers over "What is Convergence Point?" badge
- Pattern recommendation shown in chat (link in recommendation card)

**Don't show by default:**
- Not in success confirmation (keeps celebration clean)
- Not in error messages (too much text, focus on fix)
- Not on every form load (users don't need to re-read)
