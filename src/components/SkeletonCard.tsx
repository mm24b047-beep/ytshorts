"use client";

export function ChannelSkeleton() {
  return (
    <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-neutral-800 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-neutral-800 rounded w-3/4" />
          <div className="h-4 bg-neutral-800 rounded w-full" />
          <div className="h-4 bg-neutral-800 rounded w-5/6" />
          <div className="flex gap-3 pt-1">
            <div className="h-3 bg-neutral-800 rounded w-16" />
            <div className="h-3 bg-neutral-800 rounded w-16" />
            <div className="h-3 bg-neutral-800 rounded w-16" />
          </div>
        </div>
      </div>
      <div className="mt-4 h-9 bg-neutral-800 rounded-lg" />
    </div>
  );
}

export function VideoSkeleton() {
  return (
    <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 animate-pulse">
      <div className="aspect-[9/16] bg-neutral-800" />
      <div className="p-3 space-y-3">
        <div className="h-4 bg-neutral-800 rounded w-full" />
        <div className="h-4 bg-neutral-800 rounded w-3/4" />
        <div className="flex gap-3 pt-1">
          <div className="h-3 bg-neutral-800 rounded w-14" />
          <div className="h-3 bg-neutral-800 rounded w-14" />
          <div className="h-3 bg-neutral-800 rounded w-14" />
        </div>
      </div>
    </div>
  );
}
