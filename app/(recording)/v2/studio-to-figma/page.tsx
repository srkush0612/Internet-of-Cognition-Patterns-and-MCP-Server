import { StudioToFigmaStory } from "@/components/v2/StudioToFigmaStory";
import "./studio-to-figma.css";

export const metadata = {
  title: "Studio to Figma · HAX",
  description: "A guided Studio export and Figma agent handoff walkthrough.",
};

export default function StudioToFigmaPage() {
  return <StudioToFigmaStory />;
}
