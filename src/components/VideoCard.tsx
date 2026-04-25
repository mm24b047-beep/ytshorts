"use client";

import Image from "next/image";
import { Eye, Heart } from "lucide-react";

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
    thumbnailUrl?: string;
  };
}

interface VideoCardProps {
  video: Video;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "Today";
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`;
  return `${Math.floor(diffDays / 365)}y`;
}

export default function VideoCard({ video }: VideoCardProps) {
  const multiplier = video.outlierMultiplier > 0 ? video.outlierMultiplier.toFixed(1) : "0.0";

  return (
    <a
      href={`https://youtube.com/shorts/${video.youtubeId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-all"
    >
      {/* Thumbnail area */}
      <div className="relative aspect-[9/16] bg-neutral-800 overflow-hidden">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-800">
            <span className="text-neutral-500 text-xs">No thumbnail</span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute inset-x-0 top-0 p-2.5 flex items-start justify-between pointer-events-none">
          {video.isOutlier && (
            <div className="bg-emerald-500/90 backdrop-blur-sm text-black text-xs font-bold px-2 py-1 rounded-md flex items-center gap-0.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              </svg>
              {multiplier}x
            </div>
          )}
          <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-md">
            {formatRelativeTime(video.publishedAt)}
          </div>
        </div>
      </div>

      {/* Info area */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
          {video.title}
        </h3>

        {/* Creator row */}
        <div className="flex items-center gap-2 mt-2.5">
          {video.channel.thumbnailUrl ? (
            <Image
              src={video.channel.thumbnailUrl}
              alt={video.channel.title}
              width={20}
              height={20}
              className="rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-neutral-700 flex items-center justify-center text-[8px] text-neutral-400">
              {video.channel.title.charAt(0)}
            </div>
          )}
          <span className="text-xs text-neutral-400 truncate">{video.channel.title}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-2.5 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatNumber(video.views)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {formatNumber(video.likes)}
          </span>
          {video.isOutlier && (
            <span className="flex items-center gap-0.5 text-emerald-400">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              </svg>
              {multiplier}x
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
