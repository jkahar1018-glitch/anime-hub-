import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

const GEMINI_MODEL = "gemini-3.6-flash";

type HistoryMessage = {
  role?: string;
  content?: string;
};

export async function POST(request: NextRequest) {
  try {
    // --------------------------------------------------
    // API KEY
    // --------------------------------------------------

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");

      return NextResponse.json(
        {
          error:
            "Gemini API key is missing. Add GEMINI_API_KEY to .env.local and Vercel Environment Variables.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // READ REQUEST
    // --------------------------------------------------

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

    // --------------------------------------------------
    // CONVERSATION HISTORY
    // --------------------------------------------------

    const previousConversation = history
      .slice(-10)
      .map((item) => {
        const role =
          item?.role === "assistant" ||
          item?.role === "model"
            ? "AnimeHub AI"
            : "User";

        const content =
          typeof item?.content === "string"
            ? item.content.trim()
            : "";

        return `${role}: ${content}`;
      })
      .filter(Boolean)
      .join("\n");

    // --------------------------------------------------
    // ANIMEHUB AI PROMPT
    // --------------------------------------------------

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
- Anime movies
- Anime series
- Anime episodes
- Anime comparisons
- General anime questions

Rules:

1. Be friendly and helpful.
2. Keep normal answers reasonably concise.
3. You can answer in Hindi, Hinglish, or English.
4. Reply in the same language style the user uses.
5. If the user asks about anime, give useful and clear information.
6. Do not pretend to have watched an anime personally.
7. Do not make up information when you are unsure.

Conversation history:

${previousConversation || "No previous conversation."}

User:

${message}

AnimeHub AI:
`.trim();

    // --------------------------------------------------
    // GEMINI INTERACTIONS API
    // --------------------------------------------------

    const response = await fetch(GEMINI_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
        "Api-Revision": "2026-05-20",
      },

      body: JSON.stringify({
        model: GEMINI_MODEL,
        input: prompt,
      }),
    });

    // --------------------------------------------------
    // READ RESPONSE SAFELY
    // --------------------------------------------------

    const rawText = await response.text();

    let data: any = null;

    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      console.error(
        "Gemini returned invalid JSON:",
        rawText
      );
    }

    // --------------------------------------------------
    // GEMINI ERROR
    // --------------------------------------------------

    if (!response.ok) {
      console.error(
        "Gemini API Error:",
        response.status,
        data ?? rawText
      );

      const apiError =
        data?.error?.message ||
        data?.message ||
        rawText ||
        "Gemini AI request failed.";

      return NextResponse.json(
        {
          error: apiError,
        },
        {
          status: response.status,
        }
      );
    }

    // --------------------------------------------------
    // GET AI RESPONSE
    // --------------------------------------------------

    let reply = "";

    // New Interactions API convenience response
    if (typeof data?.output_text === "string") {
      reply = data.output_text;
    }

    // Interactions API steps
    if (!reply && Array.isArray(data?.steps)) {
      for (const step of data.steps) {
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

        if (
          typeof step?.text === "string"
        ) {
          reply += step.text;
        }
      }
    }

    // Older/alternate output format
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

    reply = reply.trim();

    // --------------------------------------------------
    // EMPTY RESPONSE
    // --------------------------------------------------

    if (!reply) {
      console.error(
        "Gemini returned no text.",
        data
      );

      return NextResponse.json(
        {
          error:
            "Gemini returned an empty response. Please try again.",
        },
        { status: 502 }
      );
    }

    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    return NextResponse.json({
      reply,
    });
  } catch (error: unknown) {
    console.error(
      "================================="
    );

    console.error(
      "ANIMEHUB AI SERVER ERROR"
    );

    console.error(
      "================================="
    );

    console.error(error);

    let errorMessage =
      "AI service temporarily failed. Please try again.";

    if (error instanceof Error) {
      console.error(
        "Error message:",
        error.message
      );

      if (
        error.message.includes("401") ||
        error.message.includes("403") ||
        error.message
          .toLowerCase()
          .includes("api key")
      ) {
        errorMessage =
          "Gemini API key is invalid or does not have permission.";
      } else if (
        error.message.includes("429") ||
        error.message
          .toLowerCase()
          .includes("quota")
      ) {
        errorMessage =
          "Gemini API quota/limit reached. Please try again later.";
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,

        ...(process.env.NODE_ENV !== "production" &&
        error instanceof Error
          ? {
              debug: error.message,
            }
          : {}),
      },
      { status: 500 }
    );
  }
}