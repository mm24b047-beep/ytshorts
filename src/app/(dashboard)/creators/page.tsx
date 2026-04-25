"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { RefreshCw, Users, Video, Eye, AlertCircle } from "lucide-react";

interface Channel {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  trackedAt: string;
  lastSyncedAt: string;
  _count?: {
    videos: number;
  };
}

export default function CreatorsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  async function fetchChannels() {
    setLoading(true);
    try {
      const res = await fetch("/api/channels?tracked=true");
      if (res.ok) {
        const data = await res.json();
        // Fetch video counts for each channel
        const enriched = await Promise.all(
          data.map(async (channel: Channel) => {
            const countRes = await fetch(`/api/videos?channelId=${channel.id}&limit=1`);
            const countData = await countRes.json();
            return {
              ...channel,
              _count: { videos: countData.total || 0 },
            };
          })
        );
        setChannels(enriched);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      setError("Failed to load creators.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (res.ok) {
        await fetchChannels();
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

  function formatNumber(num: number): string {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  }

  return (
    <div className="flex min-h-screen bg-neutral-950">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between bg-neutral-950">
          <h1 className="text-2xl font-bold text-white tracking-tight">Creators</h1>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync All"}
          </button>
        </div>

        <div className="flex-1 px-6 py-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Something went wrong</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 animate-pulse h-40" />
              ))}
            </div>
          ) : channels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center text-lg font-bold text-neutral-400">
                      {channel.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-white truncate">{channel.title}</h3>
                      <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                        {channel.description || "No description available."}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-neutral-800">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-neutral-400 text-xs mb-1">
                        <Users className="w-3.5 h-3.5" />
                        Subs
                      </div>
                      <div className="text-white font-semibold text-sm">{formatNumber(channel.subscriberCount)}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-neutral-400 text-xs mb-1">
                        <Video className="w-3.5 h-3.5" />
                        Videos
                      </div>
                      <div className="text-white font-semibold text-sm">{channel._count?.videos || 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-neutral-400 text-xs mb-1">
                        <Eye className="w-3.5 h-3.5" />
                        Views
                      </div>
                      <div className="text-white font-semibold text-sm">{formatNumber(channel.viewCount)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
              <Users className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">No creators tracked yet</p>
              <p className="text-sm mt-1 max-w-md text-center">
                Go to the Videos tab and search for a channel to start tracking.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
