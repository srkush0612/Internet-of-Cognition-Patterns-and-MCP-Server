import { PatternChoice } from "@/components/studio/PatternChoice";

export default async function SituationPage({
  params,
}: {
  params: Promise<{ scenarioId: string; situationId: string }>;
}) {
  const { scenarioId, situationId } = await params;
  return <PatternChoice scenarioId={scenarioId} situationId={situationId} />;
}
