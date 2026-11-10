"use client";

import { useState } from "react";

const affectedWork = [
  {
    id: "promotion",
    number: "01",
    type: "Decision",
    title: "Approve weekend promotion",
    agent: "Sales agent",
    relationship: "Uses stock count directly",
    summary: "Offer 100 Trail Bottles at a discount",
    explanation: "This decision uses the reported stock count directly.",
    path: ["Reported stock: 120 units", "Promotion approval"],
    consequence: "Verify the stock count before approving the 100-unit offer.",
  },
  {
    id: "allocation",
    number: "02",
    type: "Decision",
    title: "Allocate 100 units",
    agent: "Fulfillment agent",
    relationship: "Uses stock count directly",
    summary: "Reserve stock for expected weekend orders",
    explanation: "This decision uses the reported stock count directly.",
    path: ["Reported stock: 120 units", "100-unit allocation"],
    consequence: "Reconcile the count before reserving 100 units.",
  },
  {
    id: "marketing",
    number: "03",
    type: "Artifact",
    title: "Launch email draft",
    agent: "Marketing agent",
    relationship: "Via promotion approval",
    summary: "Announces the weekend offer to customers",
    explanation: "This draft follows the Sales agent's promotion decision, which used the disputed stock count.",
    path: ["Reported stock: 120 units", "Promotion approval", "Launch email draft"],
    consequence: "Hold the email until the promotion is reviewed against the corrected count.",
  },
] as const;

type WorkId = (typeof affectedWork)[number]["id"];
type WorkItem = (typeof affectedWork)[number];

function DependencyDetail({ selected, inline = false }: { selected: WorkItem; inline?: boolean }) {
  return (
    <aside
      className={`v2-lineage__detail${inline ? " v2-lineage__detail--inline" : " v2-lineage__detail--side"}`}
      id={inline ? "v2-lineage-path-inline" : "v2-lineage-path"}
      aria-live="polite"
      aria-label={`Dependency path for ${selected.title}`}
    >
      <span className="v2-lineage__label">Dependency path</span>
      <h4>{selected.title}</h4>
      <p className="v2-lineage__detail-intro">{selected.explanation}</p>
      <ol className="v2-lineage__path">
        {selected.path.map((step, index) => (
          <li key={step}>
            <span className="v2-lineage__path-number">{index + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="v2-lineage__consequence">
        <span className="v2-lineage__label">Review before acting</span>
        <p>{selected.consequence}</p>
      </div>
    </aside>
  );
}

export function LineageViewPreview() {
  const [selectedId, setSelectedId] = useState<WorkId>("marketing");
  const selected = affectedWork.find((item) => item.id === selectedId)!;

  return (
    <section className="v2-lineage" aria-labelledby="v2-lineage-title">
      <div className="v2-lineage__shell">
        <aside className="v2-lineage__sidebar" aria-label="Sale workspace">
          <div className="v2-lineage__workspace-name">Sale workspace</div>
          <strong>SALE-104</strong>
          <span>Trail Bottle weekend sale</span>
          <div className="v2-lineage__current">Impact review</div>
        </aside>

        <div className="v2-lineage__main">
          <header className="v2-lineage__header">
            <p className="v2-lineage__eyebrow">SALE-104 / Impact review · assembled by Lineage agent</p>
            <h3 id="v2-lineage-title">Where this stock count is used</h3>
            <p>Trace sale decisions and drafts that rely on the disputed inventory count.</p>
          </header>

          <section className="v2-lineage__source" aria-labelledby="v2-lineage-source-title">
            <div className="v2-lineage__source-main">
              <span className="v2-lineage__label">Source count</span>
              <h4 id="v2-lineage-source-title">Trail Bottle available stock</h4>
              <p>Inventory agent · last verified 09:40</p>
            </div>
            <span className="v2-lineage__flag">Under dispute</span>
            <div className="v2-lineage__rationale">
              <div>
                <span className="v2-lineage__label">Reported count</span>
                <p>120 units available for the sale.</p>
              </div>
              <div>
                <span className="v2-lineage__label">Why it is disputed</span>
                <p>A warehouse recount at 10:15 found only 12 saleable units. No stock moved since the 09:40 report.</p>
              </div>
            </div>
          </section>

          <div className="v2-lineage__summary" aria-label="Impact summary">
            <strong>3 affected items</strong>
            <span>2 decisions · 1 draft · 3 teams</span>
          </div>

          <div className="v2-lineage__review">
            <section className="v2-lineage__work" aria-labelledby="v2-lineage-work-title">
              <div className="v2-lineage__section-head">
                <h4 id="v2-lineage-work-title">Affected work</h4>
                <span>Select an item to trace its reliance</span>
              </div>
              <div className="v2-lineage__work-list">
                {affectedWork.map((item) => (
                  <div className="v2-lineage__work-entry" key={item.id}>
                    <button
                      className="v2-lineage__work-item"
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      aria-pressed={selectedId === item.id}
                      aria-controls="v2-lineage-path v2-lineage-path-inline"
                    >
                      <span className="v2-lineage__work-number">{item.number}</span>
                      <span className="v2-lineage__work-content">
                        <span className="v2-lineage__work-meta">{item.type} · {item.agent}</span>
                        <strong>{item.title}</strong>
                        <span className="v2-lineage__work-summary">{item.summary}</span>
                      </span>
                      <span className="v2-lineage__work-relation">{item.relationship}<span aria-hidden="true">›</span></span>
                    </button>
                    {selectedId === item.id ? <DependencyDetail selected={selected} inline /> : null}
                  </div>
                ))}
              </div>
            </section>

            <DependencyDetail selected={selected} />
          </div>
        </div>
      </div>
    </section>
  );
}
