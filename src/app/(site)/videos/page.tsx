import type { Metadata } from "next";
import Link from "next/link";
import { Band, PillLink, RainbowWord } from "@/components/site";
import { VideoCard } from "@/components/videos/video-card";
import { IfPro } from "@/components/pro/pro-access";
import { videos } from "@/lib/catalog/videos";
import { createMetadata } from "@/lib/seo";
import { PRICES, formatPrice } from "@/lib/pricing";

export const metadata: Metadata = createMetadata({
  title: "Product Video Templates: Launch, Pricing and Update Videos in React",
  description: `${videos.length} vertical product videos for launches, pricing, changelogs and app walkthroughs. Each one is a React component with its own soundtrack: watch it, change the words, then take the prompt and the code.`,
  alternates: { canonical: "/videos" },
});

const STEPS = [
  { title: "Pick one", body: "Vertical videos for a launch, a price, an update, a demo or a teaser. Each is cut to its own soundtrack." },
  { title: "Make it yours", body: "Type your words, pick your colours and watch it redraw as you go. The numbers are already live." },
  { title: "Render it", body: "A small script turns your edit into an MP4, ready for Reels, Shorts and TikTok." },
];

export default function VideosPage() {
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
            {videos.length} vertical videos for launches, pricing, updates and demos, each with its own soundtrack. Watch one, change
            the words, then take the prompt and the code. {free} are free.
          </p>
        </div>
      </section>

      <section aria-label="Videos" className="px-4 pb-24 pt-8">
        <ul className="mx-auto grid max-w-[1152px] grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {videos.map((v, i) => (
            <li key={v.slug}>
              <VideoCard video={v} priority={i < 4} />
            </li>
          ))}
        </ul>
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
                  Pro unlocks the prompt, the source, live editing and the render script for all {videos.length}, plus everything we release next, for {formatPrice(PRICES.pro)} a year. All-Access does it for good at {formatPrice(PRICES.allAccess)} once.
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
