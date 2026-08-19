import { fetchComponent } from "@/server/mcp-server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Pattern slug is required" },
        { status: 400 }
      );
    }

    const component = fetchComponent(slug);

    if (!component) {
      return NextResponse.json(
        { error: `Pattern not found: ${slug}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      component,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pattern" },
      { status: 500 }
    );
  }
}
