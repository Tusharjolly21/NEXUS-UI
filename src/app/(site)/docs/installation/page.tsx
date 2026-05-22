import type { Metadata } from "next";
import Link from "next/link";
import { DocFooterNav, TechArticleJsonLd, docInlineCodeClass } from "@/components/docs/doc-page";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Installation",
  description:
    "Run Nexus-UI locally: Node, dependencies, environment variables, and optional Supabase plus Stripe.",
  alternates: { canonical: "/docs/installation" },
});

export default function InstallationPage() {
  return (
    <>
      <TechArticleJsonLd
        title="Installation"
        description="Run Nexus-UI locally: Node, dependencies, environment variables, and optional Supabase plus Stripe."
        slug="installation"
      />
      <div className="mx-auto max-w-3xl space-y-12 px-4 py-14">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary/80">Docs</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Installation
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Nexus-UI is a Next.js App Router app with Tailwind CSS v4, shadcn-style UI, Framer Motion,
          optional Supabase auth, and Stripe for premium checkout. Follow the steps below to run it
          on your machine.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">1. Prerequisites</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>Node.js 20+ recommended</li>
          <li>npm, pnpm, or yarn</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">2. Install dependencies</h2>
        <p className="text-sm text-muted-foreground">
          From the project root (where <code className={docInlineCodeClass}>package.json</code> lives):
        </p>
        <pre className="overflow-x-auto rounded-xl border border-border bg-muted dark:bg-zinc-950 p-4 text-[13px] leading-relaxed text-muted-foreground">
          <code>npm install</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">3. Environment variables</h2>
        <p className="text-sm text-muted-foreground">
          Copy the example file and fill in values. Auth, bookmarks, and admin routes expect Supabase;
          pricing flows expect Stripe keys and price IDs.
        </p>
        <pre className="overflow-x-auto rounded-xl border border-border bg-muted dark:bg-zinc-950 p-4 text-[13px] leading-relaxed text-muted-foreground">
          <code>cp .env.example .env.local</code>
        </pre>
        <p className="text-sm text-muted-foreground">
          See <code className={docInlineCodeClass}>.env.example</code> for every variable name. You can ship the
          marketing shell without Supabase or Stripe by leaving those keys empty; protected routes will degrade
          gracefully where the code allows.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">4. Dev server</h2>
        <pre className="overflow-x-auto rounded-xl border border-border bg-muted dark:bg-zinc-950 p-4 text-[13px] leading-relaxed text-muted-foreground">
          <code>npm run dev</code>
        </pre>
        <p className="text-sm text-muted-foreground">
          Open <span className="text-muted-foreground">http://localhost:3000</span>. Browse{" "}
          <Link href="/components" className="text-primary underline-offset-4 hover:underline">
            Components
          </Link>{" "}
          for live previews and copy-ready snippets on each detail page.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">5. Production build</h2>
        <pre className="overflow-x-auto rounded-xl border border-border bg-muted dark:bg-zinc-950 p-4 text-[13px] leading-relaxed text-muted-foreground">
          <code>npm run build</code>
        </pre>
      </section>

      <section className="space-y-3 border-t border-border pt-10">
        <h2 className="text-lg font-semibold text-foreground">Stack guides</h2>
        <p className="text-sm text-muted-foreground">
          Step-by-step docs on this site match the Nexus-UI stack. shadcn/ui and Motion link out to upstream
          references when you need vendor-specific detail.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <Link href="/docs/install-nextjs" className="text-primary underline-offset-4 hover:underline">
              Install Next.js
            </Link>
          </li>
          <li>
            <Link href="/docs/install-tailwindcss" className="text-primary underline-offset-4 hover:underline">
              Install Tailwind CSS
            </Link>
          </li>
          <li>
            <Link href="/docs/add-utilities" className="text-primary underline-offset-4 hover:underline">
              Add utilities
            </Link>
          </li>
          <li>
            <Link href="/docs/cli" className="text-primary underline-offset-4 hover:underline">
              CLI (shadcn)
            </Link>
          </li>
          <li>
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="https://ui.shadcn.com/docs/installation/next"
              target="_blank"
              rel="noreferrer"
            >
              shadcn/ui — Next.js
            </a>
          </li>
          <li>
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="https://motion.dev/docs/react-installation"
              target="_blank"
              rel="noreferrer"
            >
              Motion for React
            </a>
          </li>
        </ul>
      </section>

      <DocFooterNav next={{ href: "/docs/install-nextjs", label: "Install Next.js" }} />

      <p className="text-sm text-muted-foreground">
        <Link href="/components" className="text-muted-foreground hover:text-foreground">
          ← Back to components
        </Link>
      </p>
    </div>
    </>
  );
}
