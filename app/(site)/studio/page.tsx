import { StudioHome } from "@/components/studio/StudioHome";
import { sampleScenario } from "@/lib/studio/content";

export default function StudioPage() {
  return <StudioHome sampleScenarioId={sampleScenario?.id ?? null} />;
}
