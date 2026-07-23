import { GalleryField } from "./GalleryField";

export function GalleryTextarea({
  label,
  id,
  placeholder = "Enter multiple lines…",
  rows = 3,
  hint,
}: {
  label: string;
  id: string;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <GalleryField label={label} typeLabel="textarea" hint={hint} htmlFor={id}>
      <textarea
        id={id}
        className="gallery-input__field gallery-input__field--textarea gallery-surface-raised"
        placeholder={placeholder}
        rows={rows}
      />
    </GalleryField>
  );
}
