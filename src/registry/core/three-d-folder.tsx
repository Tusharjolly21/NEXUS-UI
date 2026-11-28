"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { ThreeDFolder } from "@/components/three-d-folder";

export function PreviewThreeDFolder() {
  return (
    <div className="grid min-h-[360px] overflow-hidden rounded-3xl border border-zinc-200 bg-[radial-gradient(circle_at_20%_20%,rgba(251,113,133,.18),transparent_32%),#f8fafc] p-5 dark:border-white/10 dark:bg-[radial-gradient(circle_at_20%_20%,rgba(251,113,133,.12),transparent_32%),#050505] md:grid-cols-[0.95fr_1.05fr] md:p-7">
      <div className="flex items-center justify-center">
        <ThreeDFolder
          title="Launch Assets"
          folderBackColor="#fb7185"
          folderFrontColor="#facc15"
          folderTabColor="#f97316"
          className="scale-[0.92]"
        />
      </div>
      <div className="flex flex-col justify-center px-2 py-6 md:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-rose-500/80 dark:text-rose-300/70">
          Portfolio folder
        </p>
        <h3 className="mt-3 max-w-md text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
          Hover the folder to reveal stacked project previews.
        </h3>
        <p className="mt-4 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          A compact interactive card for project archives, case studies, moodboards,
          product shots, or any visual collection that deserves a little depth.
        </p>
      </div>
    </div>
  );
}
