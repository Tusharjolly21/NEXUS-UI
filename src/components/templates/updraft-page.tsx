"use client";

/**
 * Updraft: a bright landing page for an invented coding agent that works across a desktop app, the terminal, the
 * editor and a component kit. The hero types its headline over a field of spectrum dots that lean toward the pointer;
 * below come a product tour where tasks plan, edit and test themselves, a strip of the tools it works with, the four
 * places it runs (a sticky scroll-linked tour), scenes for founders, platform, mobile and agency teams, plans, a
 * journal carousel, a newsletter form, a download call to action with letters that swell under the pointer, and the
 * footer. Every download button opens one platform dialog.
 *
 * Updraft and every person, team, figure and post are invented sample content. The icons are Phosphor (MIT), and Onest
 * and Geist Mono are self-hosted.
 */

import { MotionConfig } from "framer-motion";
import { UpdraftApp } from "./updraft/app";

export function UpdraftPage() {
  return (
    <MotionConfig reducedMotion="user">
      <UpdraftApp />
    </MotionConfig>
  );
}
