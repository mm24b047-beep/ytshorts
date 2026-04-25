"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Play, Users, Video } from "lucide-react";

const navItems = [
  { label: "Creators", href: "/creators", icon: Users },
  { label: "Videos", href: "/", icon: Video },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 border-r border-neutral-800 bg-neutral-950 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
          <Play className="w-4 h-4 text-white fill-white" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-white tracking-tight">Shorts</span>
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider border border-neutral-700 px-1 py-0.5 rounded">
            Beta
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 py-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom account */}
      <div className="px-3 py-3 border-t border-neutral-800">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-900 cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
            U
          </div>
          <span className="text-sm text-neutral-400">Account</span>
        </div>
      </div>
    </aside>
  );
}
