import { NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `
You are AnimeHub AI, a friendly anime assistant.

Help users with:
- Anime recommendations
- Anime characters
- Anime stories
- Anime genres
- Similar anime
- Watch recommendations
- Anime questions

Keep answers concise, friendly and useful.

Rules:
- Do not invent anime information.
- Do not claim an anime is Hindi dubbed unless verified.
- If information may be uncertain or current, say so.
`.trim();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        { reply: "Please ask me something about anime." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");

      return NextResponse.json(
        {
          reply:
            "AI is not configured. Please add GEMINI_API_KEY to the environment variables.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: SYSTEM_INSTRUCTION,
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 500,
            thinkingConfig: {
              thinkingLevel: "minimal",
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);

      return NextResponse.json(
        {
          reply:
            data?.error?.message ||
            "Gemini AI returned an error.",
        },
        { status: 500 }
      );
    }

    const parts =
      data?.candidates?.[0]?.content?.parts;

    const reply = Array.isArray(parts)
      ? parts
          .filter(
            (part: { text?: unknown }) =>
              typeof part?.text === "string"
          )
          .map(
            (part: { text: string }) =>
              part.text
          )
          .join("")
          .trim()
      : "";

    if (!reply) {
      console.error(
        "Gemini returned no text:",
        data
      );

      return NextResponse.json(
        {
          reply:
            "Sorry, Gemini did not return a response. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI route error:", error);

    return NextResponse.json(
      {
        reply:
          "AI service is temporarily unavailable. Please try again.",
      },
      { status: 500 }
    );
  }
}