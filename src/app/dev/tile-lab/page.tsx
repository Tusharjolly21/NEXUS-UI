import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TileLabStage } from "./stage";

export const metadata: Metadata = { title: "Tile lab", robots: { index: false, follow: false } };

/**
 * Development-only stage used by `scripts/measure-tiles.mjs`: renders one gallery preview on a
 * fixed canvas over a sentinel colour so the script can find the component's real footprint.
 * Not served in production unless TILE_LAB=1 (for measuring against a production build).
 */
export default function TileLabPage() {
  if (process.env.NODE_ENV === "production" && process.env.TILE_LAB !== "1") notFound();
  return <TileLabStage />;
}
