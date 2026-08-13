import { NextResponse } from "next/server";
import { searchAnime } from "@/lib/api";

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const query =
      searchParams.get("q")?.trim() || "";

    if (!query) {
      return NextResponse.json({
        anime: [],
      });
    }

    if (query.length > 100) {
      return NextResponse.json(
        {
          anime: [],
          error:
            "Search query is too long.",
        },
        { status: 400 }
      );
    }

    const anime =
      await searchAnime(query);

    return NextResponse.json(
      {
        anime: Array.isArray(anime)
          ? anime.slice(0, 12)
          : [],
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, max-age=30, s-maxage=60",
        },
      }
    );
  } catch (error) {
    console.error(
      "Search API Error:",
      error
    );

    return NextResponse.json(
      {
        anime: [],
        error:
          "Unable to search anime right now.",
      },
      { status: 500 }
    );
  }
}
