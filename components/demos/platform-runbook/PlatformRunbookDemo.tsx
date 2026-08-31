"use client";

import { useState } from "react";
import { MemoryCommitmentReviewBody } from "@/components/patterns/MemoryCommitmentReview";
import { MOCK_BELIEFS } from "@/lib/memory-commitment-data";
import { StarIcon } from "@/components/patterns/icons";
import {
  PLATFORM_MEMORY_NAV,
  PLATFORM_RUNBOOK_SECTIONS,
  PLATFORM_SPACES,
} from "./platform-runbook-data";
import "./platform-runbook.css";

export function PlatformRunbookDemo({ embedded = false }: { embedded?: boolean }) {
  const [beliefs, setBeliefs] = useState(MOCK_BELIEFS);

  return (
    <div
      className={`platform-runbook${embedded ? " platform-runbook--embedded" : ""}`}
    >
      <div className="platform-runbook__shell">
        <aside className="platform-runbook__sidebar" aria-label="Workspace navigation">
          <div className="platform-runbook__nav-group">
            <p className="platform-runbook__nav-label">Spaces</p>
            <ul className="platform-runbook__nav-list">
              {PLATFORM_SPACES.map((space) => (
                <li key={space.id}>
                  <span
                    className={`platform-runbook__nav-item${
                      space.active ? " platform-runbook__nav-item--active" : ""
                    }`}
                  >
                    {space.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="platform-runbook__nav-group">
            <p className="platform-runbook__nav-label">Memory</p>
            <ul className="platform-runbook__nav-list">
              {PLATFORM_MEMORY_NAV.map((item) => (
                <li key={item.id}>
                  <span
                    className={`platform-runbook__nav-item${
                      item.active ? " platform-runbook__nav-item--active" : ""
                    }`}
                  >
                    {item.active ? (
                      <span className="platform-runbook__nav-dot" aria-hidden />
                    ) : null}
                    {item.label}
                    {item.badge != null ? (
                      <span className="platform-runbook__nav-badge">{item.badge}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="platform-runbook__document" aria-label="Platform runbook">
          <header className="platform-runbook__doc-head">
            <h2 className="platform-runbook__doc-title">Platform runbook</h2>
            <p className="platform-runbook__doc-meta">Last updated · 2h ago</p>
          </header>

          {PLATFORM_RUNBOOK_SECTIONS.map((section) => (
            <section key={section.heading} className="platform-runbook__section">
              <h3 className="platform-runbook__section-title">{section.heading}</h3>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} className="platform-runbook__paragraph">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </main>

        <aside className="platform-runbook__review" aria-label="Memory commitment review">
          <header className="platform-runbook__review-chrome">
            <div className="platform-runbook__review-title-row">
              <StarIcon size={16} />
              <div>
                <p className="platform-runbook__review-title">Memory Commitment Review</p>
                <p className="platform-runbook__review-sub">
                  Agent wants to remember {beliefs.length} things
                </p>
              </div>
            </div>
          </header>
          <p className="platform-runbook__review-note">
            Reviewing here writes to this workspace&apos;s shared memory.
          </p>
          <MemoryCommitmentReviewBody
            beliefs={beliefs}
            onBeliefsChange={setBeliefs}
            showSummary={false}
            variant="panel"
          />
        </aside>
      </div>
    </div>
  );
}
