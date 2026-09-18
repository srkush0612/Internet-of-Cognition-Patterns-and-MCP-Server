import { PatternChoice } from "@/components/studio/PatternChoice";

export default async function EncounterPage({
  params,
}: {
  params: Promise<{ scenarioId: string; encounterId: string }>;
}) {
  const { scenarioId, encounterId } = await params;
  return <PatternChoice scenarioId={scenarioId} encounterId={encounterId} />;
}
