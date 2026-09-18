import { Suspense } from "react";
import { EncounterCanvas } from "@/components/studio/EncounterCanvas";

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ scenarioId: string; encounterId: string }>;
}) {
  const { scenarioId, encounterId } = await params;
  return (
    <Suspense fallback={<div className="studio-canvas studio-muted">Loading…</div>}>
      <EncounterCanvas scenarioId={scenarioId} encounterId={encounterId} />
    </Suspense>
  );
}
