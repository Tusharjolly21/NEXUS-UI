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
  title: "Add utilities",
  description:
    "Install clsx, tailwind-merge, and a cn() helper — the className utility every Nexus UI component relies on for conditional Tailwind class merging.",
  alternates: { canonical: "/docs/add-utilities" },
});

export default function AddUtilitiesPage() {
  return (
    <>
      <TechArticleJsonLd
        title="Add utilities"
        description="Install clsx, tailwind-merge, and a cn() helper — the same composition pattern Nexus UI uses across components."
        slug="add-utilities"
      />
      <DocPageShell>
        <DocPageHeader
          title="Add utilities"
          description="Utility helpers keep className composition predictable when variants, state, and Tailwind strings collide. Nexus UI uses clsx plus tailwind-merge behind a single cn() export — and Motion for all animation."
        />

        <DocSection title="1. Install dependencies">
          <p className="text-sm text-muted-foreground">
            Install the three libraries every Nexus UI component relies on:{" "}
            <code className={docInlineCodeClass}>clsx</code> for conditional class logic,{" "}
            <code className={docInlineCodeClass}>tailwind-merge</code> for conflict resolution, and{" "}
            <code className={docInlineCodeClass}>motion</code> for animations.
          </p>
          <DocPre>{`npm install clsx tailwind-merge motion`}</DocPre>
          <p className="text-sm text-muted-foreground">
            If you prefer the original Framer Motion package name, both are compatible — Nexus UI
            components import from{" "}
            <code className={docInlineCodeClass}>motion/react</code> (the Motion library):
          </p>
          <DocPre>{`npm install clsx tailwind-merge framer-motion`}</DocPre>
        </DocSection>

        <DocSection title="2. Create the cn() helper">
          <p className="text-sm text-muted-foreground">
            Create{" "}
            <code className={docInlineCodeClass}>src/lib/utils.ts</code> (this exact file is used
            throughout Nexus UI):
          </p>
          <DocPre>{`import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`}</DocPre>
          <p className="text-sm text-muted-foreground">
            The <code className={docInlineCodeClass}>cn()</code> function accepts any mix of strings,
            arrays, and objects (the full{" "}
            <code className={docInlineCodeClass}>clsx</code> API), then runs the result through{" "}
            <code className={docInlineCodeClass}>twMerge</code> so conflicting Tailwind utilities are
            resolved by last-argument-wins semantics.
          </p>
        </DocSection>

        <DocSection title="3. Use cn() in components">
          <p className="text-sm text-muted-foreground">
            Pass static base classes alongside conditional prop-driven fragments — the helper keeps
            the final string clean:
          </p>
          <DocPre>{`import { cn } from "@/lib/utils";

function Card({ className, active }: { className?: string; active?: boolean }) {
  return (
    <div
      className={cn(
        // base styles
        "rounded-xl border border-border bg-card p-4",
        // conditional variant
        active && "border-primary ring-2 ring-primary/30",
        // consumer override wins
        className,
      )}
    />
  );
}`}</DocPre>
        </DocSection>

        <DocSection title="Why tailwind-merge?">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Tailwind classes are resolved by the order they appear in your CSS output, not the order
            they appear in the <code className={docInlineCodeClass}>className</code> string.
            Concatenating two conflicting utilities — e.g.{" "}
            <code className={docInlineCodeClass}>p-4 p-6</code> — produces unpredictable results
            because whichever class was declared last in the stylesheet wins, regardless of string
            order.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <code className={docInlineCodeClass}>twMerge</code> understands Tailwind&apos;s utility
            groups and strips any earlier arguments that conflict with later ones, so design-system
            defaults and consumer overrides always compose safely:
          </p>
          <DocPre>{`// Without twMerge — unpredictable winner
"p-4 p-6"              // both classes in DOM; CSS order decides

// With twMerge — later argument always wins
cn("p-4", "p-6")       // → "p-6"
cn("p-4", props.className)  // consumer override is respected`}</DocPre>
        </DocSection>

        <DocSection title="Next.js 15 + React 19 overrides">
          <p className="text-sm text-muted-foreground">
            If you are using Next.js 15 with React 19 and see peer-dependency warnings from the{" "}
            <code className={docInlineCodeClass}>motion</code> package, add an overrides block to your{" "}
            <code className={docInlineCodeClass}>package.json</code>:
          </p>
          <DocPre>{`{
  "overrides": {
    "motion": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    }
  }
}`}</DocPre>
          <p className="text-sm text-muted-foreground">
            If you are using <code className={docInlineCodeClass}>framer-motion</code> instead of{" "}
            <code className={docInlineCodeClass}>motion</code>, replace the key accordingly:
          </p>
          <DocPre>{`{
  "overrides": {
    "framer-motion": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    }
  }
}`}</DocPre>
          <p className="text-sm text-muted-foreground">
            Run <code className={docInlineCodeClass}>npm install</code> again after editing{" "}
            <code className={docInlineCodeClass}>package.json</code>.
          </p>
        </DocSection>

        <DocSection title="Verify the setup">
          <p className="text-sm text-muted-foreground">
            Import <code className={docInlineCodeClass}>cn</code> in any component and check the
            output. With TypeScript the function signature is:
          </p>
          <DocPre>{`import { cn } from "@/lib/utils";

// resolves to "rounded-xl bg-primary text-white px-6"
const cls = cn("rounded-xl bg-muted", "bg-primary text-white", "px-4 px-6");
console.log(cls);`}</DocPre>
          <p className="text-sm text-muted-foreground">
            No TypeScript errors and the output string should contain only{" "}
            <code className={docInlineCodeClass}>px-6</code> (not{" "}
            <code className={docInlineCodeClass}>px-4</code>) and{" "}
            <code className={docInlineCodeClass}>bg-primary</code> (not{" "}
            <code className={docInlineCodeClass}>bg-muted</code>). If the imports resolve correctly
            your utility layer is ready.
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
    </>
  );
}
