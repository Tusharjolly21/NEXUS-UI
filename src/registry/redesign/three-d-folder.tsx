"use client";

import { ThreeDFolder } from "@/components/three-d-folder";

export function PreviewThreeDFolderRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <ThreeDFolder autoplay title="Launch Assets" hint={compact ? "" : undefined} />
    </div>
  );
}

const GRID = [
  { title: "Brand", back: "#3d9cf0", front: "#6cb8f6" },
  { title: "Photos", back: "#ff9f0a", front: "#ffbf4d" },
  { title: "Product", back: "#30b65a", front: "#5fd47f" },
];

export function PreviewThreeDFolderGridRedesign() {
  return (
    <div className="relative flex h-full min-h-[360px] w-full flex-wrap items-center justify-center gap-4 p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      {GRID.map((g) => (
        <ThreeDFolder key={g.title} size="sm" title={g.title} folderBackColor={g.back} folderFrontColor={g.front} />
      ))}
    </div>
  );
}
