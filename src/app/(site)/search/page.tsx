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
      fallback={<div className="min-h-[60vh]" aria-busy="true" />}
    >
      <SearchExplorer />
    </Suspense>
  );
}
