import { NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `
You are AnimeHub AI, a friendly and helpful anime assistant.

You can help users with:
- Anime recommendations
- Anime characters
- Anime stories
- Anime genres
- Similar anime
- Best anime lists
- Watch recommendations

Keep answers concise, clear, useful, and natural.

Important rules:
- Never claim an anime is Hindi dubbed unless the user provides a verified source.
- If you are unsure about current streaming, dubbing, availability, or release information, clearly say that you are unsure.
- Do not invent anime information.
- You can respond casually and naturally.
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
        {
          reply: "Ask me something about anime.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");

      return NextResponse.json(
        {
          reply:
            "Gemini API key is missing. Check your .env.local file.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model: "gemini-3.5-flash-lite",

          input: message,

          system_instruction: SYSTEM_INSTRUCTION,

          generation_config: {
            max_output_tokens: 500,
            thinking_level: "minimal",
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
        {
          status: response.status,
        }
      );
    }

    let reply = "";

    // Interactions API output
    if (Array.isArray(data?.outputs)) {
      for (const output of data.outputs) {
        if (
          output?.type === "text" &&
          typeof output?.text === "string"
        ) {
          reply += output.text;
        }
      }
    }

    // Interactions API steps fallback
    if (!reply && Array.isArray(data?.steps)) {
      for (const step of data.steps) {
        if (
          step?.type === "model_output" &&
          Array.isArray(step?.content)
        ) {
          for (const content of step.content) {
            if (
              content?.type === "text" &&
              typeof content?.text === "string"
            ) {
              reply += content.text;
            }
          }
        }
      }
    }

    // Additional fallback
    if (
      !reply &&
      typeof data?.output_text === "string"
    ) {
      reply = data.output_text;
    }

    reply = reply.trim();

    if (!reply) {
      console.error(
        "Gemini returned empty response:",
        data
      );

      return NextResponse.json({
        reply:
          "Sorry, I could not generate an answer.",
      });
    }

    return NextResponse.json({
      reply,
    });
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