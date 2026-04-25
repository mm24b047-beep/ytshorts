import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getChannelDetails, getChannelShorts, getApiKey } from "@/lib/youtube";
import { upsertVideos } from "@/lib/video-sync";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    if (!getApiKey() || getApiKey() === "YOUR_YOUTUBE_API_KEY_HERE") {
      return NextResponse.json(
        { error: "YouTube API key is not configured. Please set YOUTUBE_API_KEY in your .env file." },
        { status: 400 }
      );
    }

    const existing = await prisma.channel.findUnique({
      where: { youtubeId: id },
    });

    if (existing) {
      return NextResponse.json({ message: "Channel already tracked", channel: existing });
    }

    const youtubeChannel = await getChannelDetails(id);
    if (!youtubeChannel) {
      return NextResponse.json({ error: "Channel not found on YouTube" }, { status: 404 });
    }

    const channel = await prisma.channel.create({
      data: {
        youtubeId: youtubeChannel.id,
        title: youtubeChannel.title,
        description: youtubeChannel.description,
        thumbnailUrl: youtubeChannel.thumbnailUrl,
        subscriberCount: youtubeChannel.subscriberCount,
        videoCount: youtubeChannel.videoCount,
        viewCount: youtubeChannel.viewCount,
        lastSyncedAt: new Date(),
      },
    });

    const shorts = await getChannelShorts(id);

    if (shorts.length > 0) {
      await upsertVideos(shorts, channel.id);
    }

    return NextResponse.json({
      message: "Channel tracked successfully",
      channel,
      videosAdded: shorts.length,
    });
  } catch (error: any) {
    console.error("Error tracking channel:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track channel" },
      { status: 500 }
    );
  }
}
