import type { Metadata } from "next";
import Link from "next/link";
import { Band, PillLink, RainbowWord } from "@/components/site";
import { VideoGallery } from "@/components/videos/video-gallery";
import { IfPro } from "@/components/pro/pro-access";
import { videos } from "@/lib/catalog/videos";
import { createMetadata } from "@/lib/seo";
import { getPricing } from "@/lib/region";

export const metadata: Metadata = createMetadata({
  title: "Product Video Templates for React",
  description: `${videos.length} product videos for launches, pricing and changelogs, made as React components or HyperFrames HTML. Watch one, then take the prompt and the code.`,
  alternates: { canonical: "/videos" },
});

const STEPS = [
  { title: "Pick one", body: "Videos for a launch, a price, an update, a demo, an app store listing or a site background. Each is cut to its own soundtrack." },
  { title: "Make it yours", body: "Type your words, pick your colours and watch it redraw as you go. The numbers are already live." },
  { title: "Render it", body: "A small script turns your edit into an MP4 in the shape you pick: 9:16 for Reels, 1:1 for X, 16:9 for YouTube." },
];

export default async function VideosPage() {
  const pricing = await getPricing();
  const free = videos.filter((v) => !v.premium).length;
  return (
    <>
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-6 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display max-w-[900px] text-[clamp(48px,8vw,80px)] text-foreground">
            Product videos, ready to make <RainbowWord>yours</RainbowWord>
          </h1>
          <p className="mt-5 max-w-[620px] text-[19px] leading-[1.55] text-muted-foreground">
            {videos.length} videos for launches, pricing, updates, demos and app stores, in the shapes each platform wants. Most are React with their
            own soundtrack; the HTML ones are made for HyperFrames, so an agent can render them. Watch one, then take the prompt and the code. {free} are free.
          </p>
        </div>
      </section>

      <section aria-label="Videos" className="px-4 pb-24 pt-6">
        <div className="mx-auto max-w-[1152px]">
          <VideoGallery
            videos={videos.map(({ slug, title, purpose, motion, app, platforms, formats, duration, loop, premium }) => ({
              slug,
              title,
              purpose,
              motion,
              app,
              platforms,
              formats,
              duration,
              loop,
              premium,
            }))}
          />
        </div>
      </section>

      <Band tint="sky">
        <h2 className="pg-display max-w-[620px] text-[clamp(36px,5vw,52px)] leading-[1.02] text-foreground">From a tab to an MP4 in three steps</h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border-t-2 border-foreground pt-5">
              <p className="pg-display text-[40px] text-foreground">{i + 1}</p>
              <h3 className="mt-3 text-[19px] font-semibold tracking-[-0.4px] text-foreground">{s.title}</h3>
              <p className="mt-1 text-[15px] text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </Band>

      <Band tint="butter">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <IfPro
            pro={
              <div>
                <h2 className="pg-display max-w-[620px] text-[clamp(36px,5vw,52px)] leading-[1.02] text-foreground">Every video is already yours</h2>
                <p className="mt-4 max-w-[520px] text-[18px] text-muted-foreground">Open one, edit it, copy the prompt or take the source.</p>
              </div>
            }
            otherwise={
              <div>
                <h2 className="pg-display max-w-[620px] text-[clamp(36px,5vw,52px)] leading-[1.02] text-foreground">Get every video</h2>
                <p className="mt-4 max-w-[520px] text-[18px] text-muted-foreground">
                  Pro unlocks the prompt and the source of all {videos.length}, plus live editing and the render script for the React ones, and everything we release next, for {pricing.pro} a year. All-Access does it for good at {pricing.allAccess} once.
                </p>
              </div>
            }
          />
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <IfPro pro={null} otherwise={<PillLink href="/pricing">Compare plans</PillLink>} />
            <PillLink href="/templates" variant="white">
              See page templates
            </PillLink>
          </div>
        </div>
      </Band>

      {/* every video as a plain link, for crawlers and screen-reader navigation */}
      <nav aria-label="All videos" className="sr-only">
        <ul>
          {videos.map((v) => (
            <li key={v.slug}>
              <Link href={`/videos/${v.slug}`}>{v.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
