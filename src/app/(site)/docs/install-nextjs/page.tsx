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
  description: "Create a Next.js App Router project with TypeScript and Tailwind CSS using create-next-app: the exact command and flags Nexus UI components expect.",
  alternates: { canonical: "/docs/install-nextjs" },
});

export default function InstallNextjsPage() {
  return (
    <>
      <TechArticleJsonLd
        title="Install Next.js"
        description="Create a Next.js App Router project with TypeScript and Tailwind CSS using create-next-app: the exact command and flags Nexus UI components expect."
        slug="install-nextjs"
      />
      <DocPageShell>
        <DocPageHeader
          title="Install Next.js"
          description="Nexus UI components are written for the Next.js App Router with TypeScript and Tailwind CSS. This page explains the one command that creates that project. The Quick Start already includes it."
        />

        <DocSection title="Requirements">
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>
              Node.js 20.9 or newer. Check with <code className={docInlineCodeClass}>node -v</code>.
            </li>
            <li>A package manager: npm (it comes with Node.js), pnpm, yarn or bun.</li>
          </ul>
        </DocSection>

        <DocSection title="Create a new project">
          <p className="text-sm text-muted-foreground">
            Run this in the folder where you keep your projects. <code className={docInlineCodeClass}>my-app</code> is the
            name of the new folder; use any name you like.
          </p>
          <DocPre>{`npx create-next-app@latest my-app --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --yes`}</DocPre>
          <p className="text-sm text-muted-foreground">What each flag does:</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>
              <code className={docInlineCodeClass}>--ts</code> uses TypeScript.
            </li>
            <li>
              <code className={docInlineCodeClass}>--tailwind</code> installs Tailwind CSS (version 4) and imports it in{" "}
              <code className={docInlineCodeClass}>src/app/globals.css</code>.
            </li>
            <li>
              <code className={docInlineCodeClass}>--eslint</code> adds linting.
            </li>
            <li>
              <code className={docInlineCodeClass}>--app</code> uses the App Router, with pages in{" "}
              <code className={docInlineCodeClass}>src/app</code>.
            </li>
            <li>
              <code className={docInlineCodeClass}>--src-dir</code> puts your code in a <code className={docInlineCodeClass}>src/</code>{" "}
              folder. The paths in these docs, such as <code className={docInlineCodeClass}>src/components</code> and{" "}
              <code className={docInlineCodeClass}>src/lib</code>, assume it.
            </li>
            <li>
              <code className={docInlineCodeClass}>--import-alias &quot;@/*&quot;</code> makes{" "}
              <code className={docInlineCodeClass}>@/</code> mean <code className={docInlineCodeClass}>src/</code>, which is how
              Nexus UI components import each other.
            </li>
            <li>
              <code className={docInlineCodeClass}>--yes</code> accepts the defaults for everything else, so it asks no
              questions. Leave it off to answer the prompts yourself.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            The command also installs the packages, so you do not run <code className={docInlineCodeClass}>npm install</code>{" "}
            yourself.
          </p>
        </DocSection>

        <DocSection title="Run the dev server">
          <DocPre>{`cd my-app
npm run dev`}</DocPre>
          <p className="text-sm text-muted-foreground">
            Open <code className={docInlineCodeClass}>http://localhost:3000</code>; you should see the Next.js starter page.
            Press <code className={docInlineCodeClass}>Ctrl+C</code> in the terminal to stop it. Next,{" "}
            <Link href="/docs/install-tailwindcss" className="text-link underline-offset-4 hover:underline">
              check Tailwind CSS
            </Link>{" "}
            or go straight back to the{" "}
            <Link href="/docs/installation" className="text-link underline-offset-4 hover:underline">
              Quick Start
            </Link>
            .
          </p>
        </DocSection>

        <DocFooterNav
          prev={{ href: "/docs/installation", label: "Quick Start" }}
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
