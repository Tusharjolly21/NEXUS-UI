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
  title: "Install Next.js",
  description: "Create a new Next.js App Router project with TypeScript — the baseline Nexus-UI expects.",
  alternates: { canonical: "/docs/install-nextjs" },
});

export default function InstallNextjsPage() {
  return (
    <>
      <TechArticleJsonLd
        title="Install Next.js"
        description="Create a new Next.js App Router project with TypeScript — the baseline Nexus-UI expects."
        slug="install-nextjs"
      />
      <DocPageShell>
      <DocPageHeader
        title="Install Next.js"
        description="Nexus-UI targets the App Router, TypeScript, and modern React. Start from Create Next App, then layer Tailwind and UI primitives in the following guides."
      />

      <DocSection title="Requirements">
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>Node.js 20 or newer</li>
          <li>npm, pnpm, yarn, or bun</li>
        </ul>
      </DocSection>

      <DocSection title="Create a new project">
        <p className="text-sm text-muted-foreground">
          Run the official bootstrapper. Enable TypeScript and ESLint when prompted; both match how this repo is
          structured.
        </p>
        <DocPre>{`npx create-next-app@latest`}</DocPre>
        <p className="text-sm text-muted-foreground">Typical prompts:</p>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">App Router</strong> — yes (recommended)
          </li>
          <li>
            <strong className="text-foreground">src/ directory</strong> — optional; Nexus-UI uses{" "}
            <code className={docInlineCodeClass}>src/app</code>
          </li>
          <li>
            <strong className="text-foreground">Import alias</strong> — <code className={docInlineCodeClass}>@/*</code>{" "}
            matches our component imports
          </li>
        </ul>
      </DocSection>

      <DocSection title="Run the dev server">
        <DocPre>{`cd your-app
npm install
npm run dev`}</DocPre>
        <p className="text-sm text-muted-foreground">
          Visit <code className={docInlineCodeClass}>http://localhost:3000</code>. Next, wire{" "}
          <Link href="/docs/install-tailwindcss" className="text-primary underline-offset-4 hover:underline">
            Tailwind CSS v4
          </Link>{" "}
          so utility classes and tokens match Nexus-UI patterns.
        </p>
      </DocSection>

      <DocFooterNav
        prev={{ href: "/docs/installation", label: "Nexus-UI setup" }}
        next={{ href: "/docs/install-tailwindcss", label: "Install Tailwind CSS" }}
      />

      <p className="text-sm text-muted-foreground">
        <Link href="/components" className="text-muted-foreground hover:text-foreground">
          ← Components library
        </Link>
      </p>
    </DocPageShell>
    </>
  );
}
