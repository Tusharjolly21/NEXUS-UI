"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { CinematicLogoCloud } from "@/components/cinematic-logo-cloud";

const LOGO_CLOUD_GRID_CLIENTS = [
  { name: "OpenAI", text: true, className: "font-sans font-semibold tracking-tight text-zinc-900 dark:text-white" },
  { name: "hello patient", text: true, className: "font-serif lowercase tracking-tight" },
  { name: "granola", text: true, className: "font-sans font-bold tracking-tighter" },
  { name: "character.ai", text: true, className: "font-bold tracking-tighter lowercase" },
  { name: "ORACLE", text: true, className: "font-sans font-black tracking-widest text-red-600 dark:text-red-500" },
  { name: "Portola", text: true, className: "font-serif tracking-widest uppercase" },
  { name: "Accel", text: true, className: "font-black tracking-tight" },
  { name: "Bloomberg", text: true, className: "font-sans font-black tracking-tighter text-zinc-900 dark:text-white" },
  { name: "Forbes", text: true, className: "font-serif font-bold tracking-tighter uppercase text-zinc-900 dark:text-white" },
  { name: "SoftBank", text: true, className: "font-sans font-bold tracking-tight text-zinc-900 dark:text-white" },
  { name: "The Guardian", slug: "theguardian", invertDark: true },
  { name: "WIRED", text: true, className: "font-sans font-black tracking-tighter text-zinc-900 dark:text-white" },
  { name: "hulu", text: true, className: "font-sans font-bold tracking-tighter text-[#1ce783] lowercase" },
  { name: "YouTube", slug: "youtube" },
  { name: "NETFLIX", slug: "netflix" },
  { name: "Spotify", slug: "spotify" },
  { name: "twitch", slug: "twitch" },
  { name: "Raycast", slug: "raycast" },
  { name: "Vercel", slug: "vercel", invertDark: true },
  { name: "Stripe", slug: "stripe" },
  { name: "Linear", slug: "linear", invertDark: true },
  { name: "GitHub", slug: "github", invertDark: true },
  { name: "Notion", slug: "notion", invertDark: true },
];

export function PreviewCinematicLogoCloudGrid() {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950">
      <CinematicLogoCloud
        clients={LOGO_CLOUD_GRID_CLIENTS}
        className="bg-transparent dark:bg-transparent py-10"
      />
    </div>
  );
}
