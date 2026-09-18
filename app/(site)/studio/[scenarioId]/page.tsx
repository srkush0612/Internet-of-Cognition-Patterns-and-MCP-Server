import { SituationMap } from "@/components/studio/SituationMap";

export default async function SituationMapPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  return <SituationMap scenarioId={scenarioId} />;
}
