import { prisma } from "./prisma";
import { YoutubeVideo } from "./youtube";

export async function upsertVideos(videos: YoutubeVideo[], channelId: string) {
  const results = [];
  for (const video of videos) {
    try {
      const existing = await prisma.video.findUnique({
        where: { youtubeId: video.id },
      });

      if (existing) {
        await prisma.video.update({
          where: { youtubeId: video.id },
          data: {
            views: video.views,
            likes: video.likes,
            comments: video.comments,
            fetchedAt: new Date(),
          },
        });
      } else {
        await prisma.video.create({
          data: {
            youtubeId: video.id,
            channelId,
            title: video.title,
            description: video.description,
            thumbnailUrl: video.thumbnailUrl,
            publishedAt: video.publishedAt,
            views: video.views,
            likes: video.likes,
            comments: video.comments,
            duration: video.duration,
          },
        });
      }
      results.push(video.id);
    } catch (error) {
      console.error(`Error upserting video ${video.id}:`, error);
    }
  }
  return results;
}
