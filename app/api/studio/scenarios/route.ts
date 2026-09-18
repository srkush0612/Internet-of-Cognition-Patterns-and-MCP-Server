import {
  copyScenario,
  createScenario,
  getScenario,
  listScenarios,
  updateScenario,
} from "@/server/studio-server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Every scenario operation funnels through this ONE route file, mirroring
 * app/api/instances/route.ts's action-discriminator convention. That's not
 * just style: Next.js's dev server compiles each route.ts as its own
 * isolated module graph, so a module-level Map (server/studio-server.ts)
 * imported from two different route files ends up duplicated, one empty
 * copy per file, in dev mode. One file keeps it one shared instance.
 */
export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (id) {
      const scenario = getScenario(id);
      if (!scenario) {
        return NextResponse.json({ error: `Scenario not found: ${id}` }, { status: 404 });
      }
      return NextResponse.json({ success: true, scenario });
    }

    const scenarios = listScenarios();
    return NextResponse.json({ success: true, count: scenarios.length, scenarios });
  } catch (error) {
    console.error("Scenario GET error:", error);
    return NextResponse.json({ error: "Failed to read scenarios" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  try {
    const { action } = body;

    if (action === "create") {
      const { name, description, topology, attendance, irreversibility } = body;
      if (!name || !topology || !attendance || !irreversibility) {
        return NextResponse.json(
          { error: "name, topology, attendance, and irreversibility are required" },
          { status: 400 },
        );
      }
      const scenario = createScenario({
        name,
        description: description ?? "",
        topology,
        attendance,
        irreversibility,
      });
      return NextResponse.json({ success: true, scenario });
    }

    if (action === "update") {
      const { id, updates } = body;
      if (!id || !updates) {
        return NextResponse.json({ error: "id and updates are required" }, { status: 400 });
      }
      const scenario = updateScenario(id, updates);
      if (!scenario) {
        return NextResponse.json(
          { error: `Scenario not found, or read-only: ${id}` },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, scenario });
    }

    if (action === "copy") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
      }
      const copy = copyScenario(id);
      if (!copy) {
        return NextResponse.json({ error: `Scenario not found: ${id}` }, { status: 404 });
      }
      return NextResponse.json({ success: true, scenario: copy });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error("Scenario POST error:", error);
    return NextResponse.json({ error: "Failed to process scenario request" }, { status: 500 });
  }
}
