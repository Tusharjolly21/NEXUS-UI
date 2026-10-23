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
import { CnPlayground } from "@/components/docs/interactive/cn-playground";

export const metadata: Metadata = createMetadata({
  // The long explainer ("what is cn()", clsx vs tailwind-merge) lives in the blog guide; this page is
  // the setup step, so the two don't compete for the same searches.
  title: "Set Up the cn() Helper: clsx + tailwind-merge",
  description:
    "Install clsx and tailwind-merge and add the cn() helper to lib/utils.ts in a Next.js project: the className utility every Nexus UI component imports.",
  alternates: { canonical: "/docs/add-utilities" },
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is cn() in Tailwind CSS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "cn() is a small helper, usually in lib/utils.ts, that combines clsx and tailwind-merge: clsx builds a className string from conditional values, and tailwind-merge removes conflicting Tailwind utilities so the last one wins. It is not part of Tailwind itself; shadcn/ui popularised it.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between clsx and tailwind-merge?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "clsx only joins class names and drops falsy values. tailwind-merge understands Tailwind utility groups and removes earlier classes that conflict with later ones, e.g. twMerge('p-4 p-6') returns 'p-6'. cn() runs clsx first, then tailwind-merge.",
      },
    },
  ],
};

export default function AddUtilitiesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <TechArticleJsonLd
        title="Set Up the cn() Helper: clsx + tailwind-merge"
        description="Install clsx, tailwind-merge, and a cn() helper — the same composition pattern Nexus UI uses across components."
        slug="add-utilities"
      />
      <DocPageShell>
        <DocPageHeader
          title="Add utilities: the cn() helper"
          description="Utility helpers keep className composition predictable when variants, state, and Tailwind strings collide. Nexus UI uses clsx plus tailwind-merge behind a single cn() export — and Motion for all animation."
        />

        <DocSection title="What is cn() in Tailwind?">
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            New to it? The{" "}
            <Link href="/blog/cn-utility-tailwind" className="font-medium text-link hover:underline">
              cn() guide
            </Link>{" "}
            explains clsx vs tailwind-merge in depth, with the mistakes that silently drop classes.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <code className={docInlineCodeClass}>cn()</code> is not part of Tailwind CSS — it is a
            two-line helper that most React + Tailwind codebases (and every shadcn/ui project) keep in{" "}
            <code className={docInlineCodeClass}>lib/utils.ts</code>. It takes any mix of strings,
            conditionals, arrays, and objects, builds one className with{" "}
            <code className={docInlineCodeClass}>clsx</code>, then removes conflicting Tailwind
            utilities with <code className={docInlineCodeClass}>tailwind-merge</code>.
          </p>
        </DocSection>

        <DocSection title="clsx vs tailwind-merge">
          <p className="text-sm leading-relaxed text-muted-foreground">
            They solve different problems, which is why <code className={docInlineCodeClass}>cn()</code>{" "}
            uses both. <code className={docInlineCodeClass}>clsx</code> only joins class names and drops
            falsy values — it knows nothing about Tailwind.{" "}
            <code className={docInlineCodeClass}>tailwind-merge</code> knows Tailwind&apos;s utility
            groups, so when two classes target the same property it keeps the last one.
          </p>
          <DocPre>{`clsx("p-4", isActive && "p-6")     // → "p-4 p-6"  (both kept)
twMerge("p-4 p-6")                  // → "p-6"      (conflict resolved)
cn("p-4", isActive && "p-6")        // → "p-6"      (clsx, then twMerge)`}</DocPre>
        </DocSection>

        <DocSection title="Try it">
          <p className="text-sm leading-relaxed text-muted-foreground">
            This runs the real clsx and tailwind-merge. Switch the props and watch which classes survive.
          </p>
          <div data-doc-widget><CnPlayground /></div>
        </DocSection>

        <DocSection title="1. Install dependencies">
          <p className="text-sm text-muted-foreground">
            Install the three libraries every Nexus UI component relies on:{" "}
            <code className={docInlineCodeClass}>clsx</code> for conditional class logic,{" "}
            <code className={docInlineCodeClass}>tailwind-merge</code> for conflict resolution, and{" "}
            <code className={docInlineCodeClass}>framer-motion</code> for animations.
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
