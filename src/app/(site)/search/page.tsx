import { Suspense } from "react";
import { SearchExplorer } from "@/components/search/search-explorer";

export default function SearchPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-sm text-zinc-400">Loading search…</div>}
    >
      <SearchExplorer />
    </Suspense>
  );
}
