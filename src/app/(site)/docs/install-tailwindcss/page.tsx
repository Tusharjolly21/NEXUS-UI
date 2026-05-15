import type { Metadata } from "next";
import Link from "next/link";
import {
  DocFooterNav,
  DocPageHeader,
  DocPageShell,
  DocPre,
  DocSection,
  docInlineCodeClass,
} from "@/components/docs/doc-page";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Install Tailwind CSS",
  description: "Add Tailwind CSS v4 with PostCSS to a Next.js app — aligned with Nexus-UI globals and shadcn-style tokens.",
});

export default function InstallTailwindPage() {
  return (
    <DocPageShell>
      <DocPageHeader
        title="Install Tailwind CSS"
        description="Nexus-UI uses Tailwind v4 with the PostCSS plugin, CSS-first configuration, and shared design tokens. Follow these steps on a fresh Next.js app or compare with this repository’s postcss.config and globals."
      />

      <DocSection title="Install packages">
        <p className="text-sm text-muted-foreground">From your project root:</p>
        <DocPre>{`npm install tailwindcss @tailwindcss/postcss`}</DocPre>
      </DocSection>

      <DocSection title="PostCSS">
        <p className="text-sm text-muted-foreground">
          Register the Tailwind v4 PostCSS plugin (see{" "}
          <code className={docInlineCodeClass}>postcss.config.mjs</code> in Nexus-UI).
        </p>
        <DocPre>{`export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};`}</DocPre>
      </DocSection>

      <DocSection title="Global stylesheet">
        <p className="text-sm text-muted-foreground">
          Import Tailwind once at the top of your global CSS file (for example{" "}
          <code className={docInlineCodeClass}>src/app/globals.css</code>):
        </p>
        <DocPre>{`@import "tailwindcss";

@theme inline {
  /* Map design tokens — mirror Nexus-UI’s semantic colors for consistency */
}`}</DocPre>
        <p className="text-sm text-muted-foreground">
          Import that stylesheet from your root <code className={docInlineCodeClass}>layout.tsx</code>. Layer
          component libraries (for example shadcn) after Tailwind per their docs.
        </p>
      </DocSection>

      <DocSection title="Legacy Tailwind v3">
        <p className="text-sm text-muted-foreground">
          Older projects may still use <code className={docInlineCodeClass}>tailwind.config.js</code> and{" "}
          <code className={docInlineCodeClass}>@tailwind base/components/utilities</code>. New work should prefer v4
          for parity with Nexus-UI and simpler token pipelines.
        </p>
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
  );
}
