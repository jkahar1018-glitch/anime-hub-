import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

type HistoryMessage = {
  role?: string;
  content?: string;
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is missing in .env.local",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    const history: HistoryMessage[] =
      Array.isArray(body?.history)
        ? body.history
        : [];

    if (!message) {
      return NextResponse.json(
        {
          error: "Message is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Build conversation text.
     *
     * We keep the history simple so the API
     * receives a clean prompt every time.
     */

    const previousConversation = history
      .slice(-10)
      .map((item) => {
        const role =
          item.role === "assistant" ||
          item.role === "model"
            ? "AnimeHub AI"
            : "User";

        return `${role}: ${item.content || ""}`;
      })
      .join("\n");

    const prompt = `
You are AnimeHub AI, the official AI assistant
for an anime streaming website called AnimeHub.

Your job is to help users with:

- Anime recommendations
- Anime genres
- Anime characters
- Anime stories
- Anime watch orders
- Anime suggestions
- General questions about anime

Be friendly, helpful and concise.

Conversation history:
${previousConversation}

User:
${message}

AnimeHub AI:
`.trim();

    const response = await fetch(GEMINI_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },

      body: JSON.stringify({
        model: "gemini-3.6-flash",

        input: prompt,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Gemini Interactions API Error:",
        data
      );

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "Gemini AI request failed.",
        },
        {
          status: response.status,
        }
      );
    }

    /*
     * Interactions API response
     */

    let reply = "";

    if (typeof data?.output_text === "string") {
      reply = data.output_text;
    }

    if (!reply && Array.isArray(data?.outputs)) {
      for (const output of data.outputs) {
        if (
          typeof output?.text === "string"
        ) {
          reply += output.text;
        }

        if (
          Array.isArray(output?.content)
        ) {
          for (const part of output.content) {
            if (
              typeof part?.text === "string"
            ) {
              reply += part.text;
            }
          }
        }
      }
    }

    if (!reply && Array.isArray(data?.steps)) {
      for (const step of data.steps) {
        if (
          typeof step?.text === "string"
        ) {
          reply += step.text;
        }

        if (
          Array.isArray(step?.content)
        ) {
          for (const part of step.content) {
            if (
              typeof part?.text === "string"
            ) {
              reply += part.text;
            }
          }
        }
      }
    }

    reply = reply.trim();

    if (!reply) {
      console.error(
        "Gemini returned no text:",
        data
      );

      return NextResponse.json(
        {
          error:
            "Gemini returned an empty response.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      reply,
    });
  } catch (error) {
    console.error(
      "AnimeHub AI Server Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "AI service temporarily failed. Please try again.",
      },
      { status: 500 }
    );
  }
}