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
  "Watch the whole setup in VS Code: create a Next.js project, set up shadcn/ui, connect Nexus UI and add your first component, with the CLI or by hand. Under three minutes, with captions.";

export const metadata: Metadata = createMetadata({
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/docs/video-tutorial" },
});

const SRC = "/videos/tutorial/add-nexus-ui.mp4";
const POSTER = "/videos/tutorial/add-nexus-ui-poster.webp";
const DURATION = 174;

const CHAPTERS: TutorialChapter[] = [
  { at: 0, title: "Introduction" },
  { at: 7, title: "1. Get ready" },
  { at: 18, title: "2. Create a Next.js project" },
  { at: 43, title: "3. Set up shadcn/ui" },
  { at: 60, title: "4. Connect Nexus UI" },
  { at: 75, title: "5. Add a component" },
  { at: 93, title: "6. Use it in a page" },
  { at: 108, title: "See it work" },
  { at: 118, title: "Another way: copy by hand" },
  { at: 144, title: "Pro components" },
  { at: 164, title: "Done" },
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
    duration: "PT2M54S",
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
          description="The whole setup in VS Code, from an empty folder to a Nexus UI component on screen. Under three minutes, with captions. Press a chapter to jump to it."
        />

        <TutorialPlayer src={SRC} poster={POSTER} chapters={CHAPTERS} duration={DURATION} />

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

        <DocFooterNav prev={{ href: "/docs/installation", label: "Quick start" }} next={{ href: "/docs/install-nextjs", label: "Install Next.js" }} />
      </DocPageShell>
    </>
  );
}
