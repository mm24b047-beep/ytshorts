"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import VideoCard from "@/components/VideoCard";
import { VideoSkeleton } from "@/components/SkeletonCard";
import { RefreshCw, SearchX, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

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

interface Video {
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
    youtubeId: string;
    thumbnailUrl?: string;
  };
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Channel[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());

  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [totalVideos, setTotalVideos] = useState(0);
  const [page, setPage] = useState(1);

  const [postedRange, setPostedRange] = useState("all");
  const [minViews, setMinViews] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [minOutlier, setMinOutlier] = useState("");
  const [maxOutlier, setMaxOutlier] = useState("");
  const [sortBy, setSortBy] = useState("publishedAt-desc");
  const [perPage, setPerPage] = useState("60");
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrackedChannels();
  }, []);

  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postedRange, minViews, maxViews, minOutlier, maxOutlier, sortBy, perPage, page, selectedChannelId]);

  async function fetchTrackedChannels() {
    try {
      const res = await fetch("/api/channels?tracked=true");
      if (res.ok) {
        const data = await res.json();
        const ids = new Set<string>(data.map((c: Channel) => c.youtubeId));
        setTrackedIds(ids);
      }
    } catch {
      // ignore
    }
  }

  async function fetchVideos() {
    setVideosLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", perPage);
      if (postedRange !== "all") params.set("postedRange", postedRange);
      if (minViews) params.set("minViews", minViews);
      if (maxViews) params.set("maxViews", maxViews);
      if (minOutlier) params.set("minOutlier", minOutlier);
      if (maxOutlier) params.set("maxOutlier", maxOutlier);
      if (selectedChannelId) params.set("channelId", selectedChannelId);
      const [sortField, sortOrder] = sortBy.split("-");
      params.set("sortBy", sortField);
      params.set("sortOrder", sortOrder);

      const res = await fetch(`/api/videos?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos);
        setTotalVideos(data.total);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to fetch videos.");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setVideosLoading(false);
    }
  }

  async function handleSearch(query: string) {
    setQuery(query);
    setSearchLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/channels?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          // Automatically track the first matched channel
          const bestMatchId = data[0].id;
          setSelectedChannelId(bestMatchId);
          await handleTrack(bestMatchId);
        } else {
          setError("No channels found for that search.");
        }
        setSearchResults([]);
      } else {
        const data = await res.json();
        setError(data.error || "Search failed. Please try again.");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Network error. Please check your connection.");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleTrack(channelId: string) {
    setError(null);
    try {
      const res = await fetch(`/api/channels/${channelId}/track`, {
        method: "POST",
      });
      if (res.ok) {
        setTrackedIds((prev) => new Set(prev).add(channelId));
        setPage(1);
        await fetchVideos();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to track channel.");
      }
    } catch (error) {
      console.error("Track error:", error);
      setError("Network error while tracking channel.");
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
    } catch (error) {
      console.error("Sync error:", error);
      setError("Network error during sync.");
    } finally {
      setSyncing(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalVideos / Number(perPage)));
  const startIdx = (page - 1) * Number(perPage) + 1;
  const endIdx = Math.min(page * Number(perPage), totalVideos);

  return (
    <div className="flex min-h-screen bg-neutral-950">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between bg-neutral-950">
          <h1 className="text-2xl font-bold text-white tracking-tight">Videos</h1>
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
          {/* Search */}
          <SearchBar onSearch={handleSearch} loading={searchLoading} />

          {error && (
            <div className="p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Something went wrong</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <FilterBar
            postedRange={postedRange}
            minViews={minViews}
            maxViews={maxViews}
            minOutlier={minOutlier}
            maxOutlier={maxOutlier}
            sortBy={sortBy}
            perPage={perPage}
            onPostedRangeChange={(val) => { setPostedRange(val); setPage(1); }}
            onMinViewsChange={setMinViews}
            onMaxViewsChange={setMaxViews}
            onMinOutlierChange={setMinOutlier}
            onMaxOutlierChange={setMaxOutlier}
            onSortByChange={(val) => { setSortBy(val); setPage(1); }}
            onPerPageChange={(val) => { setPerPage(val); setPage(1); }}
          />

          {/* Video Grid */}
          <div>
            {videosLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {Array.from({ length: Number(perPage) }, (_, i) => (
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
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4">
                  <SearchX className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium">No shorts tracked yet</p>
                <p className="text-sm mt-1 max-w-md text-center">
                  Search for a channel above and click <span className="text-neutral-300 font-medium">Track</span> to start collecting shorts.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
