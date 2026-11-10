/** Standalone recording surfaces intentionally bypass the HAX site chrome. */
export default function RecordingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
