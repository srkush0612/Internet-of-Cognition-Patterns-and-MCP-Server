import Link from "next/link";
import styles from "./IntegrationDemo.module.css";

type DemoVersion = "v1" | "v2";

const examples = [
  {
    id: "divergence",
    eyebrow: "L9 · semantic divergence",
    title: "A shared word means two different things",
    intro:
      "Two agents disagree about whether a service is healthy. L9 is responsible for detecting the mismatch and coordinating the agents; HAX gives the operator a clear place to inspect and correct the assumptions.",
    steps: [
      {
        owner: "IoC / L9",
        title: "Detect the mismatch",
        body:
          "ACCORD detects that “healthy” has two meanings in this task: Agent A means error rate below 1%; Agent B means every probe passes.",
        state: "Detection example",
      },
      {
        owner: "Proposed handoff → HAX",
        title: "Open Assumption Surface",
        body:
          "Show each agent’s context, assumption, and interpretation side by side. The operator can correct the assumption; this pattern does not ask them to choose an answer.",
        state: "Human-readable signal",
      },
      {
        owner: "Operator",
        title: "Clarify the term",
        body:
          "The operator corrects Agent A’s assumption: release health requires both error rate below 1% and all probes passing.",
        state: "Example response",
      },
      {
        owner: "L9 continues · proposed return path",
        title: "Recheck, then coordinate",
        body:
          "The interpretations that depended on the corrected assumption are marked stale. Agents can re-evaluate; this demo does not send the correction to L9 or restart its protocol.",
        state: "Not connected",
      },
    ],
    scene: {
      label: "What the operator sees",
      left: {
        name: "Agent A",
        context: "Metrics: error rate 0.6%",
        assumption: "healthy = error rate below 1%",
        resultLabel: "Interpretation",
        conclusion: "Service is healthy",
      },
      right: {
        name: "Agent B",
        context: "Probe: dependency check failed",
        assumption: "healthy = every probe passes",
        resultLabel: "Interpretation",
        conclusion: "Service is not healthy",
      },
      response: "Operator corrects the assumption: release health requires both conditions to pass.",
    },
    pattern: "assumption-surface",
    patternName: "Assumption Surface",
    behaviorSpec:
      "When two agents reach different answers, and before anyone decides which to adopt, the agent explains to the operator in a multi-agent system with one person in the loop, through a shared UI, and expects them to correct a wrong assumption, after which the interpretation resting on it is marked stale rather than silently rewritten.",
    specSlots: [
      ["Trigger", "Two agents reach different answers; before anyone chooses one."],
      ["Mode", "Explain: show the reasons and evidence behind each conclusion."],
      ["Audience", "The operator."],
      ["Coordination level", "L3 · multi-agent system, one person in the loop."],
      ["Channel", "A shared UI."],
      ["Expected response", "Correct a wrong assumption."],
    ],
    agentContract: [
      "Compare each agent’s context, assumption, and interpretation.",
      "Make the assumption the editable layer; do not ask the operator to approve either answer here.",
      "After a correction, mark the dependent interpretation stale instead of silently rewriting it.",
    ],
  },
  {
    id: "impasse",
    eyebrow: "L9 · CONCORD outcome",
    title: "Agents reach an impasse",
    intro:
      "A multi-agent coordination run cannot adopt an answer. CONCORD owns the agreement process; Convergence Point makes the competing evidence and the unresolved state reviewable by a person.",
    steps: [
      {
        owner: "IoC / L9 coordination",
        title: "Attempt agreement",
        body:
          "Agents compare evidence about a failed canary. Their claims remain split between a bad release and a dependency outage.",
        state: "Coordination example",
      },
      {
        owner: "IoC outcome",
        title: "Record an impasse",
        body:
          "The CONCORD run ends as abort / rejected instead of converged. The protocol outcome is the signal; HAX does not compute consensus.",
        state: "Protocol state",
      },
      {
        owner: "Proposed handoff → HAX",
        title: "Open Convergence Point",
        body:
          "Show each position and its evidence. If an answer is adopted, the operator can accept or reopen it; if the agents are at impasse, the operator can settle it.",
        state: "Human-readable signal",
      },
      {
        owner: "Mycelium / L9 · open return path",
        title: "Continue from the response",
        body:
          "A real integration needs an agreed event to return the operator’s response to coordination and link it to the episode. This demo only illustrates that seam.",
        state: "Not connected",
      },
    ],
    scene: {
      label: "What the operator sees",
      left: {
        name: "Agent A · release",
        context: "Canary errors started after build 4f2a",
        assumption: "The new release caused the outage",
        resultLabel: "Answer",
        conclusion: "Roll back build 4f2a",
      },
      right: {
        name: "Agent B · dependency",
        context: "The payment dependency timed out first",
        assumption: "The outage is external to the release",
        resultLabel: "Answer",
        conclusion: "Hold rollback; inspect dependency",
      },
      response: "Operator settles the impasse: hold rollout and collect dependency traces before deciding.",
    },
    pattern: "convergence-point",
    patternName: "Convergence Point",
    behaviorSpec:
      "When sub-agents reach conflicting answers, the agent resolves with its peer agents and the operator in a multi-agent system with one person in the loop, through a shared record, and expects the operator to review the adopted answer or settle an impasse.",
    specSlots: [
      ["Trigger", "Sub-agents disagree, an answer is adopted, or an impasse is escalated."],
      ["Mode", "Resolve (with Explain as a supporting mode)."],
      ["Audience", "Peer agents and the operator."],
      ["Coordination level", "L3 · multi-agent system, one person in the loop."],
      ["Channel", "A shared record."],
      ["Expected response", "Review the adopted answer or settle an impasse."],
    ],
    agentContract: [
      "Surface competing answers and the evidence behind each; attach reasoning to any adopted answer.",
      "Report an impasse when no answer can be adopted; do not present the UI as if consensus was reached.",
      "Let the operator accept or reopen an adopted answer, or settle the impasse. A follow-up L9 event link remains a proposed integration seam.",
    ],
  },
];

function PatternLink({ version, pattern, children }: { version: DemoVersion; pattern: string; children: React.ReactNode }) {
  const href = version === "v1" ? `/patterns/${pattern}` : `/v2/patterns/${pattern}`;
  return <Link className={styles.patternLink} href={href}>{children}</Link>;
}

export function IntegrationDemo({ version }: { version: DemoVersion }) {
  const otherVersion = version === "v1" ? "v2" : "v1";
  return (
    <main className={styles.page} data-version={version}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">HAX versions</Link>
          <span aria-hidden="true">/</span>
          <span>IoC integration demo</span>
        </nav>

        <header className={styles.hero}>
          <div className={styles.heroTop}>
            <span className={styles.version}>{version}</span>
            <span className={styles.kicker}>Illustrative demo · no live runtime connection</span>
          </div>
          <h1>How IoC and L9 could use HAX</h1>
          <p>
            IoC is the broader system. L9 is its semantic-coordination protocol
            layer: ACCORD helps agents share intent, and CONCORD helps them reach
            agreement. In these scenes, an L9 event is the trigger; a HAX pattern
            shows the human interaction that could follow. The handoff is
            simulated, not wired to IoC.
          </p>
          <div className={styles.responsibility}>
            <div><strong>IoC</strong><span>The wider ecosystem: fabric, cognition engines, coordination applications, traces, and findings.</span></div>
            <div><strong>L9</strong><span>Semantic coordination protocols. ACCORD surfaces intent mismatches; CONCORD works toward agreement.</span></div>
            <div><strong>HAX</strong><span>Shows the relevant context through a named interaction pattern.</span></div>
            <div><strong>Open seam</strong><span>A standard route for a human response back to L9 / Mycelium is not established in these materials.</span></div>
          </div>
          <div className={styles.versionNav} aria-label="Demo versions">
            <span>View the same demo in:</span>
            <Link href={`/ioc-demo/${version}`} aria-current="page">{version}</Link>
            <Link href={`/ioc-demo/${otherVersion}`}>{otherVersion}</Link>
          </div>
        </header>

        {examples.map((example, index) => (
          <section className={styles.example} id={example.id} key={example.id} aria-labelledby={`${example.id}-title`}>
            <header className={styles.exampleHead}>
              <div>
                <p className={styles.eyebrow}>{example.eyebrow}</p>
                <h2 id={`${example.id}-title`}>{index + 1}. {example.title}</h2>
                <p className={styles.intro}>{example.intro}</p>
              </div>
              <PatternLink version={version} pattern={example.pattern}>
                Open {example.patternName} page <span aria-hidden="true">↗</span>
              </PatternLink>
            </header>

            <div className={styles.flow} aria-label={`${example.patternName} integration flow`}>
              {example.steps.map((step, stepIndex) => (
                <article className={styles.flowStep} key={step.title}>
                  <div className={styles.flowMeta}>
                    <span className={styles.stepNumber}>{String(stepIndex + 1).padStart(2, "0")}</span>
                    <span>{step.owner}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                  <span className={styles.state}>{step.state}</span>
                </article>
              ))}
            </div>

            <section className={styles.contract} aria-labelledby={`${example.id}-contract`}>
              <div className={styles.contractHead}>
                <p className={styles.eyebrow}>HAX behavior contract · catalog spec</p>
                <h3 id={`${example.id}-contract`}>What the agent is expected to do</h3>
                <p>A HAX pattern defines the interaction behavior. The interface below is one way to present it; it is not the pattern itself.</p>
              </div>
              <blockquote className={styles.spec}>{example.behaviorSpec}</blockquote>
              <dl className={styles.specSlots}>
                {example.specSlots.map(([label, value]) => (
                  <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                ))}
              </dl>
              <div className={styles.agentContract}>
                <h4>Agent obligations in this scenario</h4>
                <ol>
                  {example.agentContract.map((item) => <li key={item}>{item}</li>)}
                </ol>
              </div>
            </section>

            <div className={styles.scene}>
              <div className={styles.sceneHead}>
                <div><span className={styles.eyebrow}>HAX pattern preview</span><h3>{example.scene.label}</h3></div>
                <span className={styles.simulated}>Scenario data · illustrative</span>
              </div>
              <div className={styles.agents}>
                {[example.scene.left, example.scene.right].map((agent) => (
                  <article className={styles.agent} key={agent.name}>
                    <h4>{agent.name}</h4>
                    <dl>
                      <div><dt>Context</dt><dd>{agent.context}</dd></div>
                      <div><dt>Assumption</dt><dd>{agent.assumption}</dd></div>
                      <div><dt>{agent.resultLabel}</dt><dd>{agent.conclusion}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
              <p className={styles.operatorResponse}><strong>Person’s response</strong>{example.scene.response}</p>
            </div>
          </section>
        ))}

        <footer className={styles.footer}>
          <p><strong>Demo boundary:</strong> the detections and outcomes are sample data. HAX does not perform L9 detection, run CONCORD, change consensus, or write to the Cognition Store in this demo.</p>
          <Link href="/">Back to v1 / v2</Link>
        </footer>
      </div>
    </main>
  );
}
