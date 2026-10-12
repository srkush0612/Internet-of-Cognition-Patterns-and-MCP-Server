import { StudioPatternFlow } from "@/components/v2/StudioPatternFlow";

export const metadata = {
  title: "Studio, HAX 2.0 v2",
  description:
    "Choose a HAX catalog pattern, shape it on a canvas, and export the interaction design.",
};

export default function V2StudioPage() {
  // Studio keeps discovery, the editable canvas, and conversation in one screen.
  return (
    <main className="v2-studio">
      <StudioPatternFlow />
    </main>
  );
}
