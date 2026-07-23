const TAGS = ["multi-agent", "auditability", "progressive disclosure", "human-in-loop"];

export function GalleryTag() {
  return (
    <div className="gallery-tag-row">
      {TAGS.map((tag) => (
        <span key={tag} className="gallery-tag">
          {tag}
        </span>
      ))}
    </div>
  );
}
