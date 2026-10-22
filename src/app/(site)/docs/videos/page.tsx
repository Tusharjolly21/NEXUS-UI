import type { Metadata } from "next";
import Link from "next/link";
import {
  DocFooterNav,
  DocPageHeader,
  DocPageShell,
  DocPre,
  DocSection,
  TechArticleJsonLd,
  docInlineCodeClass,
} from "@/components/docs/doc-page";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Render a Nexus Video to MP4 (React, Playwright and ffmpeg)",
  description:
    "Every Nexus video is a React component that is a pure function of time. Mount it on a frame page, then render.mjs sets the clock, screenshots each frame and pipes them into ffmpeg with the soundtrack.",
  alternates: { canonical: "/docs/videos" },
});

export default function VideosDocsPage() {
  return (
    <>
      <TechArticleJsonLd
        title="Render a Nexus Video to MP4"
        description="Mount a Nexus video on a frame page and render it to MP4 with Playwright and ffmpeg."
        slug="videos"
        datePublished="2026-10-22"
      />
      <DocPageShell>
        <DocPageHeader
          title="Videos"
          description="Each video is a React component that draws one frame for any moment in time. Nothing records the screen: a script sets the clock to each frame, photographs it and stitches the frames into an MP4 with the soundtrack."
        />

        <DocSection title="What you get">
          <p className="text-sm leading-relaxed text-muted-foreground">
            A video comes as one <code className={docInlineCodeClass}>.tsx</code> file, a small shared{" "}
            <code className={docInlineCodeClass}>kit.ts</code>, a <code className={docInlineCodeClass}>frame.tsx</code> page and{" "}
            <code className={docInlineCodeClass}>render.mjs</code>, plus its <code className={docInlineCodeClass}>.mp3</code> soundtrack and the
            images it uses. Open a video on the{" "}
            <Link href="/videos" className="font-medium text-link hover:underline">
              videos page
            </Link>{" "}
            and use the Source tab. Two videos are free; the others need Pro.
          </p>
        </DocSection>

        <DocSection title="1. Put the files in your project">
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Copy the video file and <code className={docInlineCodeClass}>kit.ts</code> into one folder, for example{" "}
            <code className={docInlineCodeClass}>components/videos/</code>, and the images into{" "}
            <code className={docInlineCodeClass}>public/videos/assets/</code>. The video draws on a fixed 1080 by 1920 canvas and takes{" "}
            <code className={docInlineCodeClass}>t</code> (seconds) plus its copy as props:
          </p>
          <DocPre>{`<LaunchReel t={4.2} words="landing page, dashboard" brand="Your brand" url="yourbrand.com" />`}</DocPre>
        </DocSection>

        <DocSection title="2. Add the frame page">
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Save <code className={docInlineCodeClass}>frame.tsx</code> as a page, for example{" "}
            <code className={docInlineCodeClass}>app/video-frame/page.tsx</code>, and swap in the video you want. It draws the video
            full-window and exposes <code className={docInlineCodeClass}>window.__setT(seconds)</code>, which is how the script moves the
            clock.
          </p>
        </DocSection>

        <DocSection title="3. Render">
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Install Playwright once, make sure ffmpeg is on your PATH, start your app and run the script. The launch reel and the app
            walkthrough are 12 seconds; the others are 10.
          </p>
          <DocPre>{`npm i -D playwright
npx playwright install chromium
node render.mjs --url http://localhost:3000/video-frame --duration 12 --audio launch-reel.mp3 --out launch-reel.mp4`}</DocPre>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The output is 1080 by 1920 at 30 frames a second, the shape Instagram Reels, TikTok and YouTube Shorts want. Use{" "}
            <code className={docInlineCodeClass}>--width 540</code> for a quick draft; every frame is rendered, so a full-size render takes a
            few minutes.
          </p>
        </DocSection>

        <DocSection title="Make it yours">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every word and colour is a prop, so you can change them in code or live on the video&apos;s Customize tab first. The build prompt
            on the Prompt tab rebuilds the whole video from a description if you would rather start from scratch with your own coding
            agent. The soundtrack is cut to the picture, so if you change the timing, change the music with it.
          </p>
        </DocSection>
      </DocPageShell>

      <DocFooterNav prev={{ href: "/docs/cli", label: "CLI" }} />
    </>
  );
}
