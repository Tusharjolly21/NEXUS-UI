"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { CinematicLogoCloud } from "@/components/cinematic-logo-cloud";

const LOGO_CLOUD_MARQUEE_CLIENTS = [
  { name: "Stripe", slug: "stripe" },
  { name: "Figma", slug: "figma", invertDark: true },
  { name: "Framer", slug: "framer" },
  { name: "Linear", slug: "linear", invertDark: true },
  { name: "Vercel", slug: "vercel", invertDark: true },
  { name: "GitHub", slug: "github", invertDark: true },
  { name: "Notion", slug: "notion", invertDark: true },
  { name: "Raycast", slug: "raycast" },
  { name: "Loom", slug: "loom" },
  { name: "Intercom", slug: "intercom" },
  { name: "Twitch", slug: "twitch" },
];

export function PreviewCinematicLogoCloudMarquee() {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950">
      <CinematicLogoCloud
        clients={LOGO_CLOUD_MARQUEE_CLIENTS}
        variant="marquee"
        eyebrow="Integrates with your entire stack."
        className="bg-transparent dark:bg-transparent py-10"
      />
    </div>
  );
}
