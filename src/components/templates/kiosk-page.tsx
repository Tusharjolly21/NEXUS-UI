"use client";

/**
 * Kiosk: an independent magazine about design, technology and the details of a good life. It is a whole small site
 * in one page: a home page (hero carousel, the desks, latest stories, an editors' picks rail, most read with a
 * cursor preview, newsletter), an articles index with search, filters, sort and grid or list layouts, a page per
 * desk, a story page with reading progress, a following table of contents, claps and share buttons, an about page,
 * a contact form, privacy and terms, and a 404. Search opens with Cmd/Ctrl+K or /, stories can be saved to a
 * reading list, and a custom cursor names what a link does.
 *
 * Pages live in the URL hash (#/article/<slug>), so it runs anywhere without a router; see kiosk/router.ts to move
 * them into real routes. Every name, story and figure is invented sample content in kiosk/data.ts, the covers are
 * drawn in SVG (kiosk/cover.tsx), the writers' faces are Notionists by Zoish (CC0) and the fonts are self-hosted.
 */

import { MotionConfig } from "framer-motion";
import { KioskApp } from "./kiosk/app";

export function KioskPage() {
  return (
    <MotionConfig reducedMotion="user">
      <KioskApp />
    </MotionConfig>
  );
}
