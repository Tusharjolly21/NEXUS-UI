import { notFound } from "next/navigation";

// /c/global/... and /c/in/... are the cached copies of pages for signed-out visitors (see next.config.mjs). Visitors never
// type these addresses; anything else under /c is not a page.
export default async function CachedRegionLayout({ children, params }: { children: React.ReactNode; params: Promise<{ region: string }> }) {
  const { region } = await params;
  if (region !== "global" && region !== "in") notFound();
  return children;
}
