/**
 * Search-facing <title>/<meta description> overrides for component pages.
 * The catalog `name`/`description` stay as the on-page copy; these target the phrases
 * Search Console shows people actually typing (pages ranking ~5–30 with no clicks yet).
 */
export const COMPONENT_SEO: Record<string, { title: string; description: string }> = {
  "milestone-timeline": {
    title: "React Timeline Component — Project Milestone Roadmap",
    description:
      "Animated React timeline component for project roadmaps and milestones: a vertical timeline UI with glowing nodes, built with Tailwind CSS and Framer Motion for Next.js.",
  },
  "hover-highlight-text": {
    title: "Hover Highlight Text — React Text Highlight Animation",
    description:
      "React hover highlight effect: a cursor-tracked spotlight reveals outlined text with spring physics. Copy-paste Tailwind CSS + Framer Motion component for Next.js.",
  },
  "cinematic-logo-cloud": {
    title: "React Logo Cloud — Animated Brand Logo Section",
    description:
      "Animated React logo cloud for social proof: brand logos enter with a staggered blur-fade, in a responsive logo wall or marquee-style strip. Tailwind CSS + Framer Motion.",
  },
  "beam-sweep-field": {
    title: "Beam Sweep — Animated Light Beam Background for React",
    description:
      "Beam sweep background for React: a slow sweeping light column for cinematic hero and section backgrounds. Lightweight Tailwind CSS + Framer Motion component.",
  },
  "image-trail": {
    title: "Image Trail Effect — React Cursor Image Trail",
    description:
      "React image trail effect: images follow the cursor and fade out behind it. A copy-paste cursor image trail component for Next.js, built with Tailwind CSS and Framer Motion.",
  },
  "draggable-card-stack": {
    title: "Draggable Cards UI — React Draggable Card Stack",
    description:
      "Draggable cards UI for React: swipe or drag cards off a stacked deck with spring physics. Copy-paste Tailwind CSS + Framer Motion component for Next.js.",
  },
  "orbital-loader": {
    title: "Orb Loader — Animated React Orbital Loading Spinner",
    description:
      "Orb loader for React: dual counter-rotating rings around a breathing glowing core. A lightweight animated loading spinner built with Tailwind CSS and Framer Motion.",
  },
  "chat-messages": {
    title: "React Chat Messages — Animated Chat Bubble UI",
    description:
      "Animated React chat messages: chat bubbles with typing indicators and a sequential reveal, for AI assistants and messaging UIs. Tailwind CSS + Framer Motion.",
  },
};
