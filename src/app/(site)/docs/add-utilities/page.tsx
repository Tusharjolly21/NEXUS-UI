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
        description="Install clsx and tailwind-merge and create the cn() helper in src/lib/utils.ts, the className utility every Nexus UI component imports."
        slug="add-utilities"
      />
      <DocPageShell>
        <DocPageHeader
          title="Add utilities: the cn() helper"
          description="Utility helpers keep className composition predictable when variants, state, and Tailwind strings collide. Nexus UI components use clsx plus tailwind-merge behind a single cn() export, and Framer Motion for animation."
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
            <code className={docInlineCodeClass}>tailwind-merge</code>{" "}
            knows Tailwind&apos;s utility
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

        <DocSection title="Already ran shadcn init?">
          <p className="text-sm text-muted-foreground">
            Then <code className={docInlineCodeClass}>npx shadcn@latest init</code> (step 2 of the{" "}
            <Link href="/docs/installation" className="text-link underline-offset-4 hover:underline">
              Quick Start
            </Link>
            ) already installed <code className={docInlineCodeClass}>clsx</code> and{" "}
            <code className={docInlineCodeClass}>tailwind-merge</code> and created{" "}
            <code className={docInlineCodeClass}>src/lib/utils.ts</code>. Open that file, check it exports{" "}
            <code className={docInlineCodeClass}>cn</code>, and skip to step 3. Follow steps 1 and 2 only if you did not use
            shadcn, or the file is missing.
          </p>
        </DocSection>

        <DocSection title="1. Install dependencies">
          <p className="text-sm text-muted-foreground">
            Install the two libraries <code className={docInlineCodeClass}>cn()</code> is built from:{" "}
            <code className={docInlineCodeClass}>clsx</code> for conditional class logic and{" "}
            <code className={docInlineCodeClass}>tailwind-merge</code> for conflict resolution. Nexus UI components also
            animate with <code className={docInlineCodeClass}>framer-motion</code>, so add that too:
          </p>
          <DocPre>{`npm install clsx tailwind-merge framer-motion`}</DocPre>
        </DocSection>

        <DocSection title="2. Create the cn() helper">
          <p className="text-sm text-muted-foreground">
            A new Next.js project has no <code className={docInlineCodeClass}>src/lib</code> folder, so create the folder
            and the file. In your editor, make a folder named <code className={docInlineCodeClass}>lib</code> inside{" "}
            <code className={docInlineCodeClass}>src</code>, then a file named{" "}
            <code className={docInlineCodeClass}>utils.ts</code> inside it (or run{" "}
            <code className={docInlineCodeClass}>mkdir -p src/lib && touch src/lib/utils.ts</code> on macOS and Linux).
            Paste this into <code className={docInlineCodeClass}>src/lib/utils.ts</code>. Components import it as{" "}
            <code className={docInlineCodeClass}>@/lib/utils</code>:
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
            <code className={docInlineCodeClass}>twMerge</code>{" "}
            understands Tailwind&apos;s utility
            groups and strips any earlier arguments that conflict with later ones, so design-system
            defaults and consumer overrides always compose safely:
          </p>
          <DocPre>{`// Without twMerge — unpredictable winner
"p-4 p-6"              // both classes in DOM; CSS order decides

// With twMerge — later argument always wins
cn("p-4", "p-6")       // → "p-6"
cn("p-4", props.className)  // consumer override is respected`}</DocPre>
        </DocSection>

        <DocSection title="Verify the setup">
          <p className="text-sm text-muted-foreground">
            Import <code className={docInlineCodeClass}>cn</code> in any component, for example{" "}
            <code className={docInlineCodeClass}>src/app/page.tsx</code>, and log the result:
          </p>
          <DocPre>{`import { cn } from "@/lib/utils";

// logs: rounded-xl bg-primary text-white px-6
const cls = cn("rounded-xl bg-muted", "bg-primary text-white", "px-4 px-6");
console.log(cls);`}</DocPre>
          <p className="text-sm text-muted-foreground">
            The editor should show no import error, and the string printed in the terminal running <code className={docInlineCodeClass}>npm run dev</code> should contain only{" "}
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
