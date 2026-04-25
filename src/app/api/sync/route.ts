import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getChannelShorts, getApiKey } from "@/lib/youtube";
import { upsertVideos } from "@/lib/video-sync";

export async function POST() {
  try {
    if (!getApiKey() || getApiKey() === "YOUR_YOUTUBE_API_KEY_HERE") {
      return NextResponse.json(
        { error: "YouTube API key is not configured. Please set YOUTUBE_API_KEY in your .env file." },
        { status: 400 }
      );
    }

    const channels = await prisma.channel.findMany();

    const results = [];

    for (const channel of channels) {
      try {
        const shorts = await getChannelShorts(channel.youtubeId);

        if (shorts.length > 0) {
          await upsertVideos(shorts, channel.id);
        }

        await prisma.channel.update({
          where: { id: channel.id },
          data: { lastSyncedAt: new Date() },
        });

        results.push({
          channelId: channel.id,
          title: channel.title,
          status: "success",
          videosAdded: shorts.length,
        });
      } catch (error: any) {
        results.push({
          channelId: channel.id,
          title: channel.title,
          status: "error",
          error: error.message,
        });
      }
    }

    return NextResponse.json({ message: "Sync completed", results });
  } catch (error: any) {
    console.error("Error syncing channels:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync channels" },
      { status: 500 }
    );
  }
}
