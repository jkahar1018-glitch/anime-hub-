import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");

      return NextResponse.json(
        {
          error:
            "Gemini API key is missing. Check your .env.local file.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        {
          error: "Please enter a message.",
        },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction:
          "You are AnimeHub AI, a friendly anime assistant. " +
          "Help users with anime recommendations, anime characters, " +
          "genres, seasons, episodes, movies, comparisons and watch suggestions. " +
          "Give clear and useful answers. " +
          "Keep normal answers reasonably concise. " +
          "You can answer in Hindi, Hinglish or English depending on the user's language.",
        maxOutputTokens: 600,
      },
    });

    const reply =
      typeof response.text === "string"
        ? response.text.trim()
        : "";

    if (!reply) {
      return NextResponse.json(
        {
          error:
            "Gemini returned an empty response. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      reply,
    });
  } catch (error: unknown) {
    console.error("=================================");
    console.error("GEMINI AI ERROR");
    console.error("=================================");
    console.error(error);

    let errorMessage =
      "AI service temporarily failed. Please try again.";

    if (error instanceof Error) {
      console.error("Message:", error.message);

      if (
        error.message.includes("API key") ||
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        errorMessage =
          "Gemini API key is invalid or does not have permission.";
      } else if (
        error.message.includes("429") ||
        error.message.toLowerCase().includes("quota")
      ) {
        errorMessage =
          "Gemini API limit/quota reached. Please try again later.";
      } else if (
        error.message.includes("404") ||
        error.message.toLowerCase().includes("not found")
      ) {
        errorMessage =
          "Gemini model was not found. Check the selected model.";
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,

        // Development me actual error browser ko dikhega.
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