"use client";

/**
 * Tile previews for the Motion Kit blocks ported in the Nexus essentials batch "a": the team clock, the
 * stats odometer, the blog with contents, the waitlist CTA and the auth morph.
 */

import { AuthMorph } from "@/components/blocks/motion-kit/auth-morph";
import { BlogWithContents } from "@/components/blocks/motion-kit/blog-with-contents";
import { StatsOdometer } from "@/components/blocks/motion-kit/stats-odometer";
import { TeamClock } from "@/components/blocks/motion-kit/team-clock";
import { WaitlistCta } from "@/components/blocks/motion-kit/waitlist-cta";

export function PreviewBlockVariantMkTeamClock() {
  return (
    <div className="flex min-h-[640px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <TeamClock autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkStatsOdometer() {
  return (
    <div className="flex min-h-[460px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <StatsOdometer autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkBlogWithContents() {
  return (
    <div className="flex min-h-[700px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <BlogWithContents />
    </div>
  );
}

export function PreviewBlockVariantMkWaitlistCta() {
  return (
    <div className="flex min-h-[620px] w-full items-center bg-white dark:bg-black">
      <WaitlistCta autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkAuthMorph() {
  return (
    <div className="flex min-h-[700px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <AuthMorph autoplay />
    </div>
  );
}
