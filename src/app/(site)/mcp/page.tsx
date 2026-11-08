import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, KeyRound, LayoutGrid, Lock, MessageSquareText, PackageOpen, Plug, RefreshCcw, Search, ShieldCheck, Stamp, Unlock } from "lucide-react";
import { RainbowWord } from "@/components/site";
import { PillLink } from "@/components/site/pill-link";
import { AgentDemo } from "@/components/mcp/agent-demo";
import { IfPro } from "@/components/pro/pro-access";
import { BrandMark } from "@/components/mcp/brand-marks";
import { AskChips, CopyButton, SetupTabs, type Setup } from "@/components/mcp/setup-tabs";
import { libraryComponents } from "@/lib/catalog/library-components";
import { MCP_URL } from "@/lib/mcp/config";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Nexus UI MCP server for Claude Code, Cursor and Codex",
  description:
    "Connect your coding agent to Nexus UI: it searches the library and adds animated React components to your project by name. Free components need no key; Pro source comes with your API key.",
  alternates: { canonical: "/mcp" },
});

const URL = MCP_URL;
const FREE = libraryComponents.filter((c) => !c.premium).length;
const PRO = libraryComponents.length - FREE;

const SETUPS: Setup[] = [
  {
    id: "claude-code",
    app: "Claude Code",
    mark: "claude",
    tile: "bg-[#fbeee8]",
    where: "Run this once in your project folder. Claude Code picks the server up the next time it starts.",
    free: `claude mcp add --transport http nexus-ui ${URL}`,
    pro: `claude mcp add --transport http nexus-ui ${URL} \\\n  --header "Authorization: Bearer nxs_your_key_here"`,
  },
  {
    id: "cursor",
    app: "Cursor",
    mark: "cursor",
    tile: "bg-[#1d1d1f] text-white",
    where: "Add this to your project, or to ~/.cursor/mcp.json to have it in every project.",
    file: ".cursor/mcp.json",
    free: `{\n  "mcpServers": {\n    "nexus-ui": { "url": "${URL}" }\n  }\n}`,
    pro: `{\n  "mcpServers": {\n    "nexus-ui": {\n      "url": "${URL}",\n      "headers": { "Authorization": "Bearer \${env:NEXUS_API_KEY}" }\n    }\n  }\n}`,
    note: "The Pro version reads NEXUS_API_KEY from your environment (set it in your shell profile), so the file holds no secret and is safe to commit.",
  },
  {
    id: "vscode",
    app: "VS Code",
    mark: "vscode",
    tile: "bg-[#e8f3fc]",
    where: "Add this to your project. With the Pro version, VS Code asks for your key once and stores it for you.",
    file: ".vscode/mcp.json",
    free: `{\n  "servers": {\n    "nexus-ui": { "type": "http", "url": "${URL}" }\n  }\n}`,
    pro: `{\n  "inputs": [\n    { "type": "promptString", "id": "nexus-key", "description": "Nexus UI API key", "password": true }\n  ],\n  "servers": {\n    "nexus-ui": {\n      "type": "http",\n      "url": "${URL}",\n      "headers": { "Authorization": "Bearer \${input:nexus-key}" }\n    }\n  }\n}`,
  },
  {
    id: "codex",
    app: "Codex",
    mark: "openai",
    tile: "bg-[#f1f1f3]",
    where: "Add this to your Codex config. The Pro version reads your key from the NEXUS_API_KEY environment variable.",
    file: "~/.codex/config.toml",
    free: `[mcp_servers.nexus-ui]\nurl = "${URL}"`,
    pro: `[mcp_servers.nexus-ui]\nurl = "${URL}"\nbearer_token_env_var = "NEXUS_API_KEY"`,
  },
];

const STEPS = [
  { Icon: KeyRound, tile: "from-[#ffcc4d] to-[#ff8a00]", glow: "bg-[#ffb020]/20", title: "Get a key, if you have Pro", text: "Free components need nothing. For Pro, create an API key on your dashboard." },
  { Icon: Plug, tile: "from-[#5ac8fa] to-[#2f6bff]", glow: "bg-[#2f80ed]/20", title: "Connect your app", text: "One command or a few lines of config, below for Claude Code, Cursor, VS Code and Codex." },
  { Icon: MessageSquareText, tile: "from-[#5ee08a] to-[#12a150]", glow: "bg-[#1f9d55]/20", title: "Ask in plain words", text: "Say what you want and where. Your agent finds the component and writes the files." },
];

const TOOLS = [
  {
    Icon: Search,
    tint: "bg-[#7c5cff]/20",
    iconBg: "from-[#b18cff] to-[#6b4dff]",
    name: "search_components",
    text: "Finds components by what they are or do. Each result says whether it is free or Pro.",
    example: `search_components("magnetic button")`,
  },
  {
    Icon: PackageOpen,
    tint: "bg-[#ff7a45]/20",
    iconBg: "from-[#ffa25e] to-[#ff5a36]",
    name: "get_component",
    text: "Hands over one component whole: the files and where they go, the npm packages, the install command and an example.",
    example: `get_component("orbital-loader")`,
  },
  {
    Icon: LayoutGrid,
    tint: "bg-[#2f80ed]/20",
    iconBg: "from-[#5ac8fa] to-[#2f6bff]",
    name: "list_categories",
    text: "Lists the categories, from hero sections to loaders, with how many free and Pro components each has.",
    example: "list_categories()",
  },
];

const ASKS = [
  { text: "Find a Nexus UI loader and show it on the dashboard while the data loads", tint: "from-[#5ac8fa] to-[#2f6bff]" },
  { text: "Add a Nexus UI pricing section to app/pricing/page.tsx using our plans", tint: "from-[#ffa25e] to-[#ff5a36]" },
  { text: "Which free Nexus UI components are there for backgrounds?", tint: "from-[#5ee08a] to-[#12a150]" },
  { text: "Add the Nexus UI scroll progress bar to the blog post layout", tint: "from-[#b18cff] to-[#6b4dff]" },
];

const APPS: { name: string; mark: Setup["mark"]; tile: string }[] = SETUPS.map((s) => ({ name: s.app, mark: s.mark, tile: s.tile }));

export default function McpPage() {
  return (
    <>
      {/* Hero: what it is, and a session that shows it */}
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-20 pt-[128px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-[1152px] grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="min-w-0">
            <span className="pg-glass inline-flex items-center gap-2 rounded-full bg-card py-1 pl-3 pr-1 text-[13px] font-medium text-foreground">
              <BrandMark name="mcp" className="size-3.5" />
              MCP server
              <span className="inline-flex items-center gap-1 rounded-full bg-[#16161a] px-2 py-0.5 text-[11.5px] font-semibold text-white">
                <Lock className="size-3 text-[#ffc65c]" aria-hidden />
                Pro unlocks all {FREE + PRO}
              </span>
            </span>
            <h1 className="pg-display mt-5 text-[clamp(44px,6.4vw,72px)] leading-[1.02] text-foreground">
              Nexus UI in your <RainbowWord>coding agent</RainbowWord>
            </h1>
            <p className="mt-5 max-w-[520px] text-[18.5px] leading-[1.55] text-muted-foreground">
              Ask for a component in plain words. Your agent searches the library, picks one and adds its files to your project.
            </p>

            <ul aria-label="Works with" className="mt-7 flex flex-wrap gap-2.5">
              {APPS.map((a) => (
                <li key={a.name} className="pg-glass flex items-center gap-2 rounded-full bg-card py-1 pl-1 pr-3.5 text-[14px] font-medium text-foreground">
                  <span className={`grid size-7 place-items-center rounded-full ${a.tile}`}>
                    <BrandMark name={a.mark} className="size-4" />
                  </span>
                  {a.name}
                </li>
              ))}
            </ul>

            <div className="pg-float mt-7 flex max-w-[520px] items-center gap-3 rounded-2xl bg-card py-2 pl-4 pr-2">
              <Plug className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <code className="min-w-0 flex-1 truncate font-mono text-[13.5px] text-foreground">{URL}</code>
              <CopyButton text={URL} />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <PillLink href="#connect" variant="ink">
                Connect it
              </PillLink>
              <IfPro
                pro={
                  <PillLink href="/dashboard/api-key" variant="white">
                    Get your API key
                  </PillLink>
                }
                otherwise={
                  <PillLink href="/pricing" variant="white" plansSource="mcp_hero">
                    Get your key with Pro
                  </PillLink>
                }
              />
            </div>
          </div>

          <AgentDemo />
        </div>
      </section>

      {/* Three steps, in order */}
      <section aria-labelledby="how" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="how" className="sr-only">
            How it works
          </h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map(({ Icon, tile, glow, title, text }, i) => (
              <li key={title} className="pg-float relative overflow-hidden rounded-[24px] bg-card p-6">
                <div aria-hidden className={`pointer-events-none absolute -right-10 -top-10 size-40 rounded-full blur-2xl ${glow}`} />
                <div className="relative flex items-center justify-between">
                  <span className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)] ${tile}`}>
                    <Icon className="size-5" strokeWidth={2.2} aria-hidden />
                  </span>
                  <span aria-hidden className="grid size-8 place-items-center rounded-full bg-secondary font-mono text-[13px] font-semibold text-muted-foreground ring-1 ring-border">
                    {i + 1}
                  </span>
                </div>
                <h3 className="relative mt-5 text-[18px] font-semibold tracking-[-0.3px] text-foreground">
                  <span className="sr-only">Step {i + 1}: </span>
                  {title}
                </h3>
                <p className="relative mt-1.5 text-[15px] leading-relaxed text-body">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Setup, per app */}
      <section id="connect" aria-labelledby="connect-heading" className="scroll-mt-24 px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <div className="mb-8 max-w-[640px]">
            <h2 id="connect-heading" className="pg-display text-[clamp(34px,4.6vw,48px)] text-foreground">
              Connect it
            </h2>
            <p className="mt-3 text-[17px] leading-[1.55] text-muted-foreground">Pick your app, pick free or Pro, and copy.</p>
          </div>
          <SetupTabs setups={SETUPS} />
          <p className="mt-5 flex items-start gap-2.5 text-[14.5px] leading-[1.6] text-muted-foreground">
            <BrandMark name="claude" className="mt-1 size-4 shrink-0" />
            <span>
              The Claude app can add {URL} as a custom connector too, but it doesn&apos;t send a key, so there you get the free components. For Pro, use
              one of the coding tools above.
            </span>
          </p>
        </div>
      </section>

      {/* Tools */}
      <section aria-labelledby="tools" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="tools" className="pg-display text-[clamp(34px,4.6vw,48px)] text-foreground">
            What your agent can do
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TOOLS.map(({ Icon, tint, iconBg, name, text, example }) => (
              <article key={name} className="pg-float relative flex flex-col overflow-hidden rounded-[24px] bg-card p-6">
                <div aria-hidden className={`pointer-events-none absolute -right-12 -top-12 size-44 rounded-full blur-2xl ${tint}`} />
                <span className={`relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)] ${iconBg}`}>
                  <Icon className="size-5" strokeWidth={2.2} aria-hidden />
                </span>
                <h3 className="relative mt-5 font-mono text-[15px] font-semibold text-foreground">{name}</h3>
                <p className="relative mt-2 flex-1 text-[15px] leading-relaxed text-body">{text}</p>
                <code className="relative mt-5 block truncate rounded-xl bg-[#16161a] px-3 py-2.5 font-mono text-[12.5px] text-[#e6e6ea]">
                  <span className="text-[#ffd479]">{example.split("(")[0]}</span>
                  <span className="text-white/60">({example.split("(").slice(1).join("(")}</span>
                </code>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Free and Pro */}
      <section aria-labelledby="tiers" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="tiers" className="pg-display text-[clamp(34px,4.6vw,48px)] text-foreground">
            Free, or everything
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="pg-float relative overflow-hidden rounded-[28px] bg-card p-7">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-[#5ee08a]/20 blur-3xl" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1f9d55]/12 px-3 py-1 text-[13px] font-semibold text-[#1f9d55]">
                <Unlock className="size-3.5" aria-hidden /> No key
              </span>
              <p className="pg-display mt-5 text-[44px] text-foreground">{FREE}</p>
              <p className="text-[15px] text-muted-foreground">free components</p>
              <ul className="mt-6 space-y-2.5 text-[15px] text-body">
                {["Full source for every one", "Search, files, packages and install command", "Works in the Claude app too"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <Check className="size-4 shrink-0 text-[#1f9d55]" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-[28px] bg-[#16161a] p-7 text-white">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-[#7c5cff]/35 blur-3xl" />
              <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[13px] font-semibold">
                <Lock className="size-3.5 text-[#ffc65c]" aria-hidden /> With your API key
              </span>
              <p className="pg-display relative mt-5 text-[44px]">{FREE + PRO}</p>
              <p className="relative text-[15px] text-white/60">components, all {PRO} Pro ones included</p>
              <ul className="relative mt-6 space-y-2.5 text-[15px] text-white/85">
                {[
                  { Icon: BadgeCheck, t: "Every Pro component, with full source" },
                  { Icon: Stamp, t: "Files stamped with your licence, like a CLI install" },
                  { Icon: RefreshCcw, t: "Everything we release next" },
                ].map(({ Icon, t }) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0 text-[#c9a6ff]" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="relative mt-7">
                <PillLink href="/pricing" variant="white" plansSource="mcp_page">
                  See Pro
                </PillLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Try asking */}
      <section aria-labelledby="ask" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="ask" className="pg-display text-[clamp(34px,4.6vw,48px)] text-foreground">
            Try asking
          </h2>
          <div className="mt-8">
            <AskChips asks={ASKS} />
          </div>
        </div>
      </section>

      {/* Key safety */}
      <section aria-labelledby="key" className="px-4 pb-28">
        <div className="pg-float relative mx-auto max-w-[1152px] overflow-hidden rounded-[28px] bg-card p-7 sm:p-10">
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-[#ffb020]/15 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[#ffcc4d] to-[#ff8a00] text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]">
              <ShieldCheck className="size-5" strokeWidth={2.2} aria-hidden />
            </span>
            <h2 id="key" className="pg-display text-[clamp(28px,3.6vw,38px)] text-foreground">
              Keep your key private
            </h2>
          </div>
          <div className="relative mt-7 grid gap-4 md:grid-cols-3">
            {[
              { Icon: KeyRound, t: "It is yours alone", d: "It unlocks Pro under your account and every Pro file it fetches carries your licence line. Don't share it or commit it to a public repo." },
              { Icon: Plug, t: "Same key as the CLI", d: "The shadcn CLI uses it too, and the MCP server checks it the same way. No key or no Pro means free components only." },
              { Icon: RefreshCcw, t: "Leaked? Make a new one", d: "Create a new key on your dashboard and the old one stops working. Update NEXUS_API_KEY in .env.local too." },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="rounded-[20px] bg-secondary p-5 ring-1 ring-border">
                <Icon className="size-5 text-[#ff8a00]" aria-hidden />
                <h3 className="mt-3 text-[16px] font-semibold text-foreground">{t}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-body">{d}</p>
              </div>
            ))}
          </div>
          <div className="relative mt-8 flex flex-wrap items-center gap-3">
            <PillLink href="/dashboard/api-key" variant="ink">
              Get your API key
            </PillLink>
            <Link href="/claude-code" className="inline-flex items-center gap-1.5 text-[15px] font-medium text-link hover:underline hover:underline-offset-4">
              Or install with the shadcn CLI <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
