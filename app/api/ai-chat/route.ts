import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

const GEMINI_MODEL = "gemini-3.6-flash";

type HistoryMessage = {
  role?: string;
  content?: string;
};

type GeminiContentPart = {
  text?: unknown;
};

type GeminiStep = {
  text?: unknown;
  content?: unknown;
};

type GeminiOutput = {
  text?: unknown;
  content?: unknown;
};

type GeminiResponse = {
  error?: {
    message?: unknown;
  };
  message?: unknown;
  output_text?: unknown;
  steps?: unknown;
  outputs?: unknown;
};

function getTextFromContent(content: unknown): string {
  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part: unknown) => {
      if (
        typeof part === "object" &&
        part !== null &&
        "text" in part
      ) {
        const item = part as GeminiContentPart;

        return typeof item.text === "string"
          ? item.text
          : "";
      }

      return "";
    })
    .join("");
}

function getGeminiReply(data: GeminiResponse): string {
  let reply = "";

  // New Interactions API response
  if (typeof data.output_text === "string") {
    reply = data.output_text;
  }

  // Interactions API steps
  if (!reply && Array.isArray(data.steps)) {
    for (const rawStep of data.steps) {
      if (
        typeof rawStep !== "object" ||
        rawStep === null
      ) {
        continue;
      }

      const step = rawStep as GeminiStep;

      if (typeof step.text === "string") {
        reply += step.text;
      }

      reply += getTextFromContent(step.content);
    }
  }

  // Alternate output format
  if (!reply && Array.isArray(data.outputs)) {
    for (const rawOutput of data.outputs) {
      if (
        typeof rawOutput !== "object" ||
        rawOutput === null
      ) {
        continue;
      }

      const output = rawOutput as GeminiOutput;

      if (typeof output.text === "string") {
        reply += output.text;
      }

      reply += getTextFromContent(output.content);
    }
  }

  return reply.trim();
}

function getApiError(
  data: GeminiResponse | null,
  rawText: string
): string {
  if (
    data &&
    typeof data.error === "object" &&
    data.error !== null &&
    typeof data.error.message === "string"
  ) {
    return data.error.message;
  }

  if (
    data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  if (rawText.trim()) {
    return rawText.trim();
  }

  return "Gemini AI request failed.";
}

export async function POST(request: NextRequest) {
  try {
    // --------------------------------------------------
    // API KEY
    // --------------------------------------------------

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error(
        "GEMINI_API_KEY is missing."
      );

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

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null
    ) {
      return NextResponse.json(
        {
          error: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const requestBody = body as {
      message?: unknown;
      history?: unknown;
    };

    const message =
      typeof requestBody.message === "string"
        ? requestBody.message.trim()
        : "";

    const history: HistoryMessage[] =
      Array.isArray(requestBody.history)
        ? requestBody.history.filter(
            (item): item is HistoryMessage =>
              typeof item === "object" &&
              item !== null
          )
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
          item.role === "assistant" ||
          item.role === "model"
            ? "AnimeHub AI"
            : "User";

        const content =
          typeof item.content === "string"
            ? item.content.trim()
            : "";

        return `${role}: ${content}`;
      })
      .filter(
        (line) => line.trim().length > 0
      )
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

    const response = await fetch(
      GEMINI_URL,
      {
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
      }
    );

    // --------------------------------------------------
    // READ RESPONSE SAFELY
    // --------------------------------------------------

    const rawText = await response.text();

    let data: GeminiResponse | null = null;

    if (rawText.trim()) {
      try {
        const parsed: unknown =
          JSON.parse(rawText);

        if (
          typeof parsed === "object" &&
          parsed !== null
        ) {
          data = parsed as GeminiResponse;
        }
      } catch {
        console.error(
          "Gemini returned invalid JSON:",
          rawText
        );
      }
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

      const apiError = getApiError(
        data,
        rawText
      );

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

    if (!data) {
      console.error(
        "Gemini returned an empty response."
      );

      return NextResponse.json(
        {
          error:
            "Gemini returned an empty response. Please try again.",
        },
        { status: 502 }
      );
    }

    const reply = getGeminiReply(data);

    // --------------------------------------------------
    // EMPTY RESPONSE
    // --------------------------------------------------

    if (!reply) {
      console.error(
        "Gemini returned no text:",
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

      const lowerMessage =
        error.message.toLowerCase();

      if (
        error.message.includes("401") ||
        error.message.includes("403") ||
        lowerMessage.includes("api key")
      ) {
        errorMessage =
          "Gemini API key is invalid or does not have permission.";
      } else if (
        error.message.includes("429") ||
        lowerMessage.includes("quota")
      ) {
        errorMessage =
          "Gemini API quota/limit reached. Please try again later.";
      } else if (
        error.message.includes("404") ||
        lowerMessage.includes("not found")
      ) {
        errorMessage =
          "Gemini model or API endpoint was not found. Check the Gemini configuration.";
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,

        ...(process.env.NODE_ENV !==
          "production" &&
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