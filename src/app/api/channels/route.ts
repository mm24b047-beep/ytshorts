import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchChannels, getApiKey } from "@/lib/youtube";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const tracked = searchParams.get("tracked");

  try {
    if (tracked === "true" || !query) {
      const channels = await prisma.channel.findMany({
        orderBy: { trackedAt: "desc" },
      });
      return NextResponse.json(channels);
    }

    if (!getApiKey() || getApiKey() === "YOUR_YOUTUBE_API_KEY_HERE") {
      return NextResponse.json(
        { error: "YouTube API key is not configured. Please set YOUTUBE_API_KEY in your .env file." },
        { status: 400 }
      );
    }

    const channels = await searchChannels(query);
    return NextResponse.json(channels);
  } catch (error: any) {
    console.error("Error fetching channels:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.error?.message || "Failed to fetch channels" },
      { status: 500 }
    );
  }
}
