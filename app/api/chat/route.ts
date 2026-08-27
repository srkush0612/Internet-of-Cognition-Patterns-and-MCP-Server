import {
  recommendPatterns,
  toChatRecommendation,
  buildAiResponse,
  type ChatRecommendation,
} from "@/lib/pattern-advisor";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type { ChatRecommendation };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message as string | undefined;
    const sessionId = (body.sessionId as string | undefined) ?? "anonymous";

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const recommendations = (await recommendPatterns(message.trim())).map(
      toChatRecommendation,
    );
    const topRecommendation = recommendations[0] ?? null;

    const response = {
      sessionId,
      userMessage: message.trim(),
      aiResponse: buildAiResponse(recommendations),
      recommendations,
      topRecommendation,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process chat";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
