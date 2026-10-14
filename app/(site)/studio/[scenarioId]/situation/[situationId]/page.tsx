import { redirect } from "next/navigation";

/**
 * Superseded: a situation is a view on the canvas now, not its own page.
 * Kept as a redirect so older links still land somewhere sensible.
 */
export default async function SituationRedirect({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  redirect(`/studio/${scenarioId}`);
}
