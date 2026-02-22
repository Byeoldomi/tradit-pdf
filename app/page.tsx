import { Bell, CircleHelp, FileUp, Languages } from "lucide-react";
import { UploadZone } from "./components/upload-zone";
import { RecentFiles } from "./components/recent-files";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col p-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-10 w-full">
        <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
          Dashboard
        </span>
        <div className="flex items-center gap-4 text-zinc-400">
          <button className="hover:text-zinc-800 transition-colors">
            <Bell className="w-5 h-5 fill-current" />
          </button>
          <button className="hover:text-zinc-800 transition-colors">
            <CircleHelp className="w-5 h-5 fill-current" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-10">
        <div>
          <h1 className="text-5xl font-extrabold text-zinc-900 tracking-tight mb-4">
            PDF Workspace
          </h1>
          <p className="text-xl text-zinc-500 font-medium max-w-2xl leading-relaxed">
            Manage and translate your documents instantly with our minimalist AI tools.
          </p>
        </div>

        {/* Upload Section */}
        <UploadZone />

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3.5 rounded-xl font-bold transition-colors shadow-sm">
            <FileUp className="w-5 h-5" />
            Upload PDF
          </button>
          <button className="flex items-center gap-2 bg-white hover:bg-red-50 border border-zinc-200 text-red-500 px-6 py-3.5 rounded-xl font-bold transition-colors shadow-sm">
            <Languages className="w-5 h-5" />
            Translate
          </button>
        </div>

        {/* Recent Files */}
        <div className="mt-8">
          <RecentFiles />
        </div>
      </div>
    </div>
  );
}
