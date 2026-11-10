import { CursorMcpStory } from "@/components/v2/CursorMcpStory";
import "./cursor-mcp-story.css";

export const metadata = {
  title: "MCP in Cursor · HAX",
  description: "A guided walkthrough showing how Cursor connects to the HAX Patterns MCP, discovers a pattern, and integrates it into a project.",
};

export default function CursorMcpStoryPage() {
  return <CursorMcpStory />;
}
