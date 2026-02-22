"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, History, Settings } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    if (isActive) {
      return "flex items-center gap-3 px-3 py-2 text-zinc-900 bg-white rounded-xl shadow-sm border border-zinc-100 font-medium relative before:absolute before:inset-y-0 before:-left-4 before:w-1 before:bg-red-500 before:rounded-r-md";
    }
    return "flex items-center gap-3 px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl font-medium transition-colors border border-transparent";
  };

  const getIconClass = (path: string) => {
    return pathname === path ? "w-5 h-5 text-red-500" : "w-5 h-5";
  };

  return (
    <aside className="w-64 border-r border-zinc-200 bg-zinc-50 flex flex-col h-screen p-4 flex-shrink-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white font-bold">
          PDF
        </div>
        <span className="font-semibold text-lg text-zinc-900">TraditPDF</span>
      </div>

      <nav className="flex-1 space-y-1">
        <Link href="/" className={getLinkClass("/")}>
          <Folder className={getIconClass("/")} />
          My Files
        </Link>
        <Link href="/history" className={getLinkClass("/history")}>
          <History className={getIconClass("/history")} />
          History
        </Link>
        <Link href="/settings" className={getLinkClass("/settings")}>
          <Settings className={getIconClass("/settings")} />
          Settings
        </Link>
      </nav>

      <div className="mt-auto px-2 pt-4 border-t border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold overflow-hidden">
            <span className="sr-only">JD</span>
            <span className="text-sm">JD</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900 leading-tight">John Doe</span>
            <span className="text-xs text-zinc-500">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
