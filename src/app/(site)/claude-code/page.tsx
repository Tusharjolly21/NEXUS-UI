import { registryAddCommand } from "@/lib/registry-config";
import type { Metadata } from "next";
import Link from "next/link";
import { RainbowWord } from "@/components/site";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Nexus UI with Claude Code and Cursor",
  description:
    "Install Nexus UI components with one shadcn command from Claude Code, Cursor or any agent, and use build prompts to recreate a component from a brief.",
  alternates: { canonical: "/claude-code" },
});

const REGISTRY_CONFIG = registryAddCommand();

const INSTALL = `npx shadcn@latest add @nexus-labs/glow-button
npx shadcn@latest add @nexus-labs/pricing-section`;

const EXAMPLE_PROMPT = `Add the @nexus-labs/pricing-section block to app/pricing/page.tsx.
Use our three plans (Free, Team, Enterprise) from lib/plans.ts, keep our
existing colour tokens, and run the type check when you are done.`;

function Code({ children, wrap = false }: { children: string; wrap?: boolean }) {
  return (
    <pre className={`mt-4 ${wrap ? "whitespace-pre-wrap" : "overflow-x-auto"} rounded-[14px] bg-foreground/[0.045] p-4 font-mono text-[12.5px] leading-6 text-foreground dark:bg-white/[0.06]`}>
      {children}
    </pre>
  );
}

export default function ClaudeCodePage() {
  return (
    <>
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-12 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display max-w-[900px] text-[clamp(44px,7vw,76px)] leading-[1.04] text-foreground">
            Tailwind components your coding agent can <RainbowWord>install</RainbowWord>
          </h1>
          <p className="mt-5 max-w-[640px] text-[19px] leading-[1.55] text-muted-foreground">
            Nexus UI is a shadcn registry, so Claude Code, Cursor or any agent that can run a shell adds a component with
            one command. Components also come with a build prompt: the written brief an agent needs to
            recreate it. It is free on free components and part of Pro on Pro ones.
          </p>
          <p className="mt-4 max-w-[640px] text-[16px] leading-[1.55] text-muted-foreground">
            Rather ask for components by what they do? Connect the{" "}
            <Link href="/mcp" className="text-link underline-offset-4 hover:underline">
              Nexus UI MCP server
            </Link>{" "}
            and your agent searches the library and adds them by name.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto grid max-w-[1152px] grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-2">
          <div className="rounded-tile bg-card p-7 pg-float">
            <h2 className="text-[19px] font-semibold text-foreground">1. Add the registry once</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-body">
              Run this in a project where <code className="text-foreground">npx shadcn@latest init</code> has already
              created <code className="text-foreground">components.json</code>. It adds the{" "}
              <code className="text-foreground">@nexus-labs</code> entry for you; leave{" "}
              <code className="text-foreground">{"{name}"}</code> exactly as written.
            </p>
            <Code>{REGISTRY_CONFIG}</Code>
          </div>

          <div className="rounded-tile bg-card p-7 pg-float">
            <h2 className="text-[19px] font-semibold text-foreground">2. Install by name</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-body">
              The CLI writes the files under your components folder and installs the dependencies they declare. An agent
              can run these itself. Premium items need the API key from your dashboard (see the{" "}
              <Link href="/docs/cli" className="underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">
                CLI guide
              </Link>
              ).
            </p>
            <Code>{INSTALL}</Code>
          </div>

          <div className="rounded-tile bg-tint-violet p-7">
            <h2 className="text-[19px] font-semibold text-foreground">3. Ask in plain words</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-body">
              Name the item and say how it should fit your app. Because the code lands in your repo as ordinary React and
              Tailwind, the agent can edit it like anything else you wrote.
            </p>
            <Code wrap>{EXAMPLE_PROMPT}</Code>
          </div>

          <div className="rounded-tile bg-tint-sky p-7">
            <h2 className="text-[19px] font-semibold text-foreground">Build prompts</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-body">
              Many components and sections have a build prompt: the stack, file layout, props, motion and edge cases written
              out so an agent can build the same thing from scratch in your project. Look for Build prompt on a
              component or block page. On free components it is free; on Pro components, blocks and templates it needs a Pro plan.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { href: "/components", label: "Browse components" },
                { href: "/blocks", label: "Browse blocks" },
                { href: "/pricing", label: "See Pro" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="pg-glass inline-flex rounded-full bg-card px-3.5 py-1.5 text-[13.5px] font-medium text-foreground hover:bg-muted"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-[1152px] text-[13px] leading-relaxed text-muted-foreground">
          The site also publishes a plain-text overview for AI tools at{" "}
          <a href="/llms.txt" className="underline underline-offset-4">
            /llms.txt
          </a>
          . Nexus UI is independent and is not affiliated with Anthropic, Cursor or the shadcn/ui project.
        </p>
      </section>
    </>
  );
}
