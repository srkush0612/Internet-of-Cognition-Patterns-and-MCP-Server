import type { ReactNode } from "react";

export function PatternPanelCard({
  title,
  subtitle,
  statusTag,
  statusVariant = "default",
  collapsed = false,
  children,
}: {
  title: string;
  subtitle?: string;
  statusTag?: string;
  statusVariant?: "default" | "success" | "muted";
  collapsed?: boolean;
  children: ReactNode;
}) {
  return (
    <article
      className={`pattern-panel-card${
        collapsed ? " pattern-panel-card--collapsed" : ""
      }`}
    >
      <header className="pattern-panel-card__header">
        <div className="pattern-panel-card__heading">
          <h3 className="pattern-panel-card__title">{title}</h3>
          {subtitle && !collapsed ? (
            <p className="pattern-panel-card__subtitle">{subtitle}</p>
          ) : null}
        </div>
        {statusTag ? (
          <span
            className={`pattern-panel-card__status pattern-panel-card__status--${statusVariant}`}
          >
            {statusTag}
          </span>
        ) : null}
      </header>
      {!collapsed ? (
        <div className="pattern-panel-card__body">{children}</div>
      ) : null}
    </article>
  );
}
