import axios from "axios";

const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

const youtubeClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export interface YoutubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}

export interface YoutubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: Date;
  views: number;
  likes: number;
  comments: number;
  duration: string;
}

export function getApiKey(): string | undefined {
  return API_KEY;
}

function handleApiError(error: any): never {
  if (error.response?.data?.error) {
    const apiError = error.response.data.error;
    if (apiError.code === 403 && apiError.errors?.some((e: any) => e.reason === "quotaExceeded")) {
      throw new Error(
        "YouTube API quota exceeded. The daily limit (10,000 units) has been reached. Please try again tomorrow."
      );
    }
    if (apiError.message) {
      throw new Error(`YouTube API error: ${apiError.message}`);
    }
  }
  if (error.code === "ECONNABORTED") {
    throw new Error("Request timed out. Please check your internet connection.");
  }
  throw new Error(error.message || "Failed to fetch data from YouTube.");
}

export async function searchChannels(query: string): Promise<YoutubeChannel[]> {
  try {
    const response = await youtubeClient.get("/search", {
      params: {
        part: "snippet",
        type: "channel",
        q: query,
        maxResults: 10,
        key: API_KEY,
      },
    });

    const items = response.data.items || [];
    if (items.length === 0) return [];

    const channelIds = items
      .map((item: any) => item.id?.channelId)
      .filter(Boolean)
      .join(",");

    if (!channelIds) return [];

    const detailsResponse = await youtubeClient.get("/channels", {
      params: {
        part: "snippet,statistics",
        id: channelIds,
        key: API_KEY,
      },
    });

    const channels: YoutubeChannel[] = (detailsResponse.data.items || []).map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description || "",
      thumbnailUrl:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        "",
      subscriberCount: Number(item.statistics?.subscriberCount || 0),
      videoCount: Number(item.statistics?.videoCount || 0),
      viewCount: Number(item.statistics?.viewCount || 0),
    }));

    return channels;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getChannelShorts(channelId: string): Promise<YoutubeVideo[]> {
  try {
    const searchResponse = await youtubeClient.get("/search", {
      params: {
        part: "snippet",
        channelId,
        type: "video",
        videoDuration: "short",
        order: "date",
        maxResults: 50,
        key: API_KEY,
      },
    });

    const items = searchResponse.data.items || [];
    if (items.length === 0) return [];

    const videoIds = items
      .map((item: any) => item.id?.videoId)
      .filter(Boolean)
      .join(",");

    if (!videoIds) return [];

    const videoResponse = await youtubeClient.get("/videos", {
      params: {
        part: "snippet,statistics,contentDetails",
        id: videoIds,
        key: API_KEY,
      },
    });

    const videos: YoutubeVideo[] = (videoResponse.data.items || [])
      .filter((item: any) => item.id && item.snippet)
      .map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description || "",
        thumbnailUrl:
          item.snippet.thumbnails?.high?.url ||
          item.snippet.thumbnails?.medium?.url ||
          item.snippet.thumbnails?.default?.url ||
          "",
        publishedAt: new Date(item.snippet.publishedAt),
        views: Number(item.statistics?.viewCount || 0),
        likes: Number(item.statistics?.likeCount || 0),
        comments: Number(item.statistics?.commentCount || 0),
        duration: item.contentDetails?.duration || "",
      }));

    return videos;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getChannelDetails(channelId: string): Promise<YoutubeChannel | null> {
  try {
    const response = await youtubeClient.get("/channels", {
      params: {
        part: "snippet,statistics",
        id: channelId,
        key: API_KEY,
      },
    });

    const items = response.data.items || [];
    if (items.length === 0) return null;

    const item = items[0];
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description || "",
      thumbnailUrl:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        "",
      subscriberCount: Number(item.statistics?.subscriberCount || 0),
      videoCount: Number(item.statistics?.videoCount || 0),
      viewCount: Number(item.statistics?.viewCount || 0),
    };
  } catch (error) {
    handleApiError(error);
  }
}
