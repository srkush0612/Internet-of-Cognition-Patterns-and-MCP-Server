"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity, ArrowRight, ArrowUp, Check, ChevronDown, ChevronLeft,
  ChevronRight, Code2, Command, FileCode2,
  Folder, Gauge, GitBranch, Layers3, ListTodo, LoaderCircle, MessageSquare,
  MoreHorizontal, PanelRight, Plus, Search, Settings2, Shield, ShieldAlert, Square,
  Terminal, X,
} from "lucide-react";
import { ConvergencePoint } from "@/components/patterns/ConvergencePoint";

type Stage = 0 | 1 | 2 | 3 | 4;

const prompt = "Set up the HAX interaction patterns MCP in this project. Then find a pattern for when security agents disagree and integrate it into my Cloud Control prototype.";

const recentAgentExchanges = [
  { agent: "Vulnerability Analyst", color: "blue", message: "Advisory matches openssl 3.0.13 in production.", time: "14:02:18" },
  { agent: "Exposure Assessor", color: "violet", message: "Reachability still unconfirmed on 22% of routes.", time: "14:02:19" },
  { agent: "Change Planner", color: "gold", message: "No owner-approved maintenance window found.", time: "14:02:20" },
  { agent: "Vulnerability Analyst", color: "blue", message: "Patch path is available; impact check is pending.", time: "14:02:21" },
  { agent: "Exposure Assessor", color: "violet", message: "Compensating control may limit external access.", time: "14:02:22" },
  { agent: "Change Planner", color: "gold", message: "22:00 window needs Payments Platform confirmation.", time: "14:02:23" },
  { agent: "Exposure Assessor", color: "violet", message: "Runtime graph conflicts with route inventory.", time: "14:02:24" },
];

export function McpStory() {
  const conversationScrollRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>(0);
  const [draft, setDraft] = useState("");
  const [playing, setPlaying] = useState(false);
  const [submittedPrompt, setSubmittedPrompt] = useState(prompt);
  const [adopted, setAdopted] = useState(false);
  const [keptOpen, setKeptOpen] = useState(false);
  const [integrationChoice, setIntegrationChoice] = useState<"pending" | "integrating" | "approved" | "deferred">("pending");

  useEffect(() => {
    let index = 0;
    let submitTimer = 0;
    const typingTimer = window.setInterval(() => {
      index += 1;
      setDraft(prompt.slice(0, index));
      if (index >= prompt.length) {
        window.clearInterval(typingTimer);
        submitTimer = window.setTimeout(() => {
          setSubmittedPrompt(prompt);
          setDraft("");
          setStage(1);
          setPlaying(true);
        }, 550);
      }
    }, 24);

    return () => {
      window.clearInterval(typingTimer);
      window.clearTimeout(submitTimer);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (stage >= 4 || stage === 2) { setPlaying(false); return; }
    const timer = window.setTimeout(() => setStage((current) => (current + 1) as Stage), 4600);
    return () => window.clearTimeout(timer);
  }, [playing, stage]);

  useEffect(() => {
    if (integrationChoice !== "integrating") return;
    const timer = window.setTimeout(() => {
      setIntegrationChoice("approved");
      setStage(3);
      setPlaying(true);
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [integrationChoice]);

  useEffect(() => {
    const conversation = conversationScrollRef.current;
    if (!conversation || stage === 0) return;
    const frame = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      conversation.scrollTo({
        top: conversation.scrollHeight,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [stage, integrationChoice]);

  const sendPrompt = () => {
    if (!draft.trim()) return;
    setSubmittedPrompt(draft.trim());
    setStage(1);
    setPlaying(true);
  };
  const advance = () => setStage((current) => (current >= 4 ? 4 : (current + 1) as Stage));

  return (
    <main className="codex-demo" data-stage={stage}>
      <aside className="codex-sidebar">
        <div className="codex-brand"><span className="codex-brandmark">✳</span><b>Codex</b><button aria-label="Collapse sidebar"><PanelRight size={15}/></button></div>
        <button className="sidebar-action active"><Plus size={15}/> New task <kbd>⌘ K</kbd></button>
        <button className="sidebar-action"><Search size={15}/> Search tasks</button>
        <div className="sidebar-section-label">WORKSPACES <button aria-label="Add workspace"><Plus size={13}/></button></div>
        <button className="workspace-row"><Folder size={14}/> cloud-control <ChevronDown size={13}/></button>
        <button className="workspace-subrow"><GitBranch size={13}/> main</button>
        <div className="sidebar-section-label history-label">RECENTS <button><MoreHorizontal size={15}/></button></div>
        <button className={`history-row ${stage === 0 ? "" : "selected"}`}><MessageSquare size={14}/><span>Add agent disagreement flow</span></button>
        <button className="history-row"><MessageSquare size={14}/><span>Review response dashboard</span></button>
        <button className="history-row"><MessageSquare size={14}/><span>Update security runbook</span></button>
        <div className="sidebar-bottom"><button><Settings2 size={14}/> Settings</button><div className="account-chip"><span>MK</span><div><b>Maya Kim</b><small>Personal workspace</small></div><MoreHorizontal size={14}/></div></div>
      </aside>

      <section className="codex-content">
        <header className="codex-titlebar">
          <div className="titlebar-project"><span className="project-mark"><Layers3 size={14}/></span><b>cloud-control</b><ChevronDown size={13}/><span className="titlebar-divider"/><span className="branch-label"><GitBranch size={12}/> main</span><span className="dirty-pill">working tree</span></div>
          <div className="titlebar-actions"><button aria-label="More options"><MoreHorizontal size={17}/></button></div>
        </header>

        {stage === 0 ? (
          <div className="thread-layout with-preview opening-layout">
            <div className="conversation-column opening-conversation">
              <div className="thread-title"><div><span className="thread-icon"><ListTodo size={15}/></span><span>New task</span></div><button><MoreHorizontal size={16}/></button></div>
              <div className="opening-composer"><PromptComposer value={draft} onChange={setDraft} onSend={sendPrompt} ready={Boolean(draft.trim())}/></div>
            </div>
            <IntegratedPreview stage={0} integrationChoice={integrationChoice} adopted={adopted} keptOpen={keptOpen} onAdopt={()=>{setAdopted(true);setKeptOpen(false)}} onKeepOpen={()=>{setAdopted(false);setKeptOpen(true)}}/>
          </div>
        ) : (
          <>
            <div className={`thread-layout with-preview`}>
              <div className="conversation-column">
                <div className="conversation-scroll" ref={conversationScrollRef}>
                  <div className="thread-title"><div><span className="thread-icon"><ListTodo size={15}/></span><span>Add agent disagreement flow</span><ChevronDown size={13}/></div><button><MoreHorizontal size={16}/></button></div>
                  <div className="conversation">
                    <div className="user-turn"><span className="user-avatar">MK</span><div><div className="turn-label">You <span>· just now</span></div><p>{submittedPrompt}</p></div></div>
                    <div className="assistant-turn"><div className="assistant-mark">✳</div><div className="assistant-body"><div className="turn-label">Codex <span>· working in cloud-control</span></div><AssistantContent stage={stage} adopted={adopted} keptOpen={keptOpen} integrationChoice={integrationChoice}/>
                      {stage === 2 && integrationChoice === "integrating" && <div className="integration-chat-progress"><LoaderCircle size={15}/><div><b>Adapting Convergence Point</b><span>Mapping agent findings to the Cloud Control response flow…</span><i><b/></i></div><em>WORKING</em></div>}
                      {stage === 2 && integrationChoice !== "integrating" && <div className="human-approval-actions"><button className="quiet-action" onClick={() => setIntegrationChoice("deferred")}>{integrationChoice === "deferred" ? "Not now · no changes made" : "Not now"}</button><button className="primary-action" onClick={() => {setIntegrationChoice("integrating");setPlaying(false)}}>{integrationChoice === "deferred" ? "Integrate the pattern" : "Yes, integrate it"}<ArrowRight size={13}/></button></div>}
                      {stage < 4 && stage !== 2 && !playing && <button className="continue-run" onClick={advance}>{stage === 1 ? "Search the pattern library" : "Review integrated UI"}<ArrowRight size={14}/></button>}
                    </div></div>
                  </div>
                </div>
                <div className="thread-composer"><PromptComposer value="" onChange={() => {}} onSend={advance} ready={false}/><div className="thread-composer-tools"><div><button><Plus size={15}/></button><button><Code2 size={14}/></button><span><Activity size={13}/> Agent mode</span><span><ChevronDown size={12}/></span></div><button className={`send-button ${playing ? "is-running" : ""}`} onClick={()=>setPlaying((value)=>!value)} aria-label={playing ? "Stop response" : "Continue response"}>{playing ? <Square size={11} fill="currentColor"/> : <ArrowUp size={15}/>}</button></div></div>
                <div className="thread-footnote">Codex may make mistakes. Review generated changes before using them.</div>
              </div>
              <IntegratedPreview stage={stage} integrationChoice={integrationChoice} adopted={adopted} keptOpen={keptOpen} onAdopt={()=>{setAdopted(true);setKeptOpen(false)}} onKeepOpen={()=>{setAdopted(false);setKeptOpen(true)}}/>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function PromptComposer({ value, onChange, onSend, ready }: { value: string; onChange: (value:string)=>void; onSend: ()=>void; ready: boolean }) {
  return <div className="prompt-composer"><textarea value={value} onChange={(event)=>onChange(event.target.value)} onKeyDown={(event)=>{if(event.key === "Enter" && !event.shiftKey && ready){event.preventDefault();onSend();}}} placeholder="Ask Codex to build, explain, or fix anything…" aria-label="Message Codex"/><div className="composer-bottom"><div><button aria-label="Add context"><Plus size={16}/></button><button className="model-choice">GPT-6.1 <ChevronDown size={11}/></button><span className="reasoning-choice">High reasoning <ChevronDown size={11}/></span></div><button className={`composer-send ${ready?"ready":""}`} onClick={onSend} aria-label="Send prompt" disabled={!ready}><ArrowUpIcon/></button></div></div>;
}

function ArrowUpIcon() { return <span className="send-arrow">↑</span>; }

function AssistantContent({ stage, adopted, keptOpen, integrationChoice }: { stage: Stage; adopted: boolean; keptOpen: boolean; integrationChoice: "pending" | "integrating" | "approved" | "deferred" }) {
  if (stage === 1) return <>
    <p>I’ll connect the project to the HAX Patterns MCP, then use it to find the right interaction and adapt it to your existing Cloud Control UI.</p>
    <div className="thinking-row"><LoaderCircle size={14}/> Checking project setup and adding MCP configuration…</div>
    <div className="tool-event"><div className="tool-event-head"><span className="tool-square"><Terminal size={13}/></span><b>Updated project configuration</b><span className="tool-complete"><Check size={12}/> Done</span></div><div className="file-changes"><span><FileCode2 size={13}/> .mcp.json <i>new</i></span><span><FileCode2 size={13}/> .gitignore <i>updated</i></span></div><div className="config-excerpt"><span className="code-line-no">1</span><code>{'{'} <em>"mcpServers"</em>: {'{'} <em>"ioc-patterns"</em>: {'{'} … {'}'} {'}'} {'}'}</code><small>Authorization secret supplied locally</small></div><div className="tool-event-foot"><Shield size={12}/> Added <code>.mcp.json</code> to <code>.gitignore</code> so the local credential stays out of source control.</div></div>
    <p>The server is ready for this project. I’m searching for a pattern that fits three specialist agents with separate evidence and a shared decision.</p>
    <div className="tool-progress"><span className="tool-spin"><LoaderCircle size={13}/></span><span>HAX Patterns MCP</span><i/> <code>discover_patterns</code><span className="running-label">RUNNING</span></div>
  </>;
  if (stage === 2) return <>
    <p>The catalog recommends <b>Convergence Point</b>. It is designed for specialist agents that reach different answers, and makes the evidence, open divergence, and final decision visible.</p>
    <div className="tool-event pattern-event"><div className="tool-event-head"><span className="tool-square purple"><Terminal size={13}/></span><b>HAX Patterns MCP · discover_patterns</b><span className="tool-complete"><Check size={12}/> Returned</span></div><div className="mcp-result-label"><span>Tool result · JSON excerpt</span><span>text content</span></div><pre className="mcp-result-code">{`[\n  {\n    "name": "Convergence Point",\n    "slug": "convergence-point",\n    "version": "1.0.0",\n    "description": "When sub-agents disagree, users need to see convergence mechanics: what was adopted, what was flagged as impasse, and why, not a opaque final string.",\n    "category": "Legibility",\n    "backingStrength": "Moderate",\n    "evidence_count": 1\n  }\n]`}</pre><div className="tool-event-foot"><Check size={12}/> The MCP returns pattern data. Codex uses it to adapt your project UI.</div></div>
    <div className="pattern-reasoning"><div><b>Why it fits</b><span>Three specialist agents contribute separate evidence toward one shared response, while unresolved disagreement stays reviewable.</span></div><div><b>What I’d adapt</b><span>Use your existing response intent and Cloud Control visual language, then add the convergence timeline and human decision point.</span></div></div>
    <p>{integrationChoice === "deferred" ? "No project changes have been made. I can integrate it whenever you’re ready." : integrationChoice === "integrating" ? "I’m adapting the response flow to your existing dashboard now." : "Would you like me to integrate this pattern into the Cloud Control prototype?"}</p>
  </>;
  if (stage === 3) return <>
    <p>I’ve integrated the library’s Convergence Point into the existing autonomous response preview. The pattern keeps specialist findings distinct and makes unresolved evidence visible in the team’s decision flow.</p>
    <div className="tool-event"><div className="tool-event-head"><span className="tool-square"><Code2 size={13}/></span><b>Integrated the library pattern</b><span className="tool-complete"><Check size={12}/> Changes ready</span></div><div className="change-summary"><span><FileCode2 size={13}/> McpStory.tsx <i>updated</i></span><span><FileCode2 size={13}/> mcp-story.css <i>updated</i></span></div><div className="diff-preview"><div className="diff-title"><span>McpStory.tsx</span><span>+ pattern <i>adapted</i></span></div><code><b>+</b> import &#123; ConvergencePoint &#125; from "@/components/patterns/ConvergencePoint";<br/><b>+</b> &lt;ConvergencePoint compact live=&#123;&#123;<br/><b>+</b> &nbsp; title: "Cloud Control · Autonomous response",<br/><b>+</b> &nbsp; workspace: securityAgentEvidence<br/><b>+</b> &#125;&#125; /&gt;</code></div><div className="tool-event-foot"><Check size={12}/> Reused the library component and supplied the project’s intent, agents, and evidence.</div></div>
    <div className="validation-row"><Check size={13}/> Updated prototype preview <span>·</span> <Check size={13}/> Mobile layout included <span>·</span> <Check size={13}/> Review remains with the team</div>
  </>;
  return <>
    <p>{adopted ? "The response is adopted in Cloud Control. The decision and supporting evidence remain visible to the team." : keptOpen ? "The disagreement remains open in Cloud Control. The team can add route coverage evidence before deciding." : "The approved changes are ready to review. The Cloud Control preview now shows the agents’ evidence, their points of agreement, and the decision the team still needs to make."}</p>
    <p>Review the preview, then choose whether to adopt the response or keep the disagreement open.</p>
  </>;
}

function IntegratedPreview({ stage, integrationChoice, adopted, keptOpen, onAdopt, onKeepOpen }: { stage: Stage; integrationChoice: "pending" | "integrating" | "approved" | "deferred"; adopted: boolean; keptOpen: boolean; onAdopt: () => void; onKeepOpen: () => void }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const integrated = stage >= 3;
  const integrating = integrationChoice === "integrating";
  const live = {
    title: "Cloud Control · Autonomous response",
    workspace: {
      disagreement: "Reduce exploit exposure while preserving service continuity",
      positions: [
        { agent: "Vulnerability Analyst", stance: "Patch is available; validate affected package scope", evidence: ["Vendor advisory", "SBOM identifies exposed package"] },
        { agent: "Exposure Assessor", stance: "Reachability remains uncertain behind a compensating control", evidence: ["Runtime graph", "Route coverage needs validation"] },
        { agent: "Change Planner", stance: "Containment depends on the service owner's change window", evidence: ["Change window", "Service owner confirmation"] },
      ],
      convergencePoints: [
        { label: "Confirm affected package and route coverage", checked: false },
        { label: "Preserve service continuity during mitigation", checked: true },
        { label: "Agree on containment after owner review", checked: false },
      ],
      decision: adopted ? "Contain after owner confirmation" : keptOpen ? "Open · waiting for route coverage evidence" : "Review needed · exposure is not settled",
    },
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || stage === 0) return;

    const targetSelector = stage === 1 || stage === 2
      ? ".activity-overload"
        : stage === 3
          ? ".integrated-activity"
          : ".dashboard-decision-controls";
    const target = viewport.querySelector<HTMLElement>(targetSelector);
    if (!target) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const viewportRect = viewport.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const currentTop = viewport.scrollTop;
    let nextTop = currentTop + targetRect.top - viewportRect.top;
    if (stage === 3) nextTop -= Math.max(0, (viewport.clientHeight - targetRect.height) / 2);
    if (stage === 4) nextTop += targetRect.height - viewport.clientHeight + 24;
    viewport.scrollTo({ top: Math.max(0, nextTop - 12), behavior: reduceMotion ? "auto" : "smooth" });
  }, [stage]);

  return <aside className="integration-pane">
    <div className="preview-toolbar"><div><span className="preview-live-dot"/> <b>{integrated ? "Updated project preview" : "Project preview"}</b><span>/</span><span>cloud-control · Autonomous response</span></div><div><button aria-label="Back"><ChevronLeft size={13}/></button><button aria-label="Forward"><ChevronRight size={13}/></button><button aria-label="Preview options"><Gauge size={13}/></button><button aria-label="More options"><MoreHorizontal size={14}/></button></div></div>
    <div className="preview-viewport" ref={viewportRef}><div className="product-app" data-story-stage={stage}>
      <header className="product-nav"><div className="product-brand"><b>Cloud Control</b><span>APJ Production</span></div><nav><span>Overview</span><span>Infrastructure</span><span className="selected">Security</span></nav><span className="product-user">MK</span></header>
      <div className="product-content"><div className="product-breadcrumb">Security operations <span>/</span> Autonomous response</div><div className="product-heading"><div><h2>Autonomous response</h2><p>Review agent findings and guide the response.</p></div><span className={`product-status ${integrating ? "is-integrating" : ""}`}><i/>{integrated ? adopted ? "Response adopted" : keptOpen ? "Review remains open" : "Review needed" : integrating ? "Updating preview" : "3 agents reporting"}</span></div>
        <section className="dashboard-overview" aria-label="Security operations overview">
          <div className="overview-metric"><span>Critical findings</span><b><ShieldAlert size={14}/> 03</b><small>1 reachable · 2 under review</small></div>
          <div className="overview-metric"><span>Affected workloads</span><b>08</b><small>Across 3 production services</small></div>
          <div className="overview-metric"><span>Next change window</span><b>22:00 <small>UTC</small></b><small>Owner confirmation pending</small></div>
        </section>
        <section className="service-context" aria-label="Affected production service">
          <div className="service-context-heading"><div><span className="service-icon"><Activity size={14}/></span><div><b>payments-api</b><small>Production workload · APJ region</small></div></div><span className="service-health"><i/> Operational</span></div>
          <div className="service-facts"><span><small>EXPOSURE</small><b>openssl 3.0.13</b></span><span><small>ROUTE COVERAGE</small><b>78% <em>Needs validation</em></b></span><span><small>SERVICE OWNER</small><b>Payments Platform</b></span><span><small>CHANGE WINDOW</small><b>22:00–22:30 UTC</b></span></div>
          <div className="service-evidence"><span><Check size={11}/> Vendor advisory matched</span><span><Check size={11}/> SBOM package confirmed</span><span className="evidence-pending"><Activity size={11}/> Runtime reachability under review</span></div>
        </section>
        {!integrated ? (
          <div className="baseline-response">
            <section className="response-intent"><span>RESPONSE INTENT</span><b>Reduce exploit exposure while preserving service continuity.</b><small>Shared by Security, Cloud, and AI operations</small></section>
            <div className="baseline-grid">
              <section className="activity-overload">
                <div className="baseline-card-heading"><b>Agent activity</b><span className="activity-volume">1,284 exchanges</span></div>
                <div className="activity-noise-note"><Activity size={11}/> Key decisions are buried in the event stream</div>
                <div className="activity-overload-feed" aria-label="Recent agent exchanges">
                  {recentAgentExchanges.map((event, index) => <div className="activity-event" key={`${event.time}-${index}`}><i className={`agent-icon ${event.color}`}>{event.agent[0]}</i><span><b>{event.agent}</b><small>{event.message}</small></span><time>{event.time}</time></div>)}
                </div>
                <div className="activity-feed-footer">Showing 7 of 1,284 events <span>Scroll to find the decision</span></div>
              </section>
              <section className="response-summary"><div className="baseline-card-heading"><b>Response summary</b><span>Draft</span></div><div className="summary-placeholder"><div className="summary-icon"><Shield size={18}/></div><b>Review findings to shape a response</b><p>Agent evidence and the next decision will appear here.</p></div><button className="disabled-response">Review response</button></section>
            </div>
            <div className="baseline-footnote"><Shield size={13}/> Changes require review by your operations team.</div>
          </div>
        ) : (
          <div className="actual-pattern"><div className="integrated-activity"><div className="integrated-activity-meta"><span>1,284 exchanges</span><span>3 agents</span></div><ConvergencePoint compact live={live} timelineTitle="Agent activity"/></div><div className="dashboard-decision-controls"><div><b>Team decision</b><span>{adopted ? "Response adopted" : keptOpen ? "Disagreement remains open" : "Review the evidence before deciding"}</span></div><button className={keptOpen ? "decision-selected" : ""} onClick={onKeepOpen}>{keptOpen ? <><Check size={12}/> Kept open</> : "Keep disagreement open"}</button><button className={adopted ? "decision-adopted" : ""} onClick={onAdopt}>{adopted ? <><Check size={12}/> Response adopted</> : "Adopt response"}</button></div></div>
        )}
      </div>
      <div className="product-footer"><span><i/> {integrated ? "Preview updated from project files" : "Live project preview"}</span><span>cloud-control <GitBranch size={12}/> main</span></div>
      {integrating && <div className="integration-loading-overlay" role="status" aria-live="polite"><div className="integration-loading-card"><span className="integration-loading-icon"><LoaderCircle size={19}/></span><b>Updating response flow</b><p>Bringing the three agent findings together for team review.</p><div className="integration-loading-bar"><i/></div><small>payments-api <span>·</span> APJ Production</small></div></div>}
    </div></div>
    <div className="preview-footer"><span><span className="preview-live-dot"/> Preview synchronized</span><span><Command size={12}/> cloud-control</span><button aria-label="Preview panel"><PanelRight size={13}/></button></div>
  </aside>;
}
