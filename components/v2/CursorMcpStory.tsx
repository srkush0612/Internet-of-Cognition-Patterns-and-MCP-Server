"use client";

import { useEffect, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDown, ArrowRight, Check, ChevronDown,
  ChevronRight, Circle, Code2, FileCode2, FileJson2, Folder, GitBranch,
  PanelRight, Play, Plus, Search, Settings2, Shield,
  Wrench, X,
} from "lucide-react";
import { ConvergencePoint } from "@/components/patterns/ConvergencePoint";

type Stage = 0 | 1 | 2 | 3 | 4;
type Choice = "pending" | "integrating" | "approved" | "deferred";

const prompt = "Find a pattern for when our security agents disagree, then integrate it into the Cloud Control response flow.";

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
    decision: "Review needed · exposure is not settled",
  },
};

export function CursorMcpStory() {
  const [stage, setStage] = useState<Stage>(0);
  const [choice, setChoice] = useState<Choice>("pending");
  const [adopted, setAdopted] = useState(false);
  const [keptOpen, setKeptOpen] = useState(false);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing || stage === 0 || stage === 2 || stage >= 4) return;
    const timer = window.setTimeout(() => setStage((s) => (s + 1) as Stage), 4600);
    return () => window.clearTimeout(timer);
  }, [playing, stage]);

  useEffect(() => {
    if (choice !== "integrating") return;
    const timer = window.setTimeout(() => {
      setChoice("approved");
      setStage(3);
      setPlaying(true);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [choice]);

  const advance = () => setStage((s) => (s >= 4 ? 4 : (s + 1) as Stage));
  const restart = () => { setStage(0); setChoice("pending"); setAdopted(false); setKeptOpen(false); setPlaying(true); };

  return <main className="cursor-mcp" data-stage={stage}>
    <header className="cur-topbar">
      <div className="cur-brand"><span className="cur-mark">◒</span><b>Cursor</b><span className="cur-divider"/><span>cloud-control</span><ChevronDown size={13}/></div>
      <div className="cur-top-center"><span>⌘</span> cloud-control <span className="cur-branch"><GitBranch size={12}/> main</span></div>
      <div className="cur-top-actions"><span className="cur-connected"><i/> MCP connected</span><button aria-label="Settings"><Settings2 size={15}/></button><button aria-label="Panel options"><PanelRight size={15}/></button></div>
    </header>
    <div className="cur-workbench">
      <nav className="cur-activity" aria-label="Cursor activity bar">
        <button className="active" aria-label="Explorer"><FilesIcon/></button><button aria-label="Search"><Search size={17}/></button><button aria-label="Source control"><GitBranch size={17}/></button><button aria-label="Extensions"><Plus size={17}/></button>
        <div className="cur-activity-bottom"><button aria-label="Settings"><Settings2 size={17}/></button><span className="cur-user">MK</span></div>
      </nav>
      <aside className="cur-explorer">
        <div className="cur-explorer-title"><span>EXPLORER</span><button aria-label="Explorer options">•••</button></div>
        <div className="cur-tree-root"><ChevronDown size={13}/><b>CLOUD-CONTROL</b><span>•••</span></div>
        <div className="cur-tree-folder"><ChevronDown size={13}/><Folder size={14}/> .cursor</div>
        <div className="cur-tree-file selected"><FileJson2 size={14}/> mcp.json <i className="file-dot"/></div>
        <div className="cur-tree-folder"><ChevronRight size={13}/><Folder size={14}/> src</div>
        <div className="cur-tree-folder"><ChevronRight size={13}/><Folder size={14}/> components</div>
        <div className="cur-tree-file"><Code2 size={14}/> package.json</div>
        <div className="cur-tree-file"><FileCode2 size={14}/> README.md</div>
        <div className="cur-explorer-note"><Shield size={13}/><span><b>Local credentials</b><small>Keep tokens out of source control.</small></span></div>
      </aside>
      <section className="cur-main">
        <div className="cur-tabs"><div className="cur-tab active"><FileJson2 size={13}/> mcp.json {stage > 0 && <i/>}<X size={12}/></div><span className="cur-tab-spacer"/><button aria-label="Editor options">•••</button></div>
        <div className="cur-editor" data-stage={stage}>
          <div className="cur-breadcrumb"><span>.cursor</span><ChevronRight size={12}/><span>mcp.json</span>{stage > 0 && <em><Check size={11}/> saved</em>}</div>
          <div className="cur-code-area"><div className="cur-line-numbers">{Array.from({length: 17},(_,i)=><span key={i}>{i+1}</span>)}</div>
            <pre className="cur-code"><code><span className="json-punc">&#123;</span>{"\n"}  <span className="json-key">"mcpServers"</span>: <span className="json-punc">&#123;</span>{"\n"}    <span className="json-key">"ioc-patterns"</span>: <span className="json-punc">&#123;</span>{"\n"}      <span className="json-key">"command"</span>: <span className="json-string">"node"</span>,{"\n"}      <span className="json-key">"args"</span>: [{"\n"}        <span className="json-string">"--conditions=react-server"</span>,{"\n"}        <span className="json-string">"--import"</span>, <span className="json-string">"tsx"</span>,{"\n"}        <span className="json-string">"./server/mcp-stdio.ts"</span>{"\n"}      ]{"\n"}    <span className="json-punc">&#125;</span>{"\n"}  <span className="json-punc">&#125;</span>{"\n"}<span className="json-punc">&#125;</span></code></pre>
            <div className="cur-config-callout"><span className="cur-callout-icon"><Shield size={14}/></span><div><b>Project MCP configuration</b><p>Cursor launches the local stdio server from this project and makes its pattern tools available to Agent.</p></div></div>
          </div>
          <div className="cur-editor-status"><span><GitBranch size={11}/> main*</span><span>JSON with Comments</span><span>UTF-8</span><span>Ln 6, Col 44</span></div>
        </div>
        <AgentPanel stage={stage} choice={choice} adopted={adopted} keptOpen={keptOpen} onApprove={()=>{setChoice("integrating");setPlaying(false)}} onDefer={()=>{setChoice("deferred");setPlaying(false)}} onContinue={advance}/>
      </section>
      <section className="cur-preview">
        <div className="cur-preview-head"><div><span className="cur-preview-dot"/><b>{stage >= 3 ? "Updated project preview" : "Project preview"}</b><span>·</span><small>localhost:3000 / security</small></div><div><button aria-label="Reload preview"><Play size={12}/></button><button aria-label="Preview options">•••</button></div></div>
        <div className="cur-preview-scroll"><ProductPreview stage={stage} adopted={adopted} keptOpen={keptOpen} onAdopt={()=>{setAdopted(true);setKeptOpen(false)}} onKeepOpen={()=>{setKeptOpen(true);setAdopted(false)}}/></div>
      </section>
    </div>
    <footer className="cur-footer"><div><span className="cur-footer-branch"><GitBranch size={11}/> main</span><span>0 errors</span><span>Cursor Agent · MCP tools available</span></div><div className="cur-walkthrough"><button onClick={()=>setStage((s)=>(s===0?4:(s-1) as Stage))} aria-label="Previous step"><ArrowDown className="cur-prev-arrow" size={12}/></button><span>{stage+1} / 5</span><button onClick={advance} aria-label="Next step"><ArrowDown size={12}/></button><button onClick={restart} aria-label="Restart walkthrough">Restart</button></div></footer>
  </main>;
}

function FilesIcon(){return <span className="cur-files-icon"><Folder size={15}/></span>}

function AgentPanel({stage,choice,adopted,keptOpen,onApprove,onDefer,onContinue}:{stage:Stage;choice:Choice;adopted:boolean;keptOpen:boolean;onApprove:()=>void;onDefer:()=>void;onContinue:()=>void}){
  return <aside className="cur-agent">
    <div className="cur-agent-tabs"><b><span>✳</span> Agent</b><span>⌕</span><span>•••</span></div>
    <div className="cur-agent-conversation">
      <div className="cur-agent-task"><span className="cur-user small">MK</span><p>{prompt}</p></div>
      {stage === 0 ? <div className="cur-agent-welcome"><b>Ready to work in this project</b><span>Configure the MCP server, then ask Cursor to use its tools.</span><div className="cur-mcp-ready"><i/><span>HAX Patterns MCP</span><em>CONFIGURED</em></div><button className="cur-start-button" onClick={onContinue}>Start walkthrough <ArrowRight size={13}/></button></div> : <div className="cur-agent-response">
        <div className="cur-agent-avatar">✳</div><div className="cur-response-body"><b>Cursor</b>
          {stage === 1 && <><p>I’ll use the HAX Patterns MCP to find an interaction that fits the disagreement in your security workflow.</p><div className="cur-tool-call"><div className="cur-tool-heading"><span><Wrench size={12}/></span><b>discover_patterns</b><i className="cur-tool-running"><Circle size={8}/> Running</i></div><small>Searching for patterns involving specialist agents and shared decisions…</small></div><div className="cur-agent-thinking"><span/><span/><span/> Using MCP server <b>ioc-patterns</b></div></>}
          {stage === 2 && <><p>The catalog recommends <b>Convergence Point</b>. It keeps each specialist's evidence visible and leaves the unresolved decision with your team.</p><div className="cur-result-card"><div className="cur-result-title"><span><Wrench size={12}/></span><b>discover_patterns</b><em><Check size={11}/> Complete</em></div><div className="cur-result-name">Convergence Point <small>Legibility · Moderate evidence</small></div><p>When specialist agents disagree, surface their evidence and the shared decision instead of hiding divergence in a final answer.</p><div className="cur-result-footer"><Check size={12}/> Returned by HAX Patterns MCP</div></div><div className="cur-fit"><b>Why it fits</b><span>Three agents have separate findings, but responders need one reviewable decision.</span></div><p>{choice === "deferred" ? "No project files were changed. You can integrate the pattern later." : "Want me to adapt this pattern to the existing Cloud Control response flow?"}</p>
            {choice === "integrating" ? <div className="cur-integrating"><span/><div><b>Adapting Convergence Point</b><small>Mapping agent findings into your existing response UI…</small><i><b/></i></div></div> : <div className="cur-approval"><button onClick={onDefer}>{choice === "deferred" ? "Not now · no changes" : "Not now"}</button><button className="cur-approve" onClick={onApprove}>{choice === "deferred" ? "Integrate pattern" : "Integrate pattern"}<ArrowRight size={12}/></button></div>}
          </>}
          {stage === 3 && <><p>Integrated Convergence Point into the response view. The pattern component now receives the project’s agent findings and current decision state.</p><div className="cur-diff-card"><div><Code2 size={13}/><b>Changes ready</b><em><Check size={11}/> 2 files</em></div><div className="cur-diff-file"><FileCode2 size={12}/> src/components/AgentResponse.tsx <span>M</span></div><pre><i>+ import &#123; ConvergencePoint &#125; from "@/components/patterns";</i>{"\n"}<i>+ &lt;ConvergencePoint live=&#123;agentEvidence&#125; /&gt;</i></pre><small><Shield size={11}/> Review generated changes before committing.</small></div><div className="cur-checks"><span><Check size={12}/> Existing response flow retained</span><span><Check size={12}/> Preview updated from project files</span></div></>}
          {stage === 4 && <><p>{adopted ? "The team adopted the response. Its supporting evidence stays visible in Cloud Control." : keptOpen ? "The disagreement remains open while the team gathers route coverage evidence." : "The integrated preview is ready. The team can review the agents’ evidence, then adopt the response or keep the disagreement open."}</p><p>Choose an outcome in the project preview to see the decision state update.</p><div className="cur-agent-complete"><Check size={13}/> MCP result integrated · changes ready for review</div></>}
          {stage < 4 && stage !== 2 && <button className="cur-continue" onClick={onContinue}>{stage === 1 ? "View matching pattern" : "Review integrated UI"}<ArrowRight size={12}/></button>}
        </div>
      </div>}
    </div>
    <div className="cur-agent-composer"><div>Ask a follow-up…</div><div><button aria-label="Add context"><Plus size={13}/></button><span><Wrench size={11}/> Agent <ChevronDown size={11}/></span><button className="cur-send" aria-label="Send"><ArrowDown size={13}/></button></div></div>
  </aside>
}

function ProductPreview({stage,adopted,keptOpen,onAdopt,onKeepOpen}:{stage:Stage;adopted:boolean;keptOpen:boolean;onAdopt:()=>void;onKeepOpen:()=>void}){
  const integrated=stage>=3;
  return <div className="cur-product" data-integrated={integrated}>
    <header className="cur-product-nav"><div><b>Cloud Control</b><span>APJ Production</span></div><nav><span>Overview</span><span>Infrastructure</span><b>Security</b></nav><span className="cur-product-user">MK</span></header>
    <div className="cur-product-content"><div className="cur-product-crumb">Security operations <span>/</span> Autonomous response</div><div className="cur-product-title"><div><h1>Autonomous response</h1><p>Review agent findings and guide the response.</p></div><span className={integrated ? "review" : "reporting"}><i/>{integrated ? adopted ? "Response adopted" : keptOpen ? "Review remains open" : "Review needed" : "3 agents reporting"}</span></div>
      <div className="cur-product-metrics"><div><small>CRITICAL FINDINGS</small><b>03</b><span>1 reachable · 2 under review</span></div><div><small>AFFECTED WORKLOADS</small><b>08</b><span>Across 3 production services</span></div><div><small>NEXT CHANGE WINDOW</small><b>22:00 <i>UTC</i></b><span>Owner confirmation pending</span></div></div>
      <section className="cur-service"><div className="cur-service-heading"><span className="cur-service-icon"><Activity size={14}/></span><div><b>payments-api</b><small>Production workload · APJ region</small></div><em><i/> Operational</em></div><div className="cur-service-facts"><span><small>EXPOSURE</small><b>openssl 3.0.13</b></span><span><small>ROUTE COVERAGE</small><b>78% <i>Needs validation</i></b></span><span><small>SERVICE OWNER</small><b>Payments Platform</b></span></div></section>
      {integrated ? <><div className="cur-pattern-intro"><span>CONVERGENCE POINT</span><b>Agent findings, together</b><small>Distinct evidence · visible divergence · team decision</small></div><div className="cur-convergence"><ConvergencePoint compact live={live} timelineTitle="Agent activity"/></div><div className="cur-decision"><div><b>Team decision</b><span>{adopted ? "Response adopted" : keptOpen ? "Disagreement remains open" : "Review the evidence before deciding"}</span></div><button className={keptOpen?"chosen-open":""} onClick={onKeepOpen}>{keptOpen?<><Check size={11}/> Kept open</>:"Keep open"}</button><button className={adopted?"chosen-adopt":""} onClick={onAdopt}>{adopted?<><Check size={11}/> Adopted</>:"Adopt response"}</button></div></> : <div className="cur-baseline"><div className="cur-baseline-title"><b>Agent activity</b><span>1,284 exchanges</span></div><div className="cur-noise"><AlertTriangle size={12}/> Important decisions are buried in the event stream.</div>{[["Vulnerability Analyst","Advisory matches openssl 3.0.13 in production."],["Exposure Assessor","Reachability remains unconfirmed on 22% of routes."],["Change Planner","No owner-approved maintenance window found."]].map(([name,desc],i)=><div className="cur-agent-event" key={name}><i className={`cur-agent-color color-${i}`}>{name[0]}</i><span><b>{name}</b><small>{desc}</small></span><time>14:02</time></div>)}<div className="cur-empty-summary"><b>Response summary</b><span>Review findings to shape a response.</span></div></div>}
    </div>
    <footer className="cur-product-footer"><span><i/> {integrated ? "Preview updated from project files" : "Live project preview"}</span><span>cloud-control <GitBranch size={11}/> main</span></footer>
  </div>
}
