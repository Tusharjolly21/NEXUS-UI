import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchExplorer } from "@/components/search/search-explorer";

export const metadata: Metadata = {
  title: "Search — Nexus UI",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-sm text-zinc-400">Loading search…</div>}
    >
      <SearchExplorer />
    </Suspense>
  );
}
