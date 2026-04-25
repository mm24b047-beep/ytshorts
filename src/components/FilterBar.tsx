"use client";

import { Filter } from "lucide-react";

interface FilterBarProps {
  postedRange: string; // "14d" | "30d" | "6mo" | "all"
  minViews: string;
  maxViews: string;
  minOutlier: string;
  maxOutlier: string;
  sortBy: string;
  perPage: string;
  onPostedRangeChange: (val: string) => void;
  onMinViewsChange: (val: string) => void;
  onMaxViewsChange: (val: string) => void;
  onMinOutlierChange: (val: string) => void;
  onMaxOutlierChange: (val: string) => void;
  onSortByChange: (val: string) => void;
  onPerPageChange: (val: string) => void;
}

const postedOptions = [
  { label: "14d", value: "14d" },
  { label: "30d", value: "30d" },
  { label: "6mo", value: "6mo" },
  { label: "All time", value: "all" },
];

export default function FilterBar({
  postedRange,
  minViews,
  maxViews,
  minOutlier,
  maxOutlier,
  sortBy,
  perPage,
  onPostedRangeChange,
  onMinViewsChange,
  onMaxViewsChange,
  onMinOutlierChange,
  onMaxOutlierChange,
  onSortByChange,
  onPerPageChange,
}: FilterBarProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-5">
      {/* Row 1: Posted + Views + Outlier */}
      <div className="flex flex-wrap items-center gap-8">
        {/* Posted */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            Posted
          </div>
          <div className="flex items-center gap-1">
            {postedOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onPostedRangeChange(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  postedRange === opt.value
                    ? "bg-white text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Views */}
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="text-neutral-400 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
            Views
          </div>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs text-neutral-500 w-4">0</span>
            <input
              type="range"
              min="0"
              max="10000000"
              step="100000"
              value={maxViews || "10000000"}
              onChange={(e) => onMaxViewsChange(e.target.value)}
              className="flex-1 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <span className="text-xs text-neutral-500 w-12 text-right">
              {maxViews ? `${(Number(maxViews) / 1_000_000).toFixed(0)}M+` : "10M+"}
            </span>
          </div>
        </div>

        {/* Outlier */}
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="text-neutral-400 text-xs font-semibold uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            Outlier
          </div>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs text-neutral-500 w-4">0x</span>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={minOutlier || "0"}
              onChange={(e) => onMinOutlierChange(e.target.value)}
              className="flex-1 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <span className="text-xs text-neutral-500 w-10 text-right">{minOutlier || "0"}x</span>
          </div>
        </div>
      </div>

      {/* Row 2: Creator + Sort + Per page */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-600"
        >
          <option value="publishedAt-desc">Newest first</option>
          <option value="publishedAt-asc">Oldest first</option>
          <option value="views-desc">Most views</option>
          <option value="views-asc">Least views</option>
          <option value="likes-desc">Most likes</option>
          <option value="likes-asc">Least likes</option>
        </select>

        <select
          value={perPage}
          onChange={(e) => onPerPageChange(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-600"
        >
          <option value="20">20 / page</option>
          <option value="40">40 / page</option>
          <option value="60">60 / page</option>
        </select>
      </div>
    </div>
  );
}
