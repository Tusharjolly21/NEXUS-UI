"use client";

import dynamic from "next/dynamic";

const YourBrandHeroPage = dynamic(
  () => import("@/components/templates/yourbrand-hero-page"),
  {
    ssr: false,
    loading: () => <div className="min-h-screen animate-pulse bg-background" aria-hidden />,
  },
);

export function YourBrandClient() {
  return <YourBrandHeroPage />;
}
