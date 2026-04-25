"use client";

import { useState } from "react";
import Image from "next/image";
import { Users, Video, Eye, CheckCircle } from "lucide-react";

interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}

interface ChannelCardProps {
  channel: Channel;
  onTrack: (channelId: string) => void;
  tracked: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

export default function ChannelCard({ channel, onTrack, tracked }: ChannelCardProps) {
  const [tracking, setTracking] = useState(false);

  const handleTrack = async () => {
    if (tracked || tracking) return;
    setTracking(true);
    await onTrack(channel.id);
    setTracking(false);
  };

  return (
    <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 hover:border-neutral-700 transition-colors">
      <div className="flex items-start gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-neutral-800">
          {channel.thumbnailUrl ? (
            <Image
              src={channel.thumbnailUrl}
              alt={channel.title}
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-700">
              <span className="text-neutral-500 text-xs">No img</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white truncate">{channel.title}</h3>
          <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{channel.description || "No description available."}</p>

          <div className="flex flex-wrap gap-3 mt-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {formatNumber(channel.subscriberCount)} subs
            </span>
            <span className="flex items-center gap-1">
              <Video className="w-3.5 h-3.5" />
              {formatNumber(channel.videoCount)} videos
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {formatNumber(channel.viewCount)} views
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleTrack}
        disabled={tracked || tracking}
        className={`mt-4 w-full py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
          tracked
            ? "bg-emerald-500/20 text-emerald-400 cursor-default"
            : "bg-white text-black hover:bg-neutral-200 disabled:opacity-60"
        }`}
      >
        {tracked ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Tracked
          </>
        ) : tracking ? (
          "Tracking..."
        ) : (
          "Track Channel"
        )}
      </button>
    </div>
  );
}
