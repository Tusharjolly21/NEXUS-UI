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
import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Use the Animated Icons in a React Project",
  description: `Add any of the ${CATALOG_COUNTS.icons} animated icons to a React or Next.js project: copy one file, install Framer Motion, import it. Props, looks, speed and sound.`,
  alternates: { canonical: "/docs/icons" },
});

const code = (s: string) => <code className={docInlineCodeClass}>{s}</code>;

export default function IconsDocsPage() {
  return (
    <>
      <TechArticleJsonLd
        title="Use the Animated Icons in a React Project"
        description="Copy an animated icon into a React project, install Framer Motion and import it. Props, looks, speed and sound."
        slug="icons"
        datePublished="2026-11-01"
      />
      <DocPageShell>
        <DocPageHeader
          title="Animated icons"
          description={`${CATALOG_COUNTS.icons} icons, each one self-contained file that draws an SVG and animates it with Framer Motion. Copy the ones you use; there is nothing to install but Framer Motion.`}
        />

        <DocSection title="What you get">
          <p className="text-sm leading-relaxed text-muted-foreground">
            An icon is one {code(".tsx")} file with no other imports than React and Framer Motion. It draws in{" "}
            {code("currentColor")}, on a 24 by 24 grid, and plays when the pointer is over it (loaders play all the time). It holds still for
            visitors who have reduced motion switched on. Browse them on the{" "}
            <Link href="/icons" className="font-medium text-link hover:underline">
              icons page
            </Link>
            .
          </p>
        </DocSection>

        <DocSection title="1. Copy the file">
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Open an icon and press <em>Copy the file</em>, or fetch it from the command line (free icons only; a Pro icon needs a Pro account, so copy it from its page). Save it anywhere in your project, for example{" "}
            {code("components/icons/")}. Then install the one dependency:
          </p>
          <DocPre>{`curl -s https://www.nexus-ui.com/api/icons/bell -o components/icons/bell.tsx
npm i framer-motion`}</DocPre>
        </DocSection>

        <DocSection title="2. Use it">
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Import it and render it like any component. Set a text colour on it, or on its parent, to change the colour.
          </p>
          <DocPre>{`import { BellIcon } from "@/components/icons/bell";

<button className="text-foreground" aria-label="Notifications">
  <BellIcon size={24} />
</button>`}</DocPre>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Every icon takes the same props: {code("size")}, {code("strokeWidth")}, {code("className")}, {code("speed")} (1 is the designed pace),{" "}
            {code("accent")} (the colour of its small details) and {code("play")} (true plays, false rests; left out it follows the pointer). Icons are
            decorative, so they carry {code('aria-hidden="true"')}: give the button or link around them an accessible name.
          </p>
        </DocSection>

        <DocSection title="3. Play it from your own state">
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Hover is only the default. Drive {code("play")} yourself to run an icon on click, on success, on a timer or while something loads:
          </p>
          <DocPre>{`const [saved, setSaved] = useState(false);

<button onClick={() => setSaved(true)}>
  <HeartIcon play={saved} accent="#ff375f" />
</button>`}</DocPre>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The {code("status")} icon goes further: set {code('state="loading" | "success" | "error"')} and it morphs between them.
          </p>
        </DocSection>

        <DocSection title="4. Give them a look (optional)">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Wrap an icon, or a whole grid, in {code("IconMaterial")} for a neon, aurora or chrome finish, or for the liquid looks: {code("mercury")} (flowing
            liquid metal), {code("liquid")} (a glossy droplet that wobbles on hover) and {code("glass")} (a lens with a bright rim and a red and blue
            fringe). They are pure SVG, so there is no canvas or WebGL to set up. It is one small file, shown at the bottom of every icon page.
          </p>
        </DocSection>

        <DocSection title="5. Add a sound (optional)">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every icon has a sound scored against its animation, synthesised in the browser with no audio files. Copy the small engine once, then the score for
            each icon you want to hear, and call {code("playIconScore")}. The{" "}
            <Link href="/icons/sounds" className="font-medium text-link hover:underline">
              sound guide
            </Link>{" "}
            has the files, the three steps, and the patterns for speed, a sound switch and touch screens.
          </p>
        </DocSection>

        <DocSection title="Good to know">
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Need an icon that is not in the set? Say so on the <Link href="/contact" className="font-medium text-link hover:underline">contact page</Link>.</li>
            <li>{CATALOG_COUNTS.freeIcons} icons are free to copy and use in personal, commercial and client projects. The other {CATALOG_COUNTS.proIcons} are Pro: you can preview and play every one, but their code and sound come with Pro (see <Link href="/pricing" className="font-medium text-link hover:underline">pricing</Link>). A Pro member can also fetch a file from the command line when signed in.</li>
            <li>Server Components: the files start with {code('"use client"')}, so import them from either kind of component.</li>
          </ul>
        </DocSection>
      </DocPageShell>

      <DocFooterNav prev={{ href: "/docs/videos", label: "Videos" }} />
    </>
  );
}
