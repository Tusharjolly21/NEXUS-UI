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
import { DarkModeDemo } from "@/components/docs/interactive/dark-mode-demo";

export const metadata: Metadata = createMetadata({
  title: "Install Tailwind CSS",
  description:
    "Check that Tailwind CSS v4 is set up in your Next.js project, add it if it is missing, and learn the colour tokens and dark mode setup Nexus UI components expect.",
  alternates: { canonical: "/docs/install-tailwindcss" },
});

export default function InstallTailwindPage() {
  return (
    <>
      <TechArticleJsonLd
        title="Install Tailwind CSS"
        description="Check that Tailwind CSS v4 is set up in your Next.js project, add it if it is missing, and learn the colour tokens and dark mode setup Nexus UI components expect."
        slug="install-tailwindcss"
      />
      <DocPageShell>
        <DocPageHeader
          title="Install Tailwind CSS"
          description="Nexus UI components are styled with Tailwind CSS v4 and read their colours from CSS variables. If you followed the Quick Start, Tailwind is already installed; this page shows how to check, how to add it to an older project, and how the colour tokens and dark mode work."
        />

        <DocSection title="1. Check what you already have">
          <p className="text-sm text-muted-foreground">
            A project made with the command on the{" "}
            <Link href="/docs/installation" className="text-link underline-offset-4 hover:underline">
              Quick Start
            </Link>{" "}
            (it includes <code className={docInlineCodeClass}>--tailwind</code>) already has Tailwind CSS v4. You can
            confirm it:
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>
              <code className={docInlineCodeClass}>package.json</code> lists <code className={docInlineCodeClass}>tailwindcss</code>{" "}
              (version 4), together with a Tailwind plugin for your bundler: <code className={docInlineCodeClass}>@tailwindcss/postcss</code>{" "}
              or, in newer Next.js projects, <code className={docInlineCodeClass}>@tailwindcss/turbopack</code>.
            </li>
            <li>
              That plugin is switched on in <code className={docInlineCodeClass}>postcss.config.mjs</code> (PostCSS) or in the{" "}
              <code className={docInlineCodeClass}>turbopack</code> section of <code className={docInlineCodeClass}>next.config.ts</code>.
            </li>
            <li>
              <code className={docInlineCodeClass}>src/app/globals.css</code> starts with{" "}
              <code className={docInlineCodeClass}>{'@import "tailwindcss";'}</code>.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            If all three are true, skip to{" "}
            <a href="#design-tokens-and-globals-css" className="text-link underline-offset-4 hover:underline">
              design tokens
            </a>
            . If not, follow steps 2 and 3, which use the PostCSS setup.
          </p>
        </DocSection>

        <DocSection title="2. Install Tailwind in a project that lacks it">
          <p className="text-sm text-muted-foreground">
            From your project root, install Tailwind and its PostCSS plugin. Tailwind v4 needs no{" "}
            <code className={docInlineCodeClass}>autoprefixer</code> and no <code className={docInlineCodeClass}>tailwind.config.js</code>;
            configuration lives in CSS.
          </p>
          <DocPre>{`npm install tailwindcss @tailwindcss/postcss`}</DocPre>
        </DocSection>

        <DocSection title="3. Configure PostCSS">
          <p className="text-sm text-muted-foreground">
            Create <code className={docInlineCodeClass}>postcss.config.mjs</code> in the project root (next to{" "}
            <code className={docInlineCodeClass}>package.json</code>), or replace the one that is there:
          </p>
          <DocPre>{`export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};`}</DocPre>
          <p className="text-sm text-muted-foreground">
            Then make sure <code className={docInlineCodeClass}>src/app/globals.css</code> begins with the import below and
            that <code className={docInlineCodeClass}>src/app/layout.tsx</code> imports the file with{" "}
            <code className={docInlineCodeClass}>{'import "./globals.css";'}</code>.
          </p>
          <DocPre>{`@import "tailwindcss";`}</DocPre>
        </DocSection>

        <DocSection title="Design tokens and globals.css">
          <p className="text-sm text-muted-foreground">
            Nexus UI components never hard-code colours. They use classes such as{" "}
            <code className={docInlineCodeClass}>bg-card</code>, <code className={docInlineCodeClass}>text-muted-foreground</code>{" "}
            and <code className={docInlineCodeClass}>border-border</code>, which read CSS variables defined in{" "}
            <code className={docInlineCodeClass}>globals.css</code>. Change a variable and every component follows.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong className="font-medium text-foreground">If you ran</strong>{" "}
            <code className={docInlineCodeClass}>npx shadcn@latest init</code>
            , it has already added these variables, so do not replace your file with the block below; edit the values you
            want to change. <strong className="font-medium text-foreground">If you skipped shadcn</strong>, add this block
            to <code className={docInlineCodeClass}>src/app/globals.css</code> under the import line. It uses{" "}
            <strong className="font-medium text-foreground">OKLCH colours</strong>, which keep light and dark themes
            visually balanced, and an <code className={docInlineCodeClass}>@theme inline</code> block that turns each
            variable into a Tailwind class.
          </p>
          <DocPre>{`@import "tailwindcss";

/* Map CSS variables to Tailwind color/radius utilities */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, "Cascadia Code", Menlo, Monaco, Consolas, monospace;
}

/* Light mode tokens */
html {
  --background: oklch(0.99 0.002 260);
  --foreground: oklch(0.16 0.015 260);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.16 0.015 260);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.16 0.015 260);
  --primary: oklch(0.28 0.02 260);
  --primary-foreground: oklch(0.99 0 0);
  --secondary: oklch(0.96 0.006 260);
  --secondary-foreground: oklch(0.25 0.015 260);
  --muted: oklch(0.96 0.006 260);
  --muted-foreground: oklch(0.48 0.015 260);
  --accent: oklch(0.94 0.008 260);
  --accent-foreground: oklch(0.18 0.015 260);
  --destructive: oklch(0.55 0.22 25);
  --border: oklch(0.90 0.008 260);
  --input: oklch(0.90 0.008 260);
  --ring: oklch(0.38 0.02 260);
  --radius: 0.625rem;
}

/* Dark mode tokens (add class="dark" to <html>) */
html.dark {
  --background: oklch(0.09 0.008 260);
  --foreground: oklch(0.97 0.006 260);
  --card: oklch(0.13 0.006 260);
  --card-foreground: oklch(0.97 0 0);
  --popover: oklch(0.13 0.006 260);
  --popover-foreground: oklch(0.97 0 0);
  --primary: oklch(0.82 0.02 260);
  --primary-foreground: oklch(0.12 0.015 260);
  --secondary: oklch(0.20 0.006 260);
  --secondary-foreground: oklch(0.97 0 0);
  --muted: oklch(0.20 0.006 260);
  --muted-foreground: oklch(0.62 0.006 260);
  --accent: oklch(0.20 0.006 260);
  --accent-foreground: oklch(0.97 0 0);
  --destructive: oklch(0.55 0.22 25);
  --border: oklch(0.25 0.006 260);
  --input: oklch(0.25 0.006 260);
  --ring: oklch(0.55 0.015 260);
}`}</DocPre>
        </DocSection>

        <DocSection title="Dark mode">
          <p className="text-sm text-muted-foreground">
            Nexus UI applies dark mode via a{" "}
            <code className={docInlineCodeClass}>.dark</code> class on the{" "}
            <code className={docInlineCodeClass}>{"<html>"}</code> element (not the{" "}
            <code className={docInlineCodeClass}>media</code> strategy). Register the custom variant
            once in your globals, right after the Tailwind import (shadcn init adds this line for you):
          </p>
          <DocPre>{`@import "tailwindcss";

@custom-variant dark (&:is(.dark *));`}</DocPre>
          <p className="text-sm text-muted-foreground">
            Then toggle <code className={docInlineCodeClass}>dark</code> on{" "}
            <code className={docInlineCodeClass}>{"<html>"}</code> via your theme provider (
            <code className={docInlineCodeClass}>next-themes</code> or a custom script).
          </p>
          <div data-doc-widget><DarkModeDemo /></div>
        </DocSection>

        <DocSection title="Check it works">
          <DocPre>{`npm run dev`}</DocPre>
          <p className="text-sm text-muted-foreground">
            Open{" "}
            <code className={docInlineCodeClass}>http://localhost:3000</code> and add a class such as{" "}
            <code className={docInlineCodeClass}>bg-primary text-primary-foreground</code> to any element; it should pick up
            the colours from your tokens. Next, set up the{" "}
            <Link href="/docs/add-utilities" className="text-link underline-offset-4 hover:underline">
              cn() utility helper
            </Link>{" "}
            that components use to merge class names.
          </p>
        </DocSection>

        <DocSection title="Why Tailwind v4?">
          <p className="text-sm text-muted-foreground">
            Nexus UI is built entirely on Tailwind v4. Here is what changed and why it matters:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              ["No tailwind.config.js", "All configuration lives in CSS — no JavaScript config file needed."],
              ["CSS-first tokens", "@theme inline maps CSS variables directly to utilities like bg-primary and text-foreground."],
              ["OKLCH colors", "Perceptually uniform color space — light and dark tokens stay consistent across hue and brightness."],
              ["PostCSS plugin only", "@tailwindcss/postcss replaces the old tailwindcss + autoprefixer pair."],
              ["Native CSS layers", "Tailwind v4 uses @layer internally, giving you cleaner cascade control with no extra config."],
              ["Faster builds", "The new Rust-based engine makes cold builds and incremental compiles significantly faster."],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-primary">—</span>
                <span>
                  <strong className="font-medium text-foreground">{title}</strong>
                  {" — "}
                  {desc}
                </span>
              </li>
            ))}
          </ul>
        </DocSection>

        <DocFooterNav
          prev={{ href: "/docs/install-nextjs", label: "Install Next.js" }}
          next={{ href: "/docs/add-utilities", label: "Add utilities" }}
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
