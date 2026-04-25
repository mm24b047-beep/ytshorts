"use client";

import { Filter, TrendingUp, Eye, Play } from "lucide-react";

interface FilterPanelProps {
  minViews: string;
  maxViews: string;
  outliersOnly: boolean;
  shortsOnly?: boolean;
  sortBy: string;
  sortOrder: string;
  onMinViewsChange: (val: string) => void;
  onMaxViewsChange: (val: string) => void;
  onOutliersChange: (val: boolean) => void;
  onShortsOnlyChange?: (val: boolean) => void;
  onSortByChange: (val: string) => void;
  onSortOrderChange: (val: string) => void;
}

export default function FilterPanel({
  minViews,
  maxViews,
  outliersOnly,
  shortsOnly,
  sortBy,
  sortOrder,
  onMinViewsChange,
  onMaxViewsChange,
  onOutliersChange,
  onShortsOnlyChange,
  onSortByChange,
  onSortOrderChange,
}: FilterPanelProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-semibold text-gray-900">Filters & Sort</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="outliers"
            checked={outliersOnly}
            onChange={(e) => onOutliersChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <label htmlFor="outliers" className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            Show outliers only
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="shortsOnly"
            checked={shortsOnly || false}
            onChange={(e) => onShortsOnlyChange && onShortsOnlyChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <label htmlFor="shortsOnly" className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Play className="w-4 h-4 text-red-500" />
            Show shorts only
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Min Views</label>
            <div className="relative">
              <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={minViews}
                onChange={(e) => onMinViewsChange(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max Views</label>
            <div className="relative">
              <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={maxViews}
                onChange={(e) => onMaxViewsChange(e.target.value)}
                placeholder="∞"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="publishedAt">Published Date</option>
              <option value="views">Views</option>
              <option value="likes">Likes</option>
              <option value="comments">Comments</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => onSortOrderChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
