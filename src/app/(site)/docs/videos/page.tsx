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
            and use the Source tab. Three videos are free (Launch Reel, Kinetic Manifesto and Will Return); the others need Pro.
          </p>
        </DocSection>

        <DocSection title="1. Put the files in one folder">
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Make a folder for the frame page, for example <code className={docInlineCodeClass}>src/app/video-frame/</code> (or <code className={docInlineCodeClass}>app/video-frame/</code> without a src
            folder). Save the video file (<code className={docInlineCodeClass}>launch-reel.tsx</code>), <code className={docInlineCodeClass}>kit.ts</code> and <code className={docInlineCodeClass}>frame.tsx</code> in it, with{" "}
            <code className={docInlineCodeClass}>frame.tsx</code> renamed to <code className={docInlineCodeClass}>page.tsx</code>: it imports <code className={docInlineCodeClass}>./launch-reel</code> and <code className={docInlineCodeClass}>./kit</code>, so they
            have to sit next to it. Save <code className={docInlineCodeClass}>render.mjs</code> in the project root.
          </p>
          <DocPre>{`src/app/video-frame/
  assets/            the images the video imports
  kit.ts
  launch-reel.tsx
  page.tsx           frame.tsx, renamed
render.mjs
launch-reel.mp3`}</DocPre>
        </DocSection>

        <DocSection title="2. Add the images and the music">
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            The video imports its images from <code className={docInlineCodeClass}>./assets/</code>, so make an <code className={docInlineCodeClass}>assets</code> folder next to it and download each
            file it names at the top (for example <code className={docInlineCodeClass}>import pageImg from &quot;./assets/nexus-page.jpg&quot;</code>) from{" "}
            <code className={docInlineCodeClass}>https://www.nexus-ui.com/videos/assets/</code>. The soundtrack is at{" "}
            <code className={docInlineCodeClass}>https://www.nexus-ui.com/videos/audio/launch-reel.mp3</code>; save it in the project root. Change the words and
            colours with the video&apos;s props:
          </p>
          <DocPre>{`<LaunchReel t={4.2} words="landing page, dashboard" brand="Your brand" url="yourbrand.com" />`}</DocPre>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The page draws the video full-window and exposes <code className={docInlineCodeClass}>window.__setT(seconds)</code>, which is how the script moves the clock.
          </p>
        </DocSection>

        <DocSection title="3. Render">
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Install Playwright once, make sure ffmpeg is on your PATH, start your app and run the script. The launch reel and the app
            walkthrough are 12 seconds, the others are between 5 and 16; each video&apos;s page says how long it is.
          </p>
          <DocPre>{`npm i -D playwright
npx playwright install chromium
node render.mjs --url http://localhost:3000/video-frame --duration 12 --audio launch-reel.mp3 --out launch-reel.mp4

# a video that comes in more than one shape: pick it with --format
node render.mjs --url http://localhost:3000/video-frame --format 16:9 --duration 12 --audio install-seconds.mp3 --out install-16x9.mp4`}</DocPre>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The default output is 1080 by 1920 at 30 frames a second, the shape Instagram Reels, TikTok and YouTube Shorts want;{" "}
            <code className={docInlineCodeClass}>--format</code> takes 9:16, 4:5, 1:1, 16:9, app or 21:9 for the videos that support them (the Hero Loop has no soundtrack, so leave out{" "}
            <code className={docInlineCodeClass}>--audio</code>). Use{" "}
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

      <DocFooterNav prev={{ href: "/docs/cli", label: "CLI" }} next={{ href: "/docs/icons", label: "Icons" }} />
    </>
  );
}
