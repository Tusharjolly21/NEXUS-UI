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
import { API_KEY_ENV_VAR, REGISTRIES_PRO, envLocalLine, registryAddCommand } from "@/lib/registry-config";

export const metadata: Metadata = createMetadata({
  title: "Install with the shadcn CLI (@nexus-labs registry)",
  description:
    "Connect the @nexus-labs registry, then install Nexus UI components and blocks with npx shadcn add. Free items need one command; Pro items use an API key kept in .env.local.",
  alternates: { canonical: "/docs/cli" },
});

const code = docInlineCodeClass;
const link = "text-link underline-offset-4 hover:underline";

export default function CliDocsPage() {
  return (
    <>
      <TechArticleJsonLd
        title="CLI"
        description="Install Nexus UI components and blocks with the shadcn CLI: connect the @nexus-labs registry, add free items, and use an API key for Pro items."
        slug="cli"
      />
      <DocPageShell>
        <DocPageHeader
          title="CLI"
          description="The shadcn CLI copies a Nexus UI component, the helpers it imports and its npm packages into your project with one command. This page is the reference; the Quick Start is the walkthrough from an empty folder."
        />

        <DocSection title="See what add does">
          <p className="text-sm text-muted-foreground">
            Pick something to add and run it. The terminal shows each step the shadcn CLI takes and the tree shows the
            files that land in your project.
          </p>
          <div data-doc-widget>
            <CliSimulator />
          </div>
        </DocSection>

        <DocSection title="Before you start">
          <p className="text-sm text-muted-foreground">
            You need a Next.js project with Tailwind CSS and the <code className={code}>@/</code> import alias, and a{" "}
            <code className={code}>components.json</code> file in its root. Both come from the{" "}
            <Link href="/docs/installation" className={link}>
              Quick Start
            </Link>
            ; if you already have a project, run this from its root:
          </p>
          <DocPre>{`npx shadcn@latest init -d`}</DocPre>
          <p className="text-sm text-muted-foreground">
            It creates <code className={code}>components.json</code> and <code className={code}>src/lib/utils.ts</code>{" "}
            (the <code className={code}>cn()</code> helper every Nexus UI component imports) and installs{" "}
            <code className={code}>clsx</code> and <code className={code}>tailwind-merge</code>. Without{" "}
            <code className={code}>-d</code> it asks you to choose a style.
          </p>
        </DocSection>

        <DocSection title="Connect the @nexus-labs registry">
          <p className="text-sm text-muted-foreground">
            A registry is a web address the CLI downloads components from.{" "}
            <code className={code}>@nexus-labs</code> is the short name you give the Nexus UI one. Connect it once per
            project:
          </p>
          <DocPre>{registryAddCommand()}</DocPre>
          <p className="text-sm text-muted-foreground">
            This adds the entry below to <code className={code}>components.json</code> for you (if the entry already
            exists it is left alone):
          </p>
          <DocPre>{`"registries": {
  "@nexus-labs": "https://www.nexus-ui.com/api/registry/{name}"
}`}</DocPre>
          <p className="text-sm text-muted-foreground">
            <code className={code}>{"{name}"}</code> is a placeholder that stays exactly as written. When you ask for{" "}
            <code className={code}>@nexus-labs/glow-button</code>, the CLI swaps in{" "}
            <code className={code}>glow-button</code> and downloads{" "}
            <code className={code}>https://www.nexus-ui.com/api/registry/glow-button</code>. The part before the slash
            picks the registry, the part after it picks the item.
          </p>
        </DocSection>

        <DocSection title="Install free components and blocks">
          <DocPre>{`npx shadcn@latest add @nexus-labs/glow-button
npx shadcn@latest add @nexus-labs/pricing-section`}</DocPre>
          <p className="text-sm text-muted-foreground">
            You can list several names in one command. Every component and block page shows its exact command in the{" "}
            <span className="font-medium text-foreground">Install</span> box; copy it from there. The CLI shows what it
            will write and asks you to confirm, then:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>
              writes the component files, usually under <code className={code}>src/components/&lt;name&gt;/</code>;
            </li>
            <li>
              writes the helpers they import, such as <code className={code}>src/lib/ui-sounds.ts</code> for components
              that make sound;
            </li>
            <li>
              installs the npm packages they list, such as <code className={code}>framer-motion</code>, with your
              package manager;
            </li>
            <li>
              may add the Inter font setup so the component matches its preview (the{" "}
              <code className={code}>nexus-font</code> item).
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Without connecting the registry, a free item can also be installed straight from its address. It still needs{" "}
            <code className={code}>components.json</code>:
          </p>
          <DocPre>{`npx shadcn@latest add https://www.nexus-ui.com/api/registry/wheel-selector`}</DocPre>
        </DocSection>

        <DocSection title="Install Pro components and blocks">
          <p className="text-sm text-muted-foreground">
            Pro items are served only to Pro plans. The CLI sends your API key with each request, so there are three
            things to set up once: the key, a line in <code className={code}>.env.local</code>, and a header in{" "}
            <code className={code}>components.json</code>.
          </p>
          <ProNote className="mt-3">
            You have Pro, so your key is ready to make.{" "}
            <Link href="/dashboard/api-key" className="font-medium text-link underline-offset-4 hover:underline">
              Create your API key
            </Link>
            .
          </ProNote>
          <ol className="list-decimal space-y-4 pl-5 text-sm leading-relaxed text-muted-foreground marker:font-semibold marker:text-foreground">
            <li>
              <span className="font-medium text-foreground">Create the key</span> at{" "}
              <Link href="/dashboard/api-key" className={link}>
                nexus-ui.com/dashboard/api-key
              </Link>{" "}
              (a Pro plan is required) with <span className="font-medium text-foreground">Generate key</span>. Copy it
              straight away: it starts with <code className={code}>nxs_</code> and is shown only once.
            </li>
            <li>
              <span className="font-medium text-foreground">Save it in .env.local</span> in your project root, next to{" "}
              <code className={code}>package.json</code>:
              <div className="mt-3">
                <DocPre>{envLocalLine()}</DocPre>
              </div>
              <span className="mt-3 block">
                A new Next.js project already ignores <code className={code}>.env*</code> files in git. Never commit the
                key. The CLI also reads <code className={code}>.env</code>, or a variable set in your shell.
              </span>
            </li>
            <li>
              <span className="font-medium text-foreground">Add the header in components.json.</span> Put this entry
              inside the outermost braces, next to <code className={code}>&quot;aliases&quot;</code>. If a{" "}
              <code className={code}>&quot;registries&quot;</code> entry is already there from the step above, replace
              it:
              <div className="mt-3">
                <DocPre>{REGISTRIES_PRO}</DocPre>
              </div>
              <span className="mt-3 block">
                Leave <code className={code}>{"${" + API_KEY_ENV_VAR + "}"}</code> as written: the CLI replaces it with
                the value from <code className={code}>.env.local</code> when it runs. The key itself never goes into this
                file.
              </span>
            </li>
            <li>
              <span className="font-medium text-foreground">Install</span>, from the project root:
              <div className="mt-3">
                <DocPre>{`npx shadcn@latest add @nexus-labs/particle-reveal
npx shadcn@latest add @nexus-labs/text-animations`}</DocPre>
              </div>
            </li>
          </ol>
          <p className="text-sm font-medium text-foreground">Errors</p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">{API_KEY_ENV_VAR} is missing.</span> The CLI could not find
              the variable. Check the file name, that it is in the folder you run the command from, and that the line is{" "}
              <code className={code}>{API_KEY_ENV_VAR}=nxs_...</code> without quotes or spaces.
            </li>
            <li>
              <span className="font-medium text-foreground">401 Unauthorized.</span> The key is not accepted: it was
              copied wrong, you generated a newer one, or your Pro plan has ended. Generate a key again and update{" "}
              <code className={code}>.env.local</code>.
            </li>
            <li>
              <span className="font-medium text-foreground">Unknown registry @nexus-labs.</span> The{" "}
              <code className={code}>registries</code> entry is missing, or <code className={code}>components.json</code>{" "}
              is no longer valid JSON.
            </li>
          </ul>
        </DocSection>

        <DocSection title="Useful options">
          <DocPre>{`npx shadcn@latest add @nexus-labs/glow-button --dry-run
npx shadcn@latest add @nexus-labs/glow-button --view
npx shadcn@latest add @nexus-labs/glow-button --diff
npx shadcn@latest add @nexus-labs/glow-button -y
npx shadcn@latest add @nexus-labs/glow-button -o`}</DocPre>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>
              <code className={code}>--dry-run</code> lists what would change without writing anything.
            </li>
            <li>
              <code className={code}>--view</code> prints the files, and <code className={code}>--diff</code> compares
              them with the ones you already have.
            </li>
            <li>
              <code className={code}>-y</code> skips the confirmation question.
            </li>
            <li>
              <code className={code}>-o</code> overwrites files that already exist, including edits you made to them.
              Without it the CLI asks before replacing a file.
            </li>
            <li>
              <code className={code}>-p &lt;path&gt;</code> chooses the folder the component is written to.
            </li>
          </ul>
        </DocSection>

        <DocSection title="Monorepos">
          <p className="text-sm text-muted-foreground">
            Point the CLI at the workspace package that holds your app with <code className={code}>-c</code>:
          </p>
          <DocPre>{`npx shadcn@latest init -d -c ./apps/web
${registryAddCommand()} -c ./apps/web
npx shadcn@latest add @nexus-labs/glow-button -c ./apps/web`}</DocPre>
          <p className="text-sm text-muted-foreground">
            For a Pro key, put <code className={code}>.env.local</code> inside <code className={code}>apps/web</code>.
          </p>
        </DocSection>

        <DocSection title="Prefer to copy by hand?">
          <p className="text-sm text-muted-foreground">
            You do not have to use the CLI. Every component page lists its source files with the exact path to save each
            one to; the Quick Start has the{" "}
            <Link href="/docs/installation#or-copy-a-component-by-hand" className={link}>
              step by step
            </Link>
            .
          </p>
        </DocSection>

        <DocFooterNav
          prev={{ href: "/docs/add-utilities", label: "Add utilities" }}
          next={{ href: "/docs/videos", label: "Videos" }}
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
