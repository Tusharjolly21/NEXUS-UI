import type { Metadata } from "next";
import Link from "next/link";
import { Check, FileCode2, Info, Lock, ScrollText, Search } from "lucide-react";
import {
  DocFooterNav,
  DocPageHeader,
  DocPageShell,
  DocSection,
  TechArticleJsonLd,
  docInlineCodeClass,
} from "@/components/docs/doc-page";
import { McpDemo } from "@/components/docs/interactive/mcp-demo";
import { McpConnect, PromptChips, ToolIcon } from "@/components/docs/interactive/mcp-connect";
import { createMetadata } from "@/lib/seo";
import { API_KEY_ENV_VAR } from "@/lib/registry-config";

export const metadata: Metadata = createMetadata({
  title: "Nexus UI MCP server for Claude Code and Cursor",
  description:
    "Connect Claude Code, Cursor or any MCP client to Nexus UI: search components, blocks, templates and icons, read install commands and pull free source. Pro source uses your API key.",
  alternates: { canonical: "/docs/mcp" },
});

const code = docInlineCodeClass;
const link = "text-link underline-offset-4 hover:underline";

const TOOLS = [
  {
    name: "search_nexus",
    icon: Search,
    tint: ["rgba(10,122,255,0.12)", "#0a62d0"],
    text: "Search components, blocks, templates, videos and icons by what they do. Filter to free items if you want.",
    example: '{ "query": "drag slider" }',
  },
  {
    name: "get_nexus_item",
    icon: Info,
    tint: ["rgba(139,92,246,0.14)", "#6d3fd6"],
    text: "What one item is, whether it is free or Pro, its page and its install command.",
    example: '{ "id": "block:block-pricing-section" }',
  },
  {
    name: "get_component_source",
    icon: FileCode2,
    tint: ["rgba(52,199,89,0.16)", "#1f9d4a"],
    text: "The source files of a component or block, the path to write each one to and the npm packages it needs.",
    example: '{ "slug": "pricing-section" }',
  },
  {
    name: "get_build_prompt",
    icon: ScrollText,
    tint: ["rgba(255,122,26,0.14)", "#c4590a"],
    text: "The build prompt of a free component, for tools that rebuild it from a description.",
    example: '{ "slug": "animated-countdown" }',
  },
];

const ACCESS: { what: string; free: "yes" | "locked" | "page"; pro: "yes" | "locked" | "page" }[] = [
  { what: "Search the catalog", free: "yes", pro: "yes" },
  { what: "Item details and install command", free: "yes", pro: "yes" },
  { what: "Source code", free: "yes", pro: "locked" },
  { what: "Build prompt", free: "yes", pro: "page" },
];

function Cell({ v }: { v: "yes" | "locked" | "page" }) {
  if (v === "yes")
    return (
      <span className="inline-flex items-center gap-1.5 text-foreground">
        <span className="flex size-5 items-center justify-center rounded-full bg-[#34c759]/20 text-[#1f9d4a]">
          <Check className="size-3" strokeWidth={3} aria-hidden />
        </span>
        Yes
      </span>
    );
  if (v === "locked")
    return (
      <span className="inline-flex items-center gap-1.5 text-foreground">
        <span className="flex size-5 items-center justify-center rounded-full bg-[#ff9f0a]/20 text-[#b36b00]">
          <Lock className="size-3" strokeWidth={2.5} aria-hidden />
        </span>
        Needs your API key
      </span>
    );
  return <span className="text-muted-foreground">On the component page</span>;
}

const PROMPTS = [
  "Find a free pricing section in Nexus UI and add it to my landing page.",
  "Which Nexus UI components make a sound when you press them?",
  "Show me the fintech templates in Nexus UI.",
];

export default function McpDocsPage() {
  return (
    <>
      <TechArticleJsonLd
        title="MCP server"
        description="Connect an AI coding tool to Nexus UI over the Model Context Protocol: search the catalog, read install commands and fetch component source."
        slug="mcp"
      />
      <DocPageShell>
        <DocPageHeader
          title="MCP server"
          description="Let your AI coding tool look things up in Nexus UI itself. Ask it for a pricing section or a drag slider and it searches the catalog, finds the right item and writes the files into your project."
        />

        <div data-doc-widget className="-mt-6 flex flex-wrap items-center gap-2.5">
          <span className="mr-1 text-[14px] text-muted-foreground">Works with</span>
          {(
            [
              ["claude-code", "Claude Code"],
              ["cursor", "Cursor"],
            ] as const
          ).map(([id, name]) => (
            <span
              key={id}
              className="inline-flex h-10 items-center gap-2.5 rounded-full bg-card pr-4 pl-2 text-[14.5px] font-medium text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.05)]"
            >
              <ToolIcon tool={id} size={26} />
              {name}
            </span>
          ))}
          <span className="inline-flex h-10 items-center rounded-full bg-muted px-4 text-[14.5px] text-muted-foreground">
            and any MCP client
          </span>
        </div>

        <DocSection title="See it work">
          <McpDemo />
        </DocSection>

        <DocSection title="Connect your tool">
          <p className="text-sm text-muted-foreground">
            Pick your tool and what you want to unlock, then copy the snippet. Free items need no API key. Pro items do, with
            the same API key the CLI uses. Create one in the{" "}
            <Link href="/dashboard/api-key" className={link}>
              dashboard
            </Link>{" "}
            and keep it in <code className={code}>{API_KEY_ENV_VAR}</code>, not in your repository.
          </p>
          <McpConnect envVar={API_KEY_ENV_VAR} />
          <p className="text-sm text-muted-foreground">
            Other tools that support remote MCP servers over HTTP name the settings differently. They need the address and,
            for Pro, that one header.
          </p>
        </DocSection>

        <DocSection title="What it can do">
          <ul data-doc-widget className="grid gap-3 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <li
                key={t.name}
                className="pg-float rounded-tile bg-card p-5 transition-transform hover:-translate-y-0.5 motion-reduce:transition-none"
              >
                <span className="flex size-10 items-center justify-center rounded-full" style={{ background: t.tint[0], color: t.tint[1] }}>
                  <t.icon className="size-[18px]" aria-hidden />
                </span>
                <h3 className="mt-3.5 font-mono text-[15px] font-semibold text-foreground">{t.name}</h3>
                <p className="mt-1.5 text-[14.5px] leading-snug text-muted-foreground">{t.text}</p>
                <code className="mt-3 block truncate rounded-[10px] bg-muted px-2.5 py-1.5 font-mono text-[12.5px] text-muted-foreground">
                  {t.example}
                </code>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            It reads only. It never changes anything in your project on its own; your tool decides what to write and asks
            you first, as it does for any other file change.
          </p>
        </DocSection>

        <DocSection title="Free and Pro">
          <div data-doc-widget className="overflow-hidden rounded-tile bg-card pg-float">
            <table className="w-full border-collapse text-left text-[14.5px]">
              <caption className="sr-only">What each kind of connection can do</caption>
              <thead>
                <tr className="border-b border-border text-[13.5px] text-muted-foreground">
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    What you ask for
                  </th>
                  <th scope="col" className="px-3 py-3.5 font-medium">
                    Free items
                  </th>
                  <th scope="col" className="px-3 py-3.5 font-medium">
                    Pro items
                  </th>
                </tr>
              </thead>
              <tbody>
                {ACCESS.map((r) => (
                  <tr key={r.what} className="border-b border-border/60 last:border-0">
                    <th scope="row" className="px-5 py-3.5 font-medium text-foreground">
                      {r.what}
                    </th>
                    <td className="px-3 py-3.5">
                      <Cell v={r.free} />
                    </td>
                    <td className="px-3 py-3.5">
                      <Cell v={r.pro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            Source follows the same rules as <code className={code}>npx shadcn add</code>: a Pro item needs a key from an
            account with a Pro plan or All-Access. Without one, the server tells your tool where to get a key instead of
            returning code. See{" "}
            <Link href="/docs/cli" className={link}>
              CLI
            </Link>{" "}
            for the key setup and{" "}
            <Link href="/pricing" className={link}>
              pricing
            </Link>{" "}
            for the plans.
          </p>
        </DocSection>

        <DocSection title="Try it">
          <p className="text-sm text-muted-foreground">Once connected, ask your tool something like this. Click one to copy it.</p>
          <PromptChips prompts={PROMPTS} />
        </DocSection>

        <DocFooterNav prev={{ href: "/docs/icons", label: "Icons" }} />
      </DocPageShell>
    </>
  );
}
