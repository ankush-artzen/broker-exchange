import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ParsedLead } from "@/lib/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json();

    if (!text?.trim()) {
      return Response.json({ error: "Text is required" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "AI service not configured" },
        { status: 503 },
      );
    }

    const langLabel =
      language === "hi-IN"
        ? "Hindi"
        : language === "pa-IN"
          ? "Punjabi"
          : "English";

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You extract real-estate lead information from broker voice notes.
The speech was in ${langLabel}. Transcribed text:

"""
${text.trim()}
"""

Return ONLY valid JSON with these optional fields (use null for missing):
{
  "name": string,
  "phone": string (digits only, include country code if mentioned),
  "requirement": string (e.g. 2BHK, shop, plot),
  "location": string,
  "budget": string,
  "source": string (referral, walk-in, portal, etc.),
  "notes": string,
  "followUpDate": string (ISO date YYYY-MM-DD if a follow-up day is mentioned, else null)
}

Today is ${new Date().toISOString().split("T")[0]}. If they say "tomorrow", use tomorrow's date.`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      return Response.json({ error: "Unexpected AI response" }, { status: 500 });
    }

    const jsonMatch = block.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: "Could not parse AI response" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as ParsedLead;
    return Response.json(parsed);
  } catch (error) {
    console.error("parse-lead error:", error);

    const status =
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 401
        ? 503
        : 500;

    const message =
      error &&
      typeof error === "object" &&
      "status" in error &&
 error.status === 401
        ? "AI service misconfigured"
        : "Failed to parse lead";

    return Response.json({ error: message }, { status });
  }
}
