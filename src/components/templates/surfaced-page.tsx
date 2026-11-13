"use client";

/**
 * Surfaced: a dark landing page for an invented tool that asks AI assistants your buyers' questions every morning and
 * shows which pages to change so they name you. The hero runs a live check in a product dashboard (the question, the
 * searches the assistant made, its answer and the brands it named); below come a carousel of real-looking answers you
 * can drag, feature cards with small playing demos (a lens over a weak sentence, the morning check, a suggested
 * answer, share of voice), how it works in three steps, the four levels from findable to recommended on an isometric
 * stack that builds as you scroll, the daily loop, customers, pricing, FAQ and the footer.
 *
 * Surfaced, Calmchair and every customer, person, figure and quote are invented sample content. The assistants'
 * own app icons are shown only to name the assistant being checked; replace or remove them for your own product. The
 * faces are Notionists by Zoish (CC0), the icons are Phosphor (MIT), and Inter is self-hosted.
 */

import { MotionConfig } from "framer-motion";
import { SurfacedApp } from "./surfaced/app";

export function SurfacedPage() {
  return (
    <MotionConfig reducedMotion="user">
      <SurfacedApp />
    </MotionConfig>
  );
}
