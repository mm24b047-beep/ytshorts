import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateOutlierStats, getOutlierMultiplier } from "@/lib/outliers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId");
  const minViews = searchParams.get("minViews");
  const maxViews = searchParams.get("maxViews");
  const minOutlier = searchParams.get("minOutlier");
  const maxOutlier = searchParams.get("maxOutlier");
  const postedRange = searchParams.get("postedRange");
  const sortBy = searchParams.get("sortBy") || "publishedAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "60")));

  try {
    // Build where clause
    const where: any = {};
    if (channelId) {
      where.channel = {
        OR: [
          { id: channelId },
          { youtubeId: channelId }
        ]
      };
    }

    if (minViews || maxViews) {
      where.views = {};
      if (minViews) where.views.gte = Number(minViews);
      if (maxViews) where.views.lte = Number(maxViews);
    }

    if (postedRange) {
      const now = new Date();
      const minDate = new Date();
      switch (postedRange) {
        case "14d":
          minDate.setDate(now.getDate() - 14);
          break;
        case "30d":
          minDate.setDate(now.getDate() - 30);
          break;
        case "6mo":
          minDate.setMonth(now.getMonth() - 6);
          break;
        default:
          break;
      }
      if (postedRange !== "all") {
        where.publishedAt = { gte: minDate };
      }
    }

    // Get total count first
    const total = await prisma.video.count({ where });

    // Fetch videos with pagination
    const videos = await prisma.video.findMany({
      where,
      include: {
        channel: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate outliers per channel
    const channelIds = [...new Set(videos.map((v) => v.channelId))];
    const channelVideosMap = new Map<string, number[]>();

    // Fetch all videos per channel to calculate accurate averages
    for (const cid of channelIds) {
      const channelVids = await prisma.video.findMany({
        where: { channelId: cid },
        select: { views: true },
      });
      channelVideosMap.set(
        cid,
        channelVids.map((v) => v.views)
      );
    }

    // Enrich with outlier data
    const enrichedVideos = videos.map((video) => {
      const viewCounts = channelVideosMap.get(video.channelId) || [video.views];
      const stats = calculateOutlierStats(viewCounts);
      const multiplier = getOutlierMultiplier(video.views, viewCounts);

      return {
        ...video,
        isOutlier: multiplier > 1.5, // Consider outlier if > 1.5x average
        outlierMultiplier: multiplier,
        channelMean: stats.mean,
        channelStdDev: stats.stdDev,
      };
    });

    // Filter by outlier multiplier
    let filteredVideos = enrichedVideos;
    if (minOutlier || maxOutlier) {
      filteredVideos = enrichedVideos.filter((v) => {
        const mult = v.outlierMultiplier;
        if (minOutlier && mult < Number(minOutlier)) return false;
        if (maxOutlier && mult > Number(maxOutlier)) return false;
        return true;
      });
    }

    return NextResponse.json({ videos: filteredVideos, total });
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
