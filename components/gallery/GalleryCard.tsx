import type { ReactNode } from "react";

export function GalleryCard({
  title,
  note,
  className,
  children,
}: {
  title: string;
  note?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={["gallery-card gallery-surface-raised", className]
        .filter(Boolean)
        .join(" ")}
    >
      <h3 className="gallery-card__title">{title}</h3>
      <div className="gallery-card__body">{children}</div>
      {note ? <p className="gallery-card__note">{note}</p> : null}
    </article>
  );
}
