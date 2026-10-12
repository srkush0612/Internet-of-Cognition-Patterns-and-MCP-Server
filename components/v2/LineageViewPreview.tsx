export function LineageViewPreview() {
  return (
    <section className="v2-lineage" aria-labelledby="v2-lineage-title">
      <header className="v2-lineage__header">
        <div>
          <p className="v2-lineage__eyebrow">INC-2231 · edge-router-7 outage · updated 3 min ago</p>
          <h3 id="v2-lineage-title">RCA summary · dependency lineage</h3>
          <p className="v2-lineage__count">2 decisions and 1 artifact depend on this source</p>
        </div>
      </header>

      <div className="v2-lineage__graph">
        <article className="v2-lineage__source">
          <div className="v2-lineage__node-head">
            <span className="v2-lineage__kind">Upstream agent output</span>
            <span className="v2-lineage__flag">Under dispute</span>
          </div>
          <h4>Root cause summary</h4>
          <p>Authored by Triage agent · last verified 14:12</p>
        </article>

        <div className="v2-lineage__connector" aria-hidden="true"><span>is cited by</span></div>

        <div className="v2-lineage__branches">
          <section className="v2-lineage__branch" aria-label="Remediation decision and dependent change">
            <article className="v2-lineage__dependency">
              <span className="v2-lineage__edge-label">Cites RCA summary</span>
              <span className="v2-lineage__kind">Decision · remediation</span>
              <h4>Remediation plan</h4>
              <p>Rollback firmware to 4.11 after draining traffic</p>
            </article>
            <div className="v2-lineage__nested-connector" aria-hidden="true"><span>leads to</span></div>
            <article className="v2-lineage__dependency v2-lineage__dependency--nested">
              <span className="v2-lineage__kind">Decision · change</span>
              <h4>CHG-2231 · production rollback</h4>
              <p>Scheduled for the 22:00 maintenance window</p>
            </article>
          </section>

          <section className="v2-lineage__branch" aria-label="Dependent status page artifact">
            <article className="v2-lineage__dependency">
              <span className="v2-lineage__edge-label">Cites RCA summary</span>
              <span className="v2-lineage__kind">Artifact · communications</span>
              <h4>Status page draft</h4>
              <p>Customer update held until the cause is verified</p>
            </article>
          </section>
        </div>
      </div>

      <footer className="v2-lineage__impact">
        <div><strong>3 teams</strong><span>still cite this summary</span></div>
        <div><strong>2 decisions</strong><span>may need rework if it changes</span></div>
        <p>Verify the source with the teams relying on it before sign-off.</p>
      </footer>
    </section>
  );
}
