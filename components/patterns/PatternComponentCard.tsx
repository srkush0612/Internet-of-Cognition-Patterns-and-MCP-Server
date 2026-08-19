import type { CSSProperties, ReactNode } from "react";

export type PatternComponentCardProps = {
  patternKey: string;
  labelPrefix?: string;
  dotColor?: string;
  researchDot?: boolean;
  showLabelBar?: boolean;
  title: string;
  contextLabel: string;
  icon: ReactNode;
  footerLeft?: ReactNode;
  footerRight?: string;
  compact?: boolean;
  children: ReactNode;
};

export function PatternComponentCard({
  patternKey,
  labelPrefix = "PATTERN",
  dotColor,
  researchDot = false,
  showLabelBar = true,
  title,
  contextLabel,
  icon,
  footerLeft,
  footerRight,
  compact = false,
  children,
}: PatternComponentCardProps) {
  return (
    <article
      className={
        compact
          ? `pattern-component-card pattern-component-card--compact${researchDot ? " pattern-component-card--research" : ""}`
          : `pattern-component-card${researchDot ? " pattern-component-card--research" : ""}`
      }
    >
      {showLabelBar ? (
        <div className="pattern-component-card__labelbar">
          <span
            className="pattern-component-card__dot"
            style={
              dotColor
                ? ({ "--pattern-label-dot": dotColor } as CSSProperties)
                : undefined
            }
            aria-hidden
          />
          <span className="pattern-component-card__labeltext">
            {labelPrefix} · {patternKey}
          </span>
        </div>
      ) : null}

      <div className="pattern-component-card__header">
        <div className="pattern-component-card__icon-wrap">{icon}</div>
        <h3 className="pattern-component-card__title">{title}</h3>
        <span className="pattern-component-card__context">{contextLabel}</span>
      </div>

      <div className="pattern-component-card__body">{children}</div>

      {(footerLeft != null || footerRight != null) && (
        <footer className="pattern-component-card__footer">
          {footerLeft != null ? (
            <span className="pattern-component-card__footer-left">{footerLeft}</span>
          ) : null}
          {footerRight != null ? (
            <span className="pattern-component-card__timestamp">{footerRight}</span>
          ) : null}
        </footer>
      )}
    </article>
  );
}
