import { redirect } from "next/navigation";

/** Superseded, same as the situation route above. */
export default async function CanvasRedirect({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  redirect(`/studio/${scenarioId}`);
}
