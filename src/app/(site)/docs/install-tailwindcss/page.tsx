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
  title: "Install Tailwind CSS",
  description:
    "Add Tailwind CSS v4 with PostCSS to a Next.js project, aligned with the OKLCH design tokens and globals Nexus UI components expect. Includes shadcn config.",
  alternates: { canonical: "/docs/install-tailwindcss" },
});

export default function InstallTailwindPage() {
  return (
    <>
      <TechArticleJsonLd
        title="Install Tailwind CSS"
        description="Add Tailwind CSS v4 with PostCSS to a Next.js app — aligned with Nexus-UI globals and shadcn-style tokens."
        slug="install-tailwindcss"
      />
      <DocPageShell>
        <DocPageHeader
          title="Install Tailwind CSS"
          description="Nexus UI uses Tailwind v4 with the PostCSS plugin, CSS-first configuration, and OKLCH design tokens. Follow these steps on a fresh Next.js app or compare with this repository's postcss.config and globals."
        />

        <DocSection title="1. Create a Next.js project">
          <p className="text-sm text-muted-foreground">
            If you don&apos;t have a project yet, scaffold one with TypeScript and ESLint enabled — the
            same flags this repo uses:
          </p>
          <DocPre>{`npx create-next-app@latest my-app --typescript --eslint
cd my-app`}</DocPre>
        </DocSection>

        <DocSection title="2. Install packages">
          <p className="text-sm text-muted-foreground">
            From your project root, install Tailwind and its PostCSS plugin. Tailwind v4 ships the
            PostCSS adapter as a separate package — you do not need{" "}
            <code className={docInlineCodeClass}>autoprefixer</code> for v4 projects.
          </p>
          <DocPre>{`npm install tailwindcss @tailwindcss/postcss`}</DocPre>
          <p className="text-sm text-muted-foreground">
            No{" "}
            <code className={docInlineCodeClass}>tailwind.config.js</code> file is needed for v4 — all
            configuration moves to CSS.
          </p>
        </DocSection>

        <DocSection title="3. Configure PostCSS">
          <p className="text-sm text-muted-foreground">
            Create or update{" "}
            <code className={docInlineCodeClass}>postcss.config.mjs</code> at your project root (this
            matches{" "}
            <code className={docInlineCodeClass}>postcss.config.mjs</code> in Nexus UI):
          </p>
          <DocPre>{`export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};`}</DocPre>
        </DocSection>

        <DocSection title="4. Set up globals.css">
          <p className="text-sm text-muted-foreground">
            Replace your{" "}
            <code className={docInlineCodeClass}>src/app/globals.css</code> with a Tailwind v4 import
            and your design token definitions. Nexus UI uses{" "}
            <strong className="font-medium text-foreground">OKLCH color values</strong> for consistent
            perceptual luminance across light and dark themes, and a{" "}
            <code className={docInlineCodeClass}>@theme inline</code> block to map shadcn-style CSS
            variables to Tailwind utilities.
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
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
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
          <p className="text-sm text-muted-foreground">
            Import this stylesheet from your root{" "}
            <code className={docInlineCodeClass}>src/app/layout.tsx</code>:
          </p>
          <DocPre>{`import "./globals.css";`}</DocPre>
        </DocSection>

        <DocSection title="5. Dark mode variant">
          <p className="text-sm text-muted-foreground">
            Nexus UI applies dark mode via a{" "}
            <code className={docInlineCodeClass}>.dark</code> class on the{" "}
            <code className={docInlineCodeClass}>{"<html>"}</code> element (not the{" "}
            <code className={docInlineCodeClass}>media</code> strategy). Register the custom variant
            once in your globals, right after the Tailwind import:
          </p>
          <DocPre>{`@import "tailwindcss";

@custom-variant dark (&:is(.dark *));`}</DocPre>
          <p className="text-sm text-muted-foreground">
            Then toggle <code className={docInlineCodeClass}>dark</code> on{" "}
            <code className={docInlineCodeClass}>{"<html>"}</code> via your theme provider (
            <code className={docInlineCodeClass}>next-themes</code> or a custom script).
          </p>
        </DocSection>

        <DocSection title="6. Start the dev server">
          <DocPre>{`npm run dev`}</DocPre>
          <p className="text-sm text-muted-foreground">
            Open{" "}
            <code className={docInlineCodeClass}>http://localhost:3000</code>. Tailwind utilities and
            your OKLCH tokens should be active. Next, add the{" "}
            <Link href="/docs/add-utilities" className="text-link underline-offset-4 hover:underline">
              cn() utility helper
            </Link>{" "}
            so components can merge class strings safely.
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
