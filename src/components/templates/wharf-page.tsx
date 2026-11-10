"use client";

/**
 * Wharf: a landing page for an onchain settlement layer, where a business takes any token in and settles in
 * stablecoins across 30 chains. A live chain map and a settlement card play through a payment in the hero; then
 * come a three-step walkthrough with a requoting countdown, the rails (each with its own animated drawing), customer
 * logos and corridors, a developer section that runs code samples against a fake API, a testimonial, security, a FAQ,
 * a call to action over a falling field of glyphs, and a footer with a newsletter form.
 *
 * Every company, figure, chain and quote is invented sample content in wharf/data.ts, and Wharf Labs is fictional.
 * The fonts (Geist and Geist Mono) are self-hosted from /public/fonts/wharf.
 */

import { MotionConfig } from "framer-motion";
import { WharfApp } from "./wharf/app";

export function WharfPage() {
  return (
    <MotionConfig reducedMotion="user">
      <WharfApp />
    </MotionConfig>
  );
}
