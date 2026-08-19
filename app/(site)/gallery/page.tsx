import { Suspense } from "react";
import { PatternGallery } from "@/components/PatternGallery";

function GalleryFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <p className="text-sm text-muted">Loading patterns…</p>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<GalleryFallback />}>
        <PatternGallery />
      </Suspense>
    </div>
  );
}
