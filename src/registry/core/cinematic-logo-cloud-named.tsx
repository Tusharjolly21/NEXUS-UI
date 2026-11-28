"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { CinematicLogoCloud } from "@/components/cinematic-logo-cloud";

const LOGO_CLOUD_NAMED_CLIENTS = [
  { name: "Stripe",    slug: "stripe",    nameClassName: "font-sans font-semibold tracking-tight" },
  { name: "Figma",     slug: "figma",     invertDark: true, nameClassName: "font-sans font-semibold tracking-tight" },
  { name: "Framer",    slug: "framer",    nameClassName: "font-sans font-medium" },
  { name: "Linear",    slug: "linear",    invertDark: true, nameClassName: "font-sans font-medium tracking-tight" },
  { name: "Vercel",    slug: "vercel",    invertDark: true, nameClassName: "font-sans font-bold tracking-tight" },
  { name: "GitHub",    slug: "github",    invertDark: true, nameClassName: "font-sans font-semibold" },
  { name: "Notion",    slug: "notion",    invertDark: true, nameClassName: "font-sans font-medium" },
  { name: "Raycast",   slug: "raycast",   nameClassName: "font-sans font-semibold tracking-tight" },
  { name: "Loom",      slug: "loom",      nameClassName: "font-sans font-bold tracking-tight" },
  { name: "Intercom",  slug: "intercom",  nameClassName: "font-sans font-bold" },
  { name: "Twitch",    slug: "twitch",    nameClassName: "font-sans font-black tracking-tight" },
  { name: "Spotify",   slug: "spotify",   nameClassName: "font-sans font-black tracking-tight" },
];

export function PreviewCinematicLogoCloudNamed() {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950">
      <CinematicLogoCloud
        clients={LOGO_CLOUD_NAMED_CLIENTS}
        variant="marquee-named"
        eyebrow="Used by teams at the world's best companies."
        className="bg-transparent dark:bg-transparent py-10"
      />
    </div>
  );
}
