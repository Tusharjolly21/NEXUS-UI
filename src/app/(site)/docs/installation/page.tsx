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
  title: "Quick Start",
  description:
    "Get your own app running with Nexus UI components in minutes — Next.js, Tailwind CSS v4, shadcn/ui, and your first component.",
  alternates: { canonical: "/docs/installation" },
});

export default function InstallationPage() {
  return (
    <>
      <TechArticleJsonLd
        title="Quick Start"
        description="Get your own app running with Nexus UI components in minutes — Next.js, Tailwind CSS v4, shadcn/ui, and your first component."
        slug="installation"
      />
      <DocPageShell>
        <DocPageHeader
          title="Quick Start"
          description="From zero to your first Nexus UI component in six steps. Create a Next.js app with Tailwind and an import alias, initialize shadcn/ui, connect the registry, and install a component."
        />

        <DocSection title="1. Create a Next.js project">
          <p className="text-sm text-muted-foreground">
            Nexus UI targets the App Router with TypeScript. Scaffold a new project:
          </p>
          <DocPre>{`npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd my-app`}</DocPre>
          <p className="text-sm text-muted-foreground">
            This command sets up the App Router, TypeScript, Tailwind CSS, ESLint, a{" "}
            <code className={docInlineCodeClass}>src/</code> directory, and the{" "}
            <code className={docInlineCodeClass}>@/*</code> alias used by Nexus UI imports.
          </p>
        </DocSection>

        <DocSection title="2. Confirm Tailwind CSS v4">
          <p className="text-sm text-muted-foreground">
            The create command above already installs Tailwind. Confirm that{" "}
            <code className={docInlineCodeClass}>src/app/globals.css</code> starts with the
            Tailwind import, then add or customize tokens as your design needs:
          </p>
          <DocPre>{`@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --radius-lg: var(--radius);
}

html {
  --background: oklch(0.99 0.002 260);
  --foreground: oklch(0.16 0.015 260);
  --primary: oklch(0.28 0.02 260);
  --primary-foreground: oklch(0.99 0 0);
  --muted: oklch(0.96 0.006 260);
  --muted-foreground: oklch(0.48 0.015 260);
  --border: oklch(0.90 0.008 260);
  --radius: 0.625rem;
}

html.dark {
  --background: oklch(0.09 0.008 260);
  --foreground: oklch(0.97 0.006 260);
  --primary: oklch(0.82 0.02 260);
  --primary-foreground: oklch(0.12 0.015 260);
  --muted: oklch(0.20 0.006 260);
  --muted-foreground: oklch(0.62 0.006 260);
  --border: oklch(0.25 0.006 260);
}`}</DocPre>
          <p className="text-sm text-muted-foreground">
            See the{" "}
            <Link
              href="/docs/install-tailwindcss"
              className="text-primary underline-offset-4 hover:underline"
            >
              full Tailwind guide
            </Link>{" "}
            for the complete token set including sidebar, chart, and popover colors.
          </p>
        </DocSection>

        <DocSection title="3. Add the cn() utility">
          <p className="text-sm text-muted-foreground">
            Every Nexus UI component imports{" "}
            <code className={docInlineCodeClass}>cn</code> from{" "}
            <code className={docInlineCodeClass}>@/lib/utils</code>. Install the dependencies and
            create the file:
          </p>
          <DocPre>{`npm install clsx tailwind-merge motion`}</DocPre>
          <DocPre>{`// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`}</DocPre>
        </DocSection>

        <DocSection title="4. Initialize shadcn/ui">
          <p className="text-sm text-muted-foreground">
            Nexus UI components compose on top of shadcn primitives. Run the initializer — it wires
            CSS variables, writes{" "}
            <code className={docInlineCodeClass}>components.json</code>, and installs shared
            dependencies:
          </p>
          <DocPre>{`npx shadcn@latest init`}</DocPre>
          <p className="text-sm text-muted-foreground">
            Pick a style and base color that match your brand. Add only the primitives you need:
          </p>
          <DocPre>{`npx shadcn@latest add button dialog tabs`}</DocPre>
        </DocSection>

        <DocSection title="5. Add your first component">
          <p className="text-sm text-muted-foreground">
            Two ways to get a Nexus UI component into your project:
          </p>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-primary">A.</span>
              <span>
                <strong className="font-medium text-foreground">Copy from the detail page</strong>{" "}
                — open any component on{" "}
                <Link
                  href="/components"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  /components
                </Link>
                , switch to the <strong className="font-medium text-foreground">Code</strong> tab,
                and paste the React source into your project.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-primary">B.</span>
              <span>
                <strong className="font-medium text-foreground">Install via the CLI</strong> — add
                the <code className={docInlineCodeClass}>@nexus-labs</code> registry to your{" "}
                <code className={docInlineCodeClass}>components.json</code> and pull a component
                directly:
              </span>
            </li>
          </ul>
          <DocPre>{`// components.json
"registries": {
  "@nexus-labs": "https://nexus-ui.com/api/registry/{name}"
}`}</DocPre>
          <DocPre>{`npx shadcn@latest add @nexus-labs/wheel-selector`}</DocPre>
          <p className="text-sm text-muted-foreground">
            The CLI installs declared dependencies (e.g.{" "}
            <code className={docInlineCodeClass}>framer-motion</code>), pulls the{" "}
            <code className={docInlineCodeClass}>utils</code> helper if missing, and writes files
            under your components alias. See the{" "}
            <Link href="/docs/cli" className="text-primary underline-offset-4 hover:underline">
              CLI guide
            </Link>{" "}
            for full details.
          </p>
          <p className="text-sm text-muted-foreground">
            Premium components and blocks use the same API endpoint with your Nexus UI API key
            supplied as an Authorization header. The installation panel on each premium item
            provides that configuration.
          </p>
        </DocSection>

        <DocSection title="6. Start the dev server">
          <DocPre>{`npm run dev`}</DocPre>
          <p className="text-sm text-muted-foreground">
            Open{" "}
            <code className={docInlineCodeClass}>http://localhost:3000</code> and your first Nexus
            UI component should be live. Browse{" "}
            <Link href="/components" className="text-primary underline-offset-4 hover:underline">
              /components
            </Link>{" "}
            for live previews and copy-ready snippets on every detail page.
          </p>
        </DocSection>

        <DocFooterNav
          prev={{ href: "/docs/introduction", label: "Introduction" }}
          next={{ href: "/docs/install-nextjs", label: "Install Next.js" }}
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
