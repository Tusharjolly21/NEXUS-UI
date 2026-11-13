"use client";

/**
 * Nightwatch: a dark, dawn-lit landing page for an invented on-call teammate that triages alerts, wakes only the right
 * person and drafts the postmortem. The hero draws a live latency chart on a canvas that spikes over the SLO and names
 * the alert; below come the product window replaying an incident timeline, a customer strip, features with small
 * playing demos (alert grouping, paging the right person, a runbook running itself, a service map, the postmortem
 * draft), testimonials, a paper plane carrying the page to a phone, a watch and a laptop, security, pricing, FAQ, a
 * call to action and the footer.
 *
 * Nightwatch and every customer, person, figure and quote are invented sample content. The faces are Notionists by
 * Zoish (CC0), the icons are Phosphor (MIT), and Instrument Sans and Geist Mono are self-hosted.
 */

import { MotionConfig } from "framer-motion";
import { NightwatchApp } from "./nightwatch/app";

export function NightwatchPage() {
  return (
    <MotionConfig reducedMotion="user">
      <NightwatchApp />
    </MotionConfig>
  );
}
