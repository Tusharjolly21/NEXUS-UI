"use client";

/**
 * Plotline: a landing page for a product-planning tool (requests, roadmaps and releases in one workspace). The hero
 * holds a working app mock in a browser frame: a timeline whose bar you drag while linked projects follow, a board,
 * a task list and weekly updates, with teammates' cursors and a weekly update that types itself. Then come a logo
 * wall, how it works in four live demos (a request inbox you upvote, a roadmap board, tracking, release notes), stats
 * that count up, the new weekly-update feature, customer stories with drawings that play on hover, a quote, pricing
 * with a team-size slider, a FAQ, a changelog and a call to action on a painted sky.
 *
 * Every company, person, figure and quote is invented sample content, the faces are Notionists by Zoish (CC0) and
 * the fonts (Inter Tight and Geist) are self-hosted from /public/fonts/plotline.
 */

import { MotionConfig } from "framer-motion";
import { PlotlineApp } from "./plotline/app";

export function PlotlinePage() {
  return (
    <MotionConfig reducedMotion="user">
      <PlotlineApp />
    </MotionConfig>
  );
}
