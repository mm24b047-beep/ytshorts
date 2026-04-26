"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import VideoCard from "@/components/VideoCard";
import { VideoSkeleton } from "@/components/SkeletonCard";
import {
  RefreshCw,
  Users,
  Video,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

interface Channel {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}

interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  isOutlier: boolean;
  outlierMultiplier: number;
  channelMean: number;
  channelStdDev: number;
  channel: {
    id: string;
    title: string;
    thumbnailUrl?: string;
  };
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

export default function CreatorVideosPage() {
  const params = useParams();
  const channelId = params.id as string;

  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [channelLoading, setChannelLoading] = useState(true);
  const [totalVideos, setTotalVideos] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(60);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (channelId) {
      fetchChannel();
      fetchVideos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, page]);

  async function fetchChannel() {
    setChannelLoading(true);
    try {
      const res = await fetch(`/api/channels?tracked=true`);
      if (res.ok) {
        const data: Channel[] = await res.json();
        const found = data.find((c) => c.id === channelId || c.youtubeId === channelId);
        if (found) {
          setChannel(found);
        } else {
          setError("Creator not found.");
        }
      } else {
        setError("Failed to load creator.");
      }
    } catch {
      setError("Network error while loading creator.");
    } finally {
      setChannelLoading(false);
    }
  }

  async function fetchVideos() {
    setVideosLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(perPage));
      params.set("channelId", channelId);
      params.set("sortBy", "publishedAt");
      params.set("sortOrder", "desc");

      const res = await fetch(`/api/videos?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos);
        setTotalVideos(data.total);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to fetch videos.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setVideosLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (res.ok) {
        setPage(1);
        await fetchVideos();
      } else {
        const data = await res.json();
        setError(data.error || "Sync failed.");
      }
    } catch {
      setError("Network error during sync.");
    } finally {
      setSyncing(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalVideos / perPage));
  const startIdx = (page - 1) * perPage + 1;
  const endIdx = Math.min(page * perPage, totalVideos);

  return (
    <div className="flex min-h-screen bg-neutral-950">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            <Link
              href="/creators"
              className="p-2 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {channelLoading ? "Loading..." : channel?.title || "Creator"}
            </h1>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync All"}
          </button>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Something went wrong</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Creator Info Card */}
          {channel && !channelLoading && (
            <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 flex items-start gap-5">
              <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-neutral-800">
                {channel.thumbnailUrl ? (
                  <Image
                    src={channel.thumbnailUrl}
                    alt={channel.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-700 text-xl font-bold text-neutral-400">
                    {channel.title.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white truncate">{channel.title}</h2>
                <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                  {channel.description || "No description available."}
                </p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {formatNumber(channel.subscriberCount)} subscribers
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Video className="w-4 h-4" />
                    {formatNumber(channel.videoCount)} videos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {formatNumber(channel.viewCount)} views
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Videos Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Videos</h3>
            {videosLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {Array.from({ length: perPage }, (_, i) => (
                  <VideoSkeleton key={i} />
                ))}
              </div>
            ) : videos.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-800">
                  <p className="text-sm text-neutral-500">
                    {startIdx}-{endIdx} of {totalVideos}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-2 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-neutral-400 px-2">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="p-2 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
                <Video className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">No videos yet</p>
                <p className="text-sm mt-1 max-w-md text-center">
                  Sync the channel to fetch their shorts.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
