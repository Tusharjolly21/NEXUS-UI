"use client";

/**
 * Outpost: a dark landing page for an invented GPU inference platform that serves open models from eight regions and
 * answers each request from the one nearest the user. The hero opens on a dusk desert and a live console (latency,
 * throughput and a request feed by region); below come product features with playing demo cards, an endpoint builder
 * you wire up by dragging nodes, a dot-map of the network you can click to send a request, code snippets with running
 * output, a model catalog, pricing with a monthly or yearly switch, a call to action and the footer.
 *
 * Outpost and every customer, person, figure and quote are invented sample content. The faces are Notionists by
 * Zoish (CC0), the icons are Phosphor (MIT), every other picture is drawn in SVG or on a canvas, and the fonts
 * (Inter and Geist Mono) are self-hosted.
 */

import { MotionConfig } from "framer-motion";
import { OutpostApp } from "./outpost/app";

export function OutpostPage() {
  return (
    <MotionConfig reducedMotion="user">
      <OutpostApp />
    </MotionConfig>
  );
}
