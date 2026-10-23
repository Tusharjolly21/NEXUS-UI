import type { Metadata } from "next";
import type { ReactNode } from "react";
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
import { SetupChecklist } from "@/components/docs/setup-checklist";
import { docSectionId } from "@/lib/doc-anchor";
import { ProNote } from "@/components/pro/pro-access";
import { API_KEY_ENV_VAR, REGISTRIES_PRO, envLocalLine, registryAddCommand } from "@/lib/registry-config";

export const metadata: Metadata = createMetadata({
  title: "Quick Start",
  description:
    "Create a Next.js project, set up shadcn/ui and add your first Nexus UI component, free or Pro, with the CLI or by copying the files by hand.",
  alternates: { canonical: "/docs/installation" },
});

const STEPS = [
  { id: docSectionId("1. Create a Next.js project"), title: "Create a Next.js project" },
  { id: docSectionId("2. Set up shadcn/ui"), title: "Set up shadcn/ui" },
  { id: docSectionId("3. Add a free component with the CLI"), title: "Add a free component (CLI)" },
  { id: docSectionId("4. Add a Pro component with the CLI"), title: "Add a Pro component (CLI)" },
  { id: docSectionId("5. Or copy a component by hand"), title: "Or copy it by hand" },
  { id: docSectionId("6. Use it in a page"), title: "Use it in a page" },
];

const code = docInlineCodeClass;
const link = "text-link underline-offset-4 hover:underline";

/** A numbered list for the small steps inside one section. */
function Steps({ children }: { children: ReactNode }) {
  return (
    <ol className="list-decimal space-y-4 pl-5 text-sm leading-relaxed text-muted-foreground marker:font-semibold marker:text-foreground">
      {children}
    </ol>
  );
}

function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-medium text-foreground">{children}</strong>;
}

export default function InstallationPage() {
  return (
    <>
      <TechArticleJsonLd
        title="Quick Start"
        description="Create a Next.js project, set up shadcn/ui and add your first Nexus UI component, free or Pro, with the CLI or by copying the files by hand."
        slug="installation"
      />
      <DocPageShell>
        <DocPageHeader
          title="Quick Start"
          description="From an empty folder to a Nexus UI component on screen. Steps 1 and 2 are the same for everyone. Then add components with the CLI (steps 3 and 4) or copy the files by hand (step 5)."
        />

        <SetupChecklist steps={STEPS} />

        <p className="text-sm leading-relaxed text-muted-foreground">
          You need <Strong>Node.js 20.9 or newer</Strong> (check with <code className={code}>node -v</code>) and a
          terminal. Free components work without an account. <Strong>Pro</Strong> components need a Pro plan and an API
          key (step 4); the{" "}
          <Link href="/pricing" className={link}>
            pricing page
          </Link>{" "}
          lists what each plan includes.
        </p>

        <DocSection title="1. Create a Next.js project">
          <p className="text-sm text-muted-foreground">
            Run this in the folder where you keep your projects. It creates a new folder called{" "}
            <code className={code}>my-app</code> and moves into it:
          </p>
          <DocPre>{`npx create-next-app@latest my-app --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
cd my-app`}</DocPre>
          <p className="text-sm text-muted-foreground">
            That gives you the App Router, TypeScript, Tailwind CSS v4, ESLint, a{" "}
            <code className={code}>src/</code> folder and the <code className={code}>@/</code> import alias that every
            Nexus UI component uses (<code className={code}>@/lib/utils</code> means{" "}
            <code className={code}>src/lib/utils.ts</code>). Packages are installed for you, so there is no separate{" "}
            <code className={code}>npm install</code>. Every command from here on runs inside{" "}
            <code className={code}>my-app</code>.
          </p>
        </DocSection>

        <DocSection title="2. Set up shadcn/ui">
          <p className="text-sm text-muted-foreground">
            Nexus UI is installed with the shadcn CLI, and the components import its{" "}
            <code className={code}>cn()</code> helper. One command sets up both:
          </p>
          <DocPre>{`npx shadcn@latest init -d`}</DocPre>
          <p className="text-sm text-muted-foreground">
            <code className={code}>-d</code> accepts the defaults so it asks nothing; leave it off if you want to choose
            a style yourself. The command:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>
              creates <code className={code}>components.json</code> in the project root, the file the CLI reads its
              settings from;
            </li>
            <li>
              creates <code className={code}>src/lib/utils.ts</code> with the <code className={code}>cn()</code> helper;
            </li>
            <li>
              installs <code className={code}>clsx</code> and <code className={code}>tailwind-merge</code> (the two
              packages <code className={code}>cn()</code> is built from) and adds colour variables to{" "}
              <code className={code}>src/app/globals.css</code>.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Check that <code className={code}>src/lib/utils.ts</code> now exists. If it does not, create it yourself with
            the two-line helper on the{" "}
            <Link href="/docs/add-utilities" className={link}>
              cn() page
            </Link>
            . To understand each piece, see{" "}
            <Link href="/docs/install-nextjs" className={link}>
              Install Next.js
            </Link>
            ,{" "}
            <Link href="/docs/install-tailwindcss" className={link}>
              Install Tailwind CSS
            </Link>{" "}
            and{" "}
            <Link href="/docs/add-utilities" className={link}>
              Add utilities
            </Link>
            .
          </p>
        </DocSection>

        <DocSection title="3. Add a free component with the CLI">
          <p className="text-sm text-muted-foreground">
            We will add the Glow Button, which is free. The same two steps work for every free component and block.
          </p>
          <Steps>
            <li>
              <Strong>Tell the CLI where Nexus UI lives.</Strong> This writes one entry into your{" "}
              <code className={code}>components.json</code> for you, so there is nothing to edit by hand. Run it once per
              project:
              <div className="mt-3">
                <DocPre>{registryAddCommand()}</DocPre>
              </div>
              <span className="mt-3 block">
                Type it exactly as shown, including <code className={code}>{"{name}"}</code>. That is a placeholder the
                CLI fills in itself: when you later ask for <code className={code}>@nexus-labs/glow-button</code> it
                requests <code className={code}>https://www.nexus-ui.com/api/registry/glow-button</code>. You never
                replace it with anything.
              </span>
            </li>
            <li>
              <Strong>Install the component.</Strong>
              <div className="mt-3">
                <DocPre>{`npx shadcn@latest add @nexus-labs/glow-button`}</DocPre>
              </div>
              <span className="mt-3 block">
                It asks you to confirm, then writes the component files into{" "}
                <code className={code}>src/components/glow-button/</code>, adds the helper it needs in{" "}
                <code className={code}>src/lib/ui-sounds.ts</code>, and installs the packages it uses (such as{" "}
                <code className={code}>framer-motion</code>). It may also add the Inter font setup so the component looks
                like its preview. Add <code className={code}>--dry-run</code> to see the list without writing anything,
                or <code className={code}>-y</code> to skip the confirmation.
              </span>
            </li>
            <li>
              <Strong>For any other component,</Strong> open its page on{" "}
              <Link href="/components" className={link}>
                /components
              </Link>{" "}
              and copy the command from its <Strong>Install</Strong> box. The name after{" "}
              <code className={code}>@nexus-labs/</code>{" "}
              is the component&apos;s registry name.
            </li>
          </Steps>
          <p className="text-sm text-muted-foreground">
            Prefer not to touch <code className={code}>components.json</code>? Skip step 1 and install a free component
            straight from its address instead (it still needs the file from step 2 above):
          </p>
          <DocPre>{`npx shadcn@latest add https://www.nexus-ui.com/api/registry/glow-button`}</DocPre>
          <p className="text-sm text-muted-foreground">
            Then jump to{" "}
            <a href="#use-it-in-a-page" className={link}>
              step 6
            </a>
            .
          </p>
        </DocSection>

        <DocSection title="4. Add a Pro component with the CLI">
          <p className="text-sm text-muted-foreground">
            Pro components are served only to people with a Pro plan, so the CLI has to prove who you are with an{" "}
            <Strong>API key</Strong>. You make the key once and reuse it in every project. The example below installs
            Particle Reveal.
          </p>
          <ProNote>
            You have Pro, so you can make a key right now.{" "}
            <Link href="/dashboard/api-key" className="font-medium text-link underline-offset-4 hover:underline">
              Open the API key page
            </Link>
            .
          </ProNote>
          <Steps>
            <li>
              <Strong>Create the key.</Strong> Open{" "}
              <Link href="/dashboard/api-key" className={link}>
                nexus-ui.com/dashboard/api-key
              </Link>{" "}
              (sign in first; you need a Pro plan) and press <Strong>Generate key</Strong>. Copy the key now: it starts
              with <code className={code}>nxs_</code> and is shown only once. If you lose it, generate a new one, which
              stops the old one working.
            </li>
            <li>
              <Strong>Save the key in your project.</Strong> In the project root, next to{" "}
              <code className={code}>package.json</code>, create a file named{" "}
              <code className={code}>.env.local</code> and put this one line in it, with your own key after the equals
              sign:
              <div className="mt-3">
                <DocPre>{envLocalLine()}</DocPre>
              </div>
              <span className="mt-3 block">
                Keep the key here and not in <code className={code}>components.json</code>. That file is normally
                committed to git, while <code className={code}>.env.local</code> is already ignored by git in a new
                Next.js project.
              </span>
            </li>
            <li>
              <Strong>Point the registry at the key.</Strong> Open <code className={code}>components.json</code>. Inside
              the outermost braces, add the <code className={code}>&quot;registries&quot;</code> entry below as a new
              line next to the others (after a comma on the line above). If you already ran the command from step 3,
              there is a <code className={code}>&quot;registries&quot;</code> entry already: replace it with this one.
              <div className="mt-3">
                <DocPre>{`{
  "$schema": "https://ui.shadcn.com/schema.json",
  ...everything the init command wrote stays as it is...,
  ${REGISTRIES_PRO.split("\n").join("\n  ")}
}`}</DocPre>
              </div>
              <span className="mt-3 block">
                The dots line stands for what is already in your file; do not type it. Leave{" "}
                <code className={code}>{"${" + API_KEY_ENV_VAR + "}"}</code> and <code className={code}>{"{name}"}</code>{" "}
                exactly as written. The CLI reads <code className={code}>{API_KEY_ENV_VAR}</code> from{" "}
                <code className={code}>.env.local</code> when it runs, and fills in{" "}
                <code className={code}>{"{name}"}</code> with the component you ask for. This one entry also works for
                free components.
              </span>
            </li>
            <li>
              <Strong>Install the component.</Strong> Run it from the project root, the folder that holds{" "}
              <code className={code}>.env.local</code>:
              <div className="mt-3">
                <DocPre>{`npx shadcn@latest add @nexus-labs/particle-reveal`}</DocPre>
              </div>
              <span className="mt-3 block">
                Pro blocks install the same way, for example{" "}
                <code className={code}>@nexus-labs/text-animations</code>. Each component&apos;s page shows its exact
                command.
              </span>
            </li>
          </Steps>
          <p className="text-sm font-medium text-foreground">If it fails</p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>
              A message that <code className={code}>{API_KEY_ENV_VAR}</code> is missing: the variable was not found. Check
              the file is named <code className={code}>.env.local</code>, sits in the project root, and that you ran the
              command from that folder.
            </li>
            <li>
              A <code className={code}>401</code> or unauthorized message: the key is wrong, was replaced by a newer one,
              or your Pro plan is not active. Generate a key again on the API key page and update{" "}
              <code className={code}>.env.local</code>.
            </li>
            <li>
              An unknown registry <code className={code}>@nexus-labs</code>: the <code className={code}>registries</code>{" "}
              entry is missing from <code className={code}>components.json</code> or the file is no longer valid JSON
              (look for a missing comma).
            </li>
          </ul>
        </DocSection>

        <DocSection title="5. Or copy a component by hand">
          <p className="text-sm text-muted-foreground">
            You can skip the registry and the key entirely and copy the files yourself. The steps below use the Glow
            Button; any component works the same way. Pro components show their source only while you are signed in with
            a Pro plan.
          </p>
          <Steps>
            <li>
              <Strong>Install the packages.</Strong> Nearly every component animates with Framer Motion:
              <div className="mt-3">
                <DocPre>{`npm install framer-motion`}</DocPre>
              </div>
              <span className="mt-3 block">
                A component page lists any extra package under <Strong>Copying by hand?</Strong>
              </span>
            </li>
            <li>
              <Strong>Open the source.</Strong> Go to the component&apos;s page on{" "}
              <Link href="/components" className={link}>
                /components
              </Link>
              , scroll to <Strong>Add it to your project</Strong>, find <Strong>Copying by hand?</Strong> and press{" "}
              <Strong>Show the source files</Strong>. You get one tab per file, each headed{" "}
              <Strong>Save as</Strong> with the exact path to use.
            </li>
            <li>
              <Strong>Create each file.</Strong> For every tab, create the file at the path shown (make the folders if
              they do not exist yet), then paste the code. For the Glow Button that is four files:{" "}
              <code className={code}>src/components/glow-button/glow-button.tsx</code>,{" "}
              <code className={code}>src/components/glow-button/magnetic-button.tsx</code>,{" "}
              <code className={code}>src/components/glow-button/index.ts</code> and the helper{" "}
              <code className={code}>src/lib/ui-sounds.ts</code>. Do not skip the helper: the component imports it, and
              without it the build stops with <code className={code}>Module not found: Can&apos;t resolve
              &apos;@/lib/ui-sounds&apos;</code>.
            </li>
            <li>
              <Strong>Check the helper.</Strong> The components import <code className={code}>cn()</code> from{" "}
              <code className={code}>@/lib/utils</code>, which step 2 created. Without shadcn, make that file yourself;
              see the{" "}
              <Link href="/docs/add-utilities" className={link}>
                cn() page
              </Link>
              .
            </li>
          </Steps>
        </DocSection>

        <DocSection title="6. Use it in a page">
          <p className="text-sm text-muted-foreground">
            Installing only adds the component to your project; it does not show it anywhere until a page uses it. Every
            component page has a <Strong>Usage</Strong> tab on its preview: a complete page that uses it, not the
            component itself. Its first line says where to save it, normally{" "}
            <code className={code}>src/app/page.tsx</code>, so you paste the whole example there. Some start with{" "}
            <code className={code}>&quot;use client&quot;</code> because they pass functions to the component; keep that
            line. For the Glow Button the page is:
          </p>
          <DocPre>{`// src/app/page.tsx

import { GlowButton } from "@/components/glow-button";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <GlowButton href="#">Get started</GlowButton>
    </main>
  );
}`}</DocPre>
          <p className="text-sm text-muted-foreground">
            For Particle Reveal the import is{" "}
            <code className={code}>{`import { ParticleReveal } from "@/components/particle-reveal"`}</code> and the tag
            is <code className={code}>{`<ParticleReveal text="Launch" />`}</code>. Then start the app:
          </p>
          <DocPre>{`npm run dev`}</DocPre>
          <p className="text-sm text-muted-foreground">
            Open <code className={code}>http://localhost:3000</code>. If it does not compile, read the first error line:{" "}
            <code className={code}>Module not found</code> names the file you are missing. The{" "}
            <Link href="/docs/cli" className={link}>
              CLI page
            </Link>{" "}
            covers monorepos, previewing installs and more.
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
