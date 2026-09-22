import { StudioApp } from "@/components/studio/StudioApp";

/**
 * Studio is one screen: the agent on the left, the canvas on the right. The
 * canvas view is component state rather than a route, so the agent can move it
 * without a navigation. The nested situation routes this replaced now redirect
 * here.
 */
export default async function StudioScenarioPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  return <StudioApp scenarioId={scenarioId} />;
}
