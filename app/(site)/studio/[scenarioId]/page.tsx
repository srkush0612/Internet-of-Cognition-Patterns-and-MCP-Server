import { EncounterMap } from "@/components/studio/EncounterMap";

export default async function EncounterMapPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  return <EncounterMap scenarioId={scenarioId} />;
}
