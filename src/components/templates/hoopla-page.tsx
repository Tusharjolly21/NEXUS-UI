"use client";

/**
 * Hoopla: a loud, sticker-covered site for a small social content studio. A sticker intro flies up the screen, then
 * "We make posts people can't skip" rises in with eyes that follow the pointer, a looping reel of post formats and
 * stickers you can drag. Below: an about paragraph that lights up word by word, the crew, case studies in cloud
 * cards, stacked service cards, superpowers, a three-step process, a client marquee, why us, results that count up,
 * testimonials as chat bubbles, a call to action and a footer of wavy pills. A custom cursor names what links do.
 *
 * Hoopla and every client, person, figure and quote are invented sample content, the faces are Notionists by Zoish
 * (CC0), every picture is drawn in SVG, and the fonts (Anton, Inter Tight and Caveat) are self-hosted.
 */

import { MotionConfig } from "framer-motion";
import { HooplaApp } from "./hoopla/app";

export function HooplaPage() {
  return (
    <MotionConfig reducedMotion="user">
      <HooplaApp />
    </MotionConfig>
  );
}
