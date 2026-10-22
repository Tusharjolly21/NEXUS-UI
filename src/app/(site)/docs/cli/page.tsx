import type { Metadata } from "next";
import { ProNote } from "@/components/pro/pro-access";
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
import { CliSimulator } from "@/components/docs/interactive/cli-simulator";

export const metadata: Metadata = createMetadata({
  title: "Install with the shadcn CLI (@nexus-labs registry)",
  description:
    "Add the @nexus-labs registry to components.json, then install Nexus UI Tailwind components and blocks with npx shadcn add. Premium items use an API key.",
  alternates: { canonical: "/docs/cli" },
});

export default function CliDocsPage() {
  return (
    <>
      <TechArticleJsonLd
        title="CLI"
        description="Use the shadcn/ui CLI for primitives, install catalog pieces via the @nexus-labs registry, or paste snippets from component pages."
        slug="cli"
      />
      <DocPageShell>
      <DocPageHeader
        title="CLI"
        description="Nexus-UI ships hand-written React and Tailwind you copy from each component page. For primitives (button, dialog, tabs), the shadcn/ui CLI remains the fastest way to align with the same stack this project uses."
      />

      <DocSection title="See what add does">
        <p className="text-sm text-muted-foreground">
          Pick something to add and run it. The terminal shows each step the shadcn CLI takes and the tree shows the
          files that land in your project.
        </p>
        <div data-doc-widget><CliSimulator /></div>
      </DocSection>

      <DocSection title="Initialize shadcn/ui">
        <p className="text-sm text-muted-foreground">
          From your Next.js app root, run the initializer. It writes{" "}
          <code className={docInlineCodeClass}>components.json</code>, wires CSS variables, and installs shared UI
          dependencies.
        </p>
        <DocPre>{`npx shadcn@latest init`}</DocPre>
        <p className="text-sm text-muted-foreground">
          Choose a style and base color that match your brand; you can always tune tokens later in{" "}
          <code className={docInlineCodeClass}>globals.css</code>.
        </p>
      </DocSection>

      <DocSection title="Add components">
        <DocPre>{`npx shadcn@latest add button
npx shadcn@latest add dialog tabs`}</DocPre>
        <p className="text-sm text-muted-foreground">
          Add only what you need. Nexus-UI marketing and library views compose many primitives from this baseline.
        </p>
      </DocSection>

      <DocSection title="Monorepos">
        <p className="text-sm text-muted-foreground">Target a workspace package with the working directory flag:</p>
        <DocPre>{`npx shadcn@latest init -c ./apps/web
npx shadcn@latest add card -c ./apps/web`}</DocPre>
      </DocSection>

      <DocSection title="@nexus-labs registry (shadcn add)">
        <p className="text-sm text-muted-foreground">
          Add the Nexus UI hosted registry to your project&apos;s{" "}
          <code className={docInlineCodeClass}>components.json</code>:
        </p>
        <DocPre>{`{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "@nexus-labs": "https://www.nexus-ui.com/api/registry/{name}"
  }
}`}</DocPre>
        <p className="text-sm text-muted-foreground">
          Then pull any free component or block by its install name:
        </p>
        <DocPre>{`npx shadcn@latest add @nexus-labs/glow-button
npx shadcn@latest add @nexus-labs/pricing-section`}</DocPre>
        <p className="text-sm text-muted-foreground">
          The CLI installs declared dependencies (e.g.{" "}
          <code className={docInlineCodeClass}>framer-motion</code>), pulls the{" "}
          <code className={docInlineCodeClass}>utils</code> helper if missing, and writes files under
          your components alias.
        </p>
        <p className="text-sm text-muted-foreground">
          Skipped the <code className={docInlineCodeClass}>registries</code> step? Without it the CLI
          can&apos;t resolve <code className={docInlineCodeClass}>@nexus-labs/…</code>. Install any free item
          straight from its URL instead:
        </p>
        <DocPre>{`npx shadcn@latest add https://www.nexus-ui.com/api/registry/wheel-selector`}</DocPre>
      </DocSection>

      <DocSection title="Install premium items">
        <p className="text-sm text-muted-foreground">
          Premium components and blocks use the same registry endpoint with the API key from your
          Nexus UI dashboard:
        </p>
        <ProNote className="mt-3">
          You have Pro, so your key is ready to make.{" "}
          <Link href="/dashboard/api-key" className="font-medium text-link underline-offset-4 hover:underline">
            Create your API token
          </Link>
          , then paste it where the config below says to.
        </ProNote>
        <DocPre>{`{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "@nexus-labs": {
      "url": "https://www.nexus-ui.com/api/registry/{name}",
      "headers": {
        "Authorization": "Bearer YOUR_NEXUS_API_KEY"
      }
    }
  }
}`}</DocPre>
        <DocPre>{`npx shadcn@latest add @nexus-labs/text-animations`}</DocPre>
      </DocSection>

      <DocSection title="Nexus UI catalog workflow">
        <p className="text-sm text-muted-foreground">
          Every component in the{" "}
          <Link href="/components" className="text-link underline-offset-4 hover:underline">
            catalog
          </Link>{" "}
          has a matching registry entry. You can also open the{" "}
          <span className="font-medium text-foreground">Code</span> tab on any component page to copy
          React source directly. Keep motion boundaries in{" "}
          <code className={docInlineCodeClass}>&quot;use client&quot;</code> modules when you use
          Framer Motion.
        </p>
      </DocSection>

      <DocFooterNav
        prev={{ href: "/docs/add-utilities", label: "Add utilities" }}
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
