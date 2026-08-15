import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase environment variables are missing. Check .env.local"
    );
  }

  return createClient(supabaseUrl, supabaseKey);
}

// ==========================================
// GET - LOAD COMMUNITY MESSAGES
// ==========================================

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("community_messages")
      .select("id, name, message, created_at")
      .order("created_at", {
        ascending: true,
      })
      .limit(100);

    if (error) {
      console.error("Supabase GET error:", error);

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: data ?? [],
    });
  } catch (error) {
    console.error("Community Chat GET error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load community messages.",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// POST - SEND COMMUNITY MESSAGE
// ==========================================

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();

    const body = await req.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    // Validate name
    if (!name) {
      return NextResponse.json(
        {
          error: "Please enter your name.",
        },
        { status: 400 }
      );
    }

    // Validate message
    if (!message) {
      return NextResponse.json(
        {
          error: "Please write a message.",
        },
        { status: 400 }
      );
    }

    // Name limit
    if (name.length > 30) {
      return NextResponse.json(
        {
          error: "Name must be 30 characters or less.",
        },
        { status: 400 }
      );
    }

    // Message limit
    if (message.length > 500) {
      return NextResponse.json(
        {
          error:
            "Message must be 500 characters or less.",
        },
        { status: 400 }
      );
    }

    // Insert message
    const { data, error } = await supabase
      .from("community_messages")
      .insert({
        name,
        message,
      })
      .select("id, name, message, created_at")
      .single();

    if (error) {
      console.error("Supabase POST error:", error);

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Community Chat POST error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send community message.",
      },
      { status: 500 }
    );
  }
}
