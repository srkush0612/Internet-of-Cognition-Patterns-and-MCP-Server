import { Suspense } from "react";
import { SituationCanvas } from "@/components/studio/SituationCanvas";

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ scenarioId: string; situationId: string }>;
}) {
  const { scenarioId, situationId } = await params;
  return (
    <Suspense fallback={<div className="studio-canvas studio-muted">Loading…</div>}>
      <SituationCanvas scenarioId={scenarioId} situationId={situationId} />
    </Suspense>
  );
}
