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
  title: "Add utilities",
  description: "Install clsx, tailwind-merge, and a cn() helper — the same composition pattern Nexus-UI uses across components.",
});

export default function AddUtilitiesPage() {
  return (
    <DocPageShell>
      <DocPageHeader
        title="Add utilities"
        description="Utility helpers keep className composition predictable when variants, state, and Tailwind strings collide. Nexus-UI uses clsx plus tailwind-merge behind a single cn() export."
      />

      <DocSection title="Install dependencies">
        <DocPre>{`npm install clsx tailwind-merge`}</DocPre>
        <p className="text-sm text-muted-foreground">
          Motion is already a first-class dependency in Nexus-UI for previews; add{" "}
          <code className={docInlineCodeClass}>framer-motion</code> (or <code className={docInlineCodeClass}>motion</code>
          ) when you build animated surfaces.
        </p>
      </DocSection>

      <DocSection title="cn() helper">
        <p className="text-sm text-muted-foreground">
          Place a small util next to your UI layer (this repo uses <code className={docInlineCodeClass}>src/lib/utils.ts</code>
          ):
        </p>
        <DocPre>{`import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`}</DocPre>
        <p className="text-sm text-muted-foreground">
          Use <code className={docInlineCodeClass}>cn()</code> anywhere you merge Tailwind classes with conditional or
          prop-driven fragments — buttons, cards, and layout shells.
        </p>
      </DocSection>

      <DocSection title="Why twMerge">
        <p className="text-sm text-muted-foreground">
          Tailwind classes are order-sensitive in the final string. <code className={docInlineCodeClass}>twMerge</code>{" "}
          resolves conflicting utilities so later arguments win, which keeps design-system wrappers and overrides safe.
        </p>
      </DocSection>

      <DocFooterNav
        prev={{ href: "/docs/install-tailwindcss", label: "Install Tailwind CSS" }}
        next={{ href: "/docs/cli", label: "CLI" }}
      />

      <p className="text-sm text-muted-foreground">
        <Link href="/components" className="text-muted-foreground hover:text-foreground">
          ← Components library
        </Link>
      </p>
    </DocPageShell>
  );
}
