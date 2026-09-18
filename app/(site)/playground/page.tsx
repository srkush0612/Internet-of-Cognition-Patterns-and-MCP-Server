import { Suspense } from "react";
import Link from "next/link";
import { PatternPlayground } from "@/archive/playground/components/PatternPlayground";

function PlaygroundFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <p className="text-sm text-muted">Loading playground…</p>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen">
      <div className="archived-notice">
        <strong>Archived.</strong> Superseded by{" "}
        <Link href="/studio">Studio</Link>, kept here for reference.
      </div>
      <Suspense fallback={<PlaygroundFallback />}>
        <PatternPlayground />
      </Suspense>
    </div>
  );
}
