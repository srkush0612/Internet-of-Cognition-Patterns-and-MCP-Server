"use client";

import { useState } from "react";
import {
  ArrowLeft, ArrowRight, ArrowUp, BookOpen, Check, ChevronDown, FileCode2, FileText,
  Layers3, MoreHorizontal,
  Mic, Plus, Search, Settings2, Sparkles, Upload,
} from "lucide-react";
import { ConvergencePoint } from "@/components/patterns/ConvergencePoint";
import { StudioWorkspace } from "@/components/v2/StudioWorkspace";

type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const stageNames = ["Choose a moment", "Choose an agent move", "Choose a pattern", "Export pattern files", "Open Figma from Dock", "Open Figma Agent", "Attach both files", "Map to design system", "Integrated UI"];

const FIGMA_PATTERN_LIVE = {
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

export function StudioToFigmaStory() {
  const [stage, setStage] = useState<Stage>(0);
  const [files, setFiles] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);

  function advance(next: Stage) {
    setStage(next);
  }

  return <main className="s2f-shell" data-stage={stage}>
    <div className="s2f-workspace">
      <section className="s2f-main">
        <div className="s2f-app-viewport" data-focus={stage}>
          {stage < 4 ? <div className="v2 s2f-v2-context"><StudioWorkspace walkthroughStep={stage} onWalkthroughStep={(step) => advance(step as Stage)} onWalkthroughExport={(kind) => { const file = kind === "svg" ? "convergence-point-diagram.svg" : "convergence-point.md"; setFiles((current) => current.includes(file) ? current : [...current, file]); }} /></div> : stage === 4 ? <FigmaDockTransition onOpenFigma={() => advance(5)} /> : <FigmaMock stage={stage} files={attachments} onAddFile={(name) => setAttachments((current) => current.includes(name) ? current : [...current, name])} onSend={() => advance(7)} onOpenAgent={() => advance(6)} onIntegrate={() => advance(8)} />}
        </div>
        {stage === 3 && files.length >= 2 && <button className="s2f-continue-figma" onClick={() => advance(4)}>Continue to desktop <ArrowRight size={14}/></button>}
      </section>
    </div>
    <nav className="s2f-demo-progress" aria-label="Walkthrough navigation">
      <button aria-label="Previous highlight" onClick={() => advance(stage === 0 ? 8 : (stage - 1) as Stage)}><ArrowLeft size={13}/></button>
      <button aria-label="Next highlight" onClick={() => advance(stage === 8 ? 0 : (stage + 1) as Stage)}><ArrowRight size={13}/></button>
      <div className="s2f-demo-dots">{stageNames.map((label, i) => <button key={label} aria-label={`Show ${label}`} title={label} className={i === stage ? "current" : ""} onClick={() => advance(i as Stage)}/>)}</div>
      <span>{String(stage + 1).padStart(2, "0")} / {String(stageNames.length).padStart(2, "0")}</span>
    </nav>
  </main>;
}

function FigmaDockTransition({ onOpenFigma }: { onOpenFigma: () => void }) {
  return <section className="s2f-desktop" aria-label="Desktop">
    <div className="s2f-desktop-menu"><span className="s2f-desktop-mark">✳</span><b>Finder</b><span>File</span><span>Edit</span><span>View</span><span>Go</span><span>Window</span><span>Help</span><span className="s2f-desktop-clock">Thu 2:42 PM</span></div>
    <nav className="s2f-dock" aria-label="macOS Dock">
      <div className="s2f-dock-icon s2f-dock-finder" aria-label="Finder"><span>⌘</span></div>
      <div className="s2f-dock-icon s2f-dock-browser" aria-label="Browser"><span>◉</span></div>
      <span className="s2f-dock-divider" aria-hidden="true"/>
      <button className="s2f-dock-icon s2f-dock-figma" onClick={onOpenFigma} aria-label="Open Figma from the Dock" title="Figma"><i/><i/><i/><i/><i/><small>Figma</small></button>
      <div className="s2f-dock-icon s2f-dock-terminal" aria-label="Terminal"><span>›_</span></div>
      <span className="s2f-dock-divider" aria-hidden="true"/>
      <div className="s2f-dock-icon s2f-dock-trash" aria-label="Trash"><span>▤</span></div>
    </nav>
  </section>;
}

function FigmaMock({ stage, files, onAddFile, onSend, onOpenAgent, onIntegrate }: { stage: Stage; files: string[]; onAddFile: (name: string) => void; onSend: () => void; onOpenAgent: () => void; onIntegrate: () => void }) {
  return <div className="s2f-app figma-app" data-agent-open={stage >= 5} data-story-stage={stage}>
    <header className="figma-toolbar"><div className="figma-symbol"><i/><i/><i/><i/><i/></div><div className="figma-menu"><button>File</button><button>Edit</button><button>View</button><button>Object</button><button>Plugins</button></div><span className="figma-file-title">Cloud Control <ChevronDown size={12}/></span><div className="figma-top-right"><span className="figma-avatar">MK</span><button>Share</button><button className="present-btn">Present</button></div></header>
    <div className="figma-workarea"><aside className="figma-left"><div className="figma-left-tabs"><b>Layers</b><span>Assets</span><Search size={14}/></div><div className="figma-page-label">Pages <Plus size={13}/></div><div className="figma-page">⌄ &nbsp; Product</div><div className="figma-layer selected-layer"><span>▧</span> Security overview</div><div className="figma-layer"><span>▦</span> Autonomous response</div><div className="figma-layer" data-highlight={stage >= 7}><span>▧</span>{stage >= 8 ? "Convergence Point" : "Agent activity"}</div><div className="figma-layer"><span>▤</span> Response summary</div><div className="figma-layer"><span>▧</span> Navigation</div><div className="figma-left-bottom"><span>Design system</span><b>Cloud UI · v2.4</b></div></aside>
      <section className="figma-canvas"><div className="canvas-crumb"><span>Product</span> / Security overview <span className="zoom-chip">82%</span></div><div className="figma-frame"><div className="cloud-nav"><div className="cloud-logo"><span>◆</span> CLOUD CONTROL</div><div>Overview &nbsp;&nbsp; Infrastructure &nbsp;&nbsp; <b>Security</b></div><span className="cloud-user">MK</span></div><div className="cloud-content"><div className="cloud-breadcrumb">Security operations&nbsp; / &nbsp;Autonomous response</div><div className="cloud-heading"><div><h2>Autonomous response</h2><p>Review agent findings and guide the response.</p></div><span className="cloud-status"><i/> 3 agents reporting</span></div><div className="cloud-metrics"><div><small>CRITICAL FINDINGS</small><b>03</b><span>1 reachable · 2 under review</span></div><div><small>AFFECTED WORKLOADS</small><b>08</b><span>Across 3 services</span></div><div><small>NEXT CHANGE WINDOW</small><b>22:00</b><span>Owner confirmation pending</span></div></div><div className="cloud-main-grid">{stage >= 8 ? <ConvergencePanel/> : <section className="cloud-agents cloud-activity-before"><div className="cloud-section-title"><b>Agent activity</b><span>1,284 exchanges</span></div><div className="cloud-activity-warning">⌁ &nbsp; Key decisions are buried in the event stream</div><AgentRow initials="V" name="Vulnerability Analyst" detail="Advisory matches openssl 3.0.13 in production." tone="blue" tag="14:02:18"/><AgentRow initials="E" name="Exposure Assessor" detail="Reachability still unconfirmed on 22% of routes." tone="purple" tag="14:02:19"/><AgentRow initials="C" name="Change Planner" detail="No owner-approved maintenance window found." tone="gold" tag="14:02:20"/><AgentRow initials="V" name="Vulnerability Analyst" detail="Patch path is available; impact check is pending." tone="blue" tag="14:02:21"/><div className="cloud-activity-footer"><span>Showing 7 of 1,284 events</span><span>Scroll to find the decision</span></div></section>}<section className="cloud-pattern"><div className="cloud-section-title"><b>Response summary</b><span>Draft</span></div><div className="response-placeholder"><span>◇</span><b>Review findings to shape a response</b><small>Evidence and the next decision will appear here.</small></div><button className="cloud-review-response">Review response</button></section></div><div className="cloud-foot"><span>◈ &nbsp; Changes require review by your operations team.</span><span>Cloud UI · v2.4</span></div></div></div>
      </section>
      <aside className="figma-properties"><div className="property-tabs"><b>Design</b><span>Prototype</span><MoreHorizontal size={14}/></div><div className="property-content"><span className="property-label">FRAME</span><b>Security overview</b><div className="dimension-row"><span>W</span><b>1440</b><span>H</span><b>900</b></div><div className="property-section"><div><b>Auto layout</b><span>Vertical</span></div><small>Gap&nbsp; 24&nbsp;&nbsp;&nbsp; Padding&nbsp; 32</small></div><div className="property-section"><div><b>Color styles</b><span>Tokens</span></div><small><i className="token-swatch brand"/> brand/600 &nbsp; #246BFD</small><small><i className="token-swatch surface"/> surface/default</small><small><i className="token-swatch text"/> text/primary</small></div><div className="property-section"><div><b>Components</b><span>Library</span></div><small>Card / elevated</small><small>Button / primary</small><small>Badge / warning</small></div><div className="property-section"><div><b>Effects</b><span>None</span></div></div></div></aside>
    </div>
    {stage >= 5 && <aside className="agent-panel">
      <nav className="agent-rail" aria-label="Figma tools"><div className="agent-rail-logo">F</div><button><FileText size={15}/><span>File</span></button><button className="agent-rail-active"><Sparkles size={15}/><span>Agents</span></button><button><Plus size={15}/><span>Assets</span></button><button><Layers3 size={15}/><span>Tools</span></button><button className="agent-rail-bottom"><Settings2 size={15}/><span>Variables</span></button></nav>
      <section className="agent-chat">
        <header className="agent-panel-head"><div className="agent-title"><ChevronDown size={13}/><span><b>Design next screen</b><small>Shared</small></span></div><div className="agent-head-actions"><span>AI</span><Plus size={15}/><MoreHorizontal size={15}/></div></header>
        <div className="agent-context"><span>Working in</span><b>Cloud Control · Security overview</b><small>Design system detected · Cloud UI v2.4</small></div>
        <div className="agent-scroll">
          {stage === 5 && <div className="agent-intro-prompt">Please add the Convergence Point interaction to Autonomous response. Use Cloud UI components and preserve the team's existing response actions.</div>}
          {stage === 5 && <div className="agent-open"><p>I’ve opened the product frame and detected Cloud UI v2.4. Attach the Studio exports with the controls below.</p></div>}
          {stage === 6 && <><div className="agent-user-bubble">Integrate Convergence Point into Autonomous response. Use the SVG as a visual reference, follow the behavior in the Markdown, and keep the team's decision controls.</div><div className="agent-attach-heading">Attach files</div><div className="agent-upload"><button onClick={() => onAddFile("convergence-point-diagram.svg")}><Upload size={15}/><b>convergence-point-diagram.svg</b><small>{files.includes("convergence-point-diagram.svg") ? "Attached" : "Add from Studio exports"}</small></button><button onClick={() => onAddFile("convergence-point.md")}><FileText size={15}/><b>convergence-point.md</b><small>{files.includes("convergence-point.md") ? "Attached" : "Add from Studio exports"}</small></button></div></>}
          {stage >= 7 && <><div className="agent-user-bubble">Integrate Convergence Point into Autonomous response. Preserve its behavior, use the SVG as a reference, and apply Cloud UI v2.4.</div><div className="agent-file-chips">{files.map((file) => <span key={file}>{file.endsWith("svg") ? <FileCode2 size={12}/> : <FileText size={12}/>} {file} <Check size={11}/></span>)}</div><div className="agent-worked">Worked for 4m 9s</div><div className="agent-result-card"><span className="agent-result-icon"><Check size={13}/></span><div><small>{stage >= 8 ? "INTEGRATED" : "READY TO APPLY"}</small><b>Convergence Point</b><span>{stage >= 8 ? "Integrated into Autonomous response" : "Mapped to Cloud UI · v2.4"}</span></div><ChevronDown size={13}/></div><div className="agent-answer"><p>{stage >= 8 ? <>I replaced the Agent activity timeline with Convergence Point and preserved all <b>1,284 exchanges</b> from the original screen.</> : <>I’m replacing the Agent activity timeline with Convergence Point and preserving all <b>1,284 exchanges</b>.</>}</p><p>The new UI groups shared evidence and open questions, then keeps the team’s response choices visible.</p><p>I used Cloud UI v2.4 typography, semantic colors, 8pt spacing, and the existing Card, Badge, and Button components.</p></div><div className="agent-feedback"><button aria-label="Helpful">♡</button><button aria-label="Not helpful">♧</button><span>＋</span><span>ⓘ</span></div></>}
        </div>
        {stage === 7 && <div className="mapping-list"><span>DESIGN SYSTEM MAPPING</span><div><Check size={12}/><span>Brand color</span><b>brand/600</b></div><div><Check size={12}/><span>Surfaces</span><b>surface/default</b></div><div><Check size={12}/><span>Spacing</span><b>Cloud UI · 8pt scale</b></div><div><Check size={12}/><span>Actions</span><b>Button / primary</b></div><small className="mapping-note">Ready to apply. Send to integrate.</small></div>}
        <div className="agent-compose"><span>{stage === 6 ? "Add a message or send the files" : stage === 7 ? "Apply Convergence Point to Autonomous response" : "Ask for changes"}</span><div><button aria-label="Add attachments" title="Add attachments" onClick={stage === 5 ? onOpenAgent : undefined}><Plus size={15}/></button><button aria-label="Resources" title="Resources"><BookOpen size={14}/></button><span/><Mic size={13}/><button className="agent-compose-send" aria-label={stage === 6 ? "Send files to Figma Agent" : stage === 7 ? "Apply design changes" : "Send message"} disabled={(stage === 6 && files.length < 2) || (stage !== 6 && stage !== 7)} onClick={stage === 6 ? onSend : stage === 7 ? onIntegrate : undefined}><ArrowUp size={13}/></button></div></div>
      </section>
    </aside>}
  </div>;
}

function ConvergencePanel() {
  return <section className="cloud-convergence"><div className="cloud-pattern-meta"><span>1,284 exchanges</span><span>3 agents</span></div><ConvergencePoint compact live={FIGMA_PATTERN_LIVE} timelineTitle="Agent activity"/><div className="cloud-pattern-actions"><button>Keep reviewing</button><button>Decide later</button><button>Choose response</button></div></section>;
}

function AgentRow({ initials, name, detail, tone, tag }: { initials: string; name: string; detail: string; tone: string; tag: string }) {
  return <div className="cloud-agent-row"><i className={`cloud-agent-avatar ${tone}`}>{initials}</i><span><b>{name}</b><small>{detail}</small></span><em>{tag}</em></div>;
}
