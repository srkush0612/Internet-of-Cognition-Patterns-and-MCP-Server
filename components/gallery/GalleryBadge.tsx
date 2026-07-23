type Variant = "accent" | "success" | "danger";

export function GalleryBadge({
  children,
  variant = "accent",
}: {
  children: React.ReactNode;
  variant?: Variant;
}) {
  return (
    <span className={`gallery-badge gallery-badge--${variant}`}>{children}</span>
  );
}
