import type { ReactNode } from "react";

export function PatternChangeShell({
  changeRef,
  service,
  title,
  status,
  stepLabel,
  children,
}: {
  changeRef: string;
  service: string;
  title: string;
  status: string;
  stepLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="pattern-change">
      <aside className="pattern-change__aside" aria-label="Change record">
        <div className="pattern-change__ref-row">
          <span className="pattern-change__service">{service}</span>
          <span className="pattern-change__ref">{changeRef}</span>
        </div>
        <h3 className="pattern-change__title">{title}</h3>
        <p className="pattern-change__status">{status}</p>
        <ol className="pattern-change__steps" aria-label="Change workflow">
          <li className="pattern-change__step pattern-change__step--done">
            Proposed
          </li>
          <li className="pattern-change__step pattern-change__step--active">
            {stepLabel}
          </li>
          <li className="pattern-change__step">Execute</li>
          <li className="pattern-change__step">Close</li>
        </ol>
      </aside>

      <section
        className="pattern-change__main"
        aria-labelledby="pattern-change-approval-heading"
      >
        <h4 className="pattern-change__step-heading" id="pattern-change-approval-heading">
          {stepLabel}
        </h4>
        <div className="pattern-change__slot">{children}</div>
      </section>
    </div>
  );
}
