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
  title: "CLI",
  description:
    "Use the shadcn/ui CLI for primitives, install catalog pieces via the @next-ui registry, or paste snippets from component pages.",
});

export default function CliDocsPage() {
  return (
    <DocPageShell>
      <DocPageHeader
        title="CLI"
        description="Nexus-UI ships hand-written React and Tailwind you copy from each component page. For primitives (button, dialog, tabs), the shadcn/ui CLI remains the fastest way to align with the same stack this project uses."
      />

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

      <DocSection title="@next-ui registry (shadcn add)">
        <p className="text-sm text-muted-foreground">
          You do <span className="font-medium text-foreground">not</span> need a public host to try this. Next.js serves
          files from <code className={docInlineCodeClass}>public/r/</code>, so with Nexus-UI running locally (
          <code className={docInlineCodeClass}>npm run dev</code>, default port 3000) the registry is already at{" "}
          <code className={docInlineCodeClass}>http://127.0.0.1:3000/r/terminal.json</code> (one JSON per component). In the project where you
          want the component, point <code className={docInlineCodeClass}>components.json</code> at that URL (change the
          port if your dev server uses something other than 3000):
        </p>
        <DocPre>{`"registries": {
  "@next-ui": "http://127.0.0.1:3000/r/{name}.json"
}`}</DocPre>
        <p className="text-sm text-muted-foreground">
          Keep Nexus-UI&apos;s dev server running while you run the add command in the other app. Initialize shadcn
          there if needed (<code className={docInlineCodeClass}>npx shadcn@latest init</code>), then:
        </p>
        <DocPre>{`npx shadcn@latest add @next-ui/terminal
npx shadcn@latest add @next-ui/gooey-input`}</DocPre>
        <p className="text-sm text-muted-foreground">
          The CLI installs declared dependencies (for example <code className={docInlineCodeClass}>framer-motion</code>), pulls <code className={docInlineCodeClass}>utils</code>{" "}
          from the default shadcn registry if needed, and writes files under your components alias. Registries are built from{" "}
          <code className={docInlineCodeClass}>scripts/build-registry.mjs</code> — run{" "}
          <code className={docInlineCodeClass}>npm run registry:build</code> (also runs before <code className={docInlineCodeClass}>npm run build</code>
          ).
        </p>
        <p className="text-sm text-muted-foreground">
          When you eventually deploy Nexus-UI (e.g. Vercel), set <code className={docInlineCodeClass}>NEXT_PUBLIC_SITE_URL</code>{" "}
          to your production origin and change the registry URL in consumer apps to{" "}
          <code className={docInlineCodeClass}>https://your-domain/r/{"{"}name{"}"}.json</code> so installs work without a local server.
        </p>
      </DocSection>

      <DocSection title="Nexus-UI catalog workflow">
        <p className="text-sm text-muted-foreground">
          Every catalog slug has a matching <code className={docInlineCodeClass}>public/r/&lt;name&gt;.json</code> entry. You can still open the{" "}
          <span className="font-medium text-foreground">Code</span> tab on any component page to copy React or Tailwind directly. Keep motion boundaries in{" "}
          <code className={docInlineCodeClass}>&quot;use client&quot;</code> modules when you use Framer Motion.
        </p>
      </DocSection>

      <DocSection title="Terminal component + sprite audio">
        <p className="text-sm text-muted-foreground">
          The <Link href="/demos/terminal" className="text-foreground underline-offset-4 hover:underline">Terminal</Link>{" "}
          demo uses an OGG sprite for keyboard sound effects.
          Place <code className={docInlineCodeClass}>sound.ogg</code> under{" "}
          <code className={docInlineCodeClass}>public/sounds/</code> next to{" "}
          <code className={docInlineCodeClass}>sprite-config.json</code>, or run{" "}
          <code className={docInlineCodeClass}>npm run sounds:fetch</code>. See{" "}
          <code className={docInlineCodeClass}>public/sounds/README.md</code> for download URLs and copy instructions.
        </p>
      </DocSection>

      <DocFooterNav
        prev={{ href: "/docs/add-utilities", label: "Add utilities" }}
        next={{ href: "/docs/installation", label: "Nexus-UI setup" }}
      />

      <p className="text-sm text-muted-foreground">
        <Link href="/components" className="text-muted-foreground hover:text-foreground">
          ← Components library
        </Link>
      </p>
    </DocPageShell>
  );
}
