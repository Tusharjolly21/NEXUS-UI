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
import { TutorialPlayer, type TutorialChapter } from "@/components/docs/interactive/tutorial-player";
import { createMetadata, siteConfig } from "@/lib/seo";
import { REGISTRIES_PRO, envLocalLine, installCommand, registryAddCommand } from "@/lib/registry-config";

const TITLE = "Video tutorial: add Nexus UI to a project in VS Code";
const DESCRIPTION =
  "Watch the whole setup in VS Code, then add a component, a block, an icon, a sound, a video and a template zip. Every command was run for real. About five minutes, with a voiceover and captions.";

export const metadata: Metadata = createMetadata({
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/docs/video-tutorial" },
});

const SRC = "/videos/tutorial/add-nexus-ui.mp4";
const POSTER = "/videos/tutorial/add-nexus-ui-poster.webp";
const SUBTITLES = "/videos/tutorial/add-nexus-ui.en.vtt";
const DURATION = 326.5;

const CHAPTERS: TutorialChapter[] = [
  { at: 0, title: "Introduction" },
  { at: 7, title: "1. Get ready" },
  { at: 19, title: "2. Create a Next.js project" },
  { at: 48.7, title: "3. Set up shadcn/ui" },
  { at: 68.4, title: "4. Connect Nexus UI" },
  { at: 84.3, title: "5. Add a component" },
  { at: 102, title: "6. Use it in a page" },
  { at: 119.5, title: "See it work" },
  { at: 129.5, title: "Another way: copy by hand" },
  { at: 156.1, title: "Pro components" },
  { at: 174.8, title: "More than components" },
  { at: 180.3, title: "Blocks" },
  { at: 203.7, title: "Icons" },
  { at: 226.3, title: "Sounds" },
  { at: 248.2, title: "Videos" },
  { at: 289.4, title: "Templates" },
  { at: 315.1, title: "Done" },
];

const code = docInlineCodeClass;
const link = "text-link underline-offset-4 hover:underline";

function VideoJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: TITLE,
    description: DESCRIPTION,
    thumbnailUrl: [`${siteConfig.url}${POSTER}`],
    uploadDate: "2026-11-02",
    duration: "PT5M27S",
    contentUrl: `${siteConfig.url}${SRC}`,
    embedUrl: `${siteConfig.url}/docs/video-tutorial`,
    hasPart: CHAPTERS.map((c, i) => ({
      "@type": "Clip",
      name: c.title,
      startOffset: c.at,
      endOffset: CHAPTERS[i + 1]?.at ?? DURATION,
      url: `${siteConfig.url}/docs/video-tutorial?t=${c.at}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

export default function VideoTutorialPage() {
  return (
    <>
      <TechArticleJsonLd title="Video tutorial" description={DESCRIPTION} slug="video-tutorial" datePublished="2026-11-02" />
      <VideoJsonLd />
      <DocPageShell>
        <DocPageHeader
          title="Video tutorial"
          description="The whole setup in VS Code, then every kind of item: components, blocks, icons, sounds, videos and templates. About five minutes, with a voiceover and captions. Press a chapter to jump to it."
        />

        <TutorialPlayer src={SRC} poster={POSTER} subtitles={SUBTITLES} chapters={CHAPTERS} duration={DURATION} />

        <DocSection title="What you need">
          <p className="text-sm text-muted-foreground">
            VS Code and Node.js 20.9 or newer. Check your version by typing <code className={code}>node -v</code> in the
            VS Code terminal (View, then Terminal). Free components need no account.
          </p>
        </DocSection>

        <DocSection title="Every command from the video">
          <p className="text-sm text-muted-foreground">
            Copy them from here instead of pausing the video. Run them in order, inside the folder where you keep your
            projects.
          </p>
          <ol className="list-decimal space-y-5 pl-5 text-sm text-muted-foreground marker:font-semibold marker:text-foreground">
            <li>
              Create the project, then open the <code className={code}>my-app</code> folder in VS Code (File, then Open
              Folder):
              <div className="mt-3">
                <DocPre>{`npx create-next-app@latest my-app --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
cd my-app`}</DocPre>
              </div>
            </li>
            <li>
              Set up shadcn/ui. It adds <code className={code}>components.json</code> and{" "}
              <code className={code}>src/lib/utils.ts</code>:
              <div className="mt-3">
                <DocPre>{`npx shadcn@latest init -d`}</DocPre>
              </div>
            </li>
            <li>
              Connect Nexus UI. Type it as shown, including <code className={code}>{"{name}"}</code>:
              <div className="mt-3">
                <DocPre>{registryAddCommand()}</DocPre>
              </div>
            </li>
            <li>
              Add a component. The video uses the free Glow Button; every component page shows its own command:
              <div className="mt-3">
                <DocPre>{installCommand("glow-button")}</DocPre>
              </div>
            </li>
            <li>
              Use it in <code className={code}>src/app/page.tsx</code>, then start the app and open{" "}
              <code className={code}>http://localhost:3000</code>:
              <div className="mt-3 space-y-3">
                <DocPre>{`import { GlowButton } from "@/components/glow-button";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <GlowButton href="#">Get started</GlowButton>
    </main>
  );
}`}</DocPre>
                <DocPre>{`npm run dev`}</DocPre>
              </div>
            </li>
          </ol>
        </DocSection>

        <DocSection title="Copying by hand instead">
          <p className="text-sm text-muted-foreground">
            Skip steps 3 and 4. Install the packages the component lists, then open its page, press{" "}
            <strong className="font-medium text-foreground">Show the source files</strong> and create each file at the
            path shown under <strong className="font-medium text-foreground">Save as</strong>. For the Glow Button:
          </p>
          <DocPre>{`npm install framer-motion`}</DocPre>
        </DocSection>

        <DocSection title="Pro components">
          <p className="text-sm text-muted-foreground">
            Make an API key on the{" "}
            <Link href="/dashboard/api-key" className={link}>
              API key page
            </Link>{" "}
            (you need a Pro plan). Put it in a file called <code className={code}>.env.local</code> in your project:
          </p>
          <DocPre>{envLocalLine()}</DocPre>
          <p className="text-sm text-muted-foreground">
            Then replace the <code className={code}>registries</code> entry in <code className={code}>components.json</code>{" "}
            with this one, and add Pro components the same way as free ones:
          </p>
          <DocPre>{REGISTRIES_PRO}</DocPre>
          <DocPre>{installCommand("particle-reveal")}</DocPre>
          <p className="text-sm text-muted-foreground">
            The{" "}
            <Link href="/docs/installation" className={link}>
              Quick start
            </Link>{" "}
            explains each step in more detail and lists what to do if a command fails.
          </p>
        </DocSection>

        <DocSection title="Blocks, icons, sounds, videos and templates">
          <p className="text-sm text-muted-foreground">
            The commands from the second half of the video. Each one starts from a project set up in steps 1 to 4.
          </p>
          <p className="text-sm font-medium text-foreground">Blocks install like components:</p>
          <DocPre>{installCommand("pricing-section")}</DocPre>
          <p className="text-sm font-medium text-foreground">
            Icons are one file each. Make the folder, download the icon, and install Framer Motion if you have not yet (see{" "}
            <Link href="/docs/icons" className={link}>
              Icons
            </Link>
            ):
          </p>
          <DocPre>{`mkdir -p src/components/icons
curl -s https://www.nexus-ui.com/api/icons/bell -o src/components/icons/bell.tsx
npm i framer-motion`}</DocPre>
          <p className="text-sm font-medium text-foreground">
            Sounds are made in the browser. One command adds the free library, then call{" "}
            <code className={code}>playSound(&quot;pop&quot;)</code> from a click (see{" "}
            <Link href="/sounds" className={link}>
              Sounds
            </Link>
            ):
          </p>
          <DocPre>{installCommand("ui-sounds")}</DocPre>
          <p className="text-sm font-medium text-foreground">
            Videos render to MP4 on your machine with Playwright and ffmpeg. Put the files together as the{" "}
            <Link href="/docs/videos" className={link}>
              Videos guide
            </Link>{" "}
            shows, start the app, then:
          </p>
          <DocPre>{`npm i -D playwright
npx playwright install chromium
node render.mjs --url http://localhost:3000/video-frame --duration 12 --audio launch-reel.mp3 --out launch-reel.mp4`}</DocPre>
          <p className="text-sm font-medium text-foreground">
            Templates come as a zip of a whole Next.js project. Sign in (a free account works for the free templates), press{" "}
            <strong className="font-medium text-foreground">Download source (.zip)</strong> on the template page, unzip it, then:
          </p>
          <DocPre>{`cd launchfolio-portfolio
npm install
npm run dev`}</DocPre>
        </DocSection>

        <DocFooterNav prev={{ href: "/docs/installation", label: "Quick start" }} next={{ href: "/docs/install-nextjs", label: "Install Next.js" }} />
      </DocPageShell>
    </>
  );
}
