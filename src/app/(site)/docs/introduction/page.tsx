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
import { CliSimulator } from "@/components/docs/interactive/cli-simulator";

export const metadata: Metadata = createMetadata({
  title: "Introduction",
  description:
    "Nexus UI is a library of animated React components, page-section blocks and landing-page templates for Next.js, built with Tailwind CSS v4 and Framer Motion and installed with the shadcn CLI.",
  alternates: { canonical: "/docs/introduction" },
});

const code = docInlineCodeClass;
const link = "text-link underline-offset-4 hover:underline";

export default function IntroductionPage() {
  return (
    <>
      <TechArticleJsonLd
        title="Introduction"
        description="Nexus UI is a library of animated React components, page-section blocks and landing-page templates for Next.js, built with Tailwind CSS v4 and Framer Motion and installed with the shadcn CLI."
        slug="introduction"
      />
      <DocPageShell>
        <DocPageHeader
          title="Introduction"
          description="Nexus UI is a library of animated React components, page-section blocks and landing-page templates. You add the ones you want to your own project and the code is yours to change."
        />

        <DocSection title="What is Nexus UI?">
          <p className="text-sm leading-relaxed text-muted-foreground">
            There is no Nexus UI package to install and import from. Each component is a handful of source files that you
            copy into your project, so you can read them, restyle them and delete what you do not need. They are written
            for <strong className="font-medium text-foreground">Next.js</strong> (App Router) with{" "}
            <strong className="font-medium text-foreground">TypeScript</strong>,{" "}
            <strong className="font-medium text-foreground">Tailwind CSS v4</strong> and{" "}
            <strong className="font-medium text-foreground">Framer Motion</strong>.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The library has three parts: {CATALOG_COUNTS.components}{" "}
            <Link href="/components" className={link}>
              components
            </Link>
            , {CATALOG_COUNTS.blocks}{" "}
            <Link href="/blocks" className={link}>
              blocks
            </Link>{" "}
            (page sections that come in several layouts) and {CATALOG_COUNTS.templates}{" "}
            <Link href="/templates" className={link}>
              templates
            </Link>{" "}
            (whole landing pages). {CATALOG_COUNTS.freeComponents} of the components are free; the rest need a{" "}
            <Link href="/pricing" className={link}>
              Pro plan
            </Link>
            . Every Pro item stays visible with a live preview, and only its source and install are locked.
          </p>
        </DocSection>

        <DocSection title="What is in the box">
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">Components.</strong> One animated piece of interface, such as
              a button, a card stack, a text effect or a background. Each page has a live preview, a usage example, its
              props and the install command.
            </li>
            <li>
              <strong className="font-medium text-foreground">Blocks.</strong> A full section of a page, such as a hero,
              a FAQ or a sidebar, with several layouts to choose from. They install the same way as components.
            </li>
            <li>
              <strong className="font-medium text-foreground">Templates.</strong> Complete landing pages built from the
              components, each with a live preview.
            </li>
            <li>
              <strong className="font-medium text-foreground">Sounds.</strong> Optional interface sounds that some
              components play. They are off until the visitor turns them on, and{" "}
              <Link href="/sounds" className={link}>
                the Sounds page
              </Link>{" "}
              lets you hear them.
            </li>
          </ul>
        </DocSection>

        <DocSection title="How a component gets into your project">
          <p className="text-sm leading-relaxed text-muted-foreground">
            There are two ways, and both end with the same files in your project. Both start from a Next.js project that
            has shadcn/ui set up (the{" "}
            <Link href="/docs/installation" className={link}>
              Quick Start
            </Link>{" "}
            does that in two commands).
          </p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">With the CLI.</strong> Connect the{" "}
              <code className={code}>@nexus-labs</code> registry once, then one command installs a component, the helpers
              it imports and its npm packages:
              <div className="mt-2">
                <DocPre>{`npx shadcn@latest add @nexus-labs/glow-button`}</DocPre>
              </div>
              Free items need nothing more. Pro items also need an API key from your dashboard, kept in{" "}
              <code className={code}>.env.local</code>.
            </li>
            <li>
              <strong className="font-medium text-foreground">By hand.</strong>{" "}
              The component&apos;s page lists every
              source file with the exact path to save it to. You create those files and paste the code. No registry or API
              key is involved, though Pro source is shown only while you are signed in with a Pro plan.
            </li>
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The exact steps for both, free and Pro, are in the{" "}
            <Link href="/docs/installation" className={link}>
              Quick Start
            </Link>
            , and the{" "}
            <Link href="/docs/cli" className={link}>
              CLI page
            </Link>{" "}
            is the reference for the commands.
          </p>
          <div data-doc-widget>
            <CliSimulator autoplay={false} />
          </div>
        </DocSection>

        <DocSection title="Read the docs in this order">
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="shrink-0 text-primary">1.</span>
              <span>
                <Link href="/docs/installation" className={link}>
                  Quick Start
                </Link>
                {" — "}the whole path from an empty folder to a component on screen. If you only read one page, read this
                one.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 text-primary">2.</span>
              <span>
                <Link href="/docs/install-nextjs" className={link}>
                  Install Next.js
                </Link>
                {" — "}what the create command does, if you want the detail.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 text-primary">3.</span>
              <span>
                <Link href="/docs/install-tailwindcss" className={link}>
                  Install Tailwind CSS
                </Link>
                {" — "}the colour tokens and dark mode.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 text-primary">4.</span>
              <span>
                <Link href="/docs/add-utilities" className={link}>
                  Add utilities
                </Link>
                {" — "}the <code className={code}>cn()</code> helper every component imports.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 text-primary">5.</span>
              <span>
                <Link href="/docs/cli" className={link}>
                  CLI
                </Link>
                {" — "}registry setup, Pro API keys, options and error messages.
              </span>
            </li>
          </ol>
        </DocSection>

        <DocFooterNav next={{ href: "/docs/installation", label: "Quick Start" }} />

        <p className="text-sm text-muted-foreground">
          <Link href="/components" className="text-muted-foreground hover:text-foreground">
            ← Components library
          </Link>
        </p>
      </DocPageShell>
    </>
  );
}
