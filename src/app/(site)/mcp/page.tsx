import type { Metadata } from "next";
import Link from "next/link";
import { RainbowWord } from "@/components/site";
import { PillLink } from "@/components/site/pill-link";
import { createMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Nexus UI MCP server for Claude Code, Cursor and Codex",
  description:
    "Connect your coding agent to Nexus UI: it searches the library and adds animated React components to your project by name. Free components need no key; Pro source comes with your API key.",
  alternates: { canonical: "/mcp" },
});

const URL = `${siteConfig.url.replace(/\/$/, "")}/api/mcp`;

const SETUPS: { app: string; where: string; free: string; pro: string; note?: string }[] = [
  {
    app: "Claude Code",
    where: "Run this in your project folder.",
    free: `claude mcp add --transport http nexus-ui ${URL}`,
    pro: `claude mcp add --transport http nexus-ui ${URL} \\\n  --header "Authorization: Bearer nxs_your_key_here"`,
  },
  {
    app: "Cursor",
    where: "Add this to .cursor/mcp.json in your project, or ~/.cursor/mcp.json for every project.",
    free: `{\n  "mcpServers": {\n    "nexus-ui": { "url": "${URL}" }\n  }\n}`,
    pro: `{\n  "mcpServers": {\n    "nexus-ui": {\n      "url": "${URL}",\n      "headers": { "Authorization": "Bearer nxs_your_key_here" }\n    }\n  }\n}`,
    note: "If you use the project file, keep it out of git when it holds your key.",
  },
  {
    app: "VS Code",
    where: "Add this to .vscode/mcp.json. With the Pro version, VS Code asks for the key once and stores it for you.",
    free: `{\n  "servers": {\n    "nexus-ui": { "type": "http", "url": "${URL}" }\n  }\n}`,
    pro: `{\n  "inputs": [\n    { "type": "promptString", "id": "nexus-key", "description": "Nexus UI API key", "password": true }\n  ],\n  "servers": {\n    "nexus-ui": {\n      "type": "http",\n      "url": "${URL}",\n      "headers": { "Authorization": "Bearer \${input:nexus-key}" }\n    }\n  }\n}`,
  },
  {
    app: "Codex",
    where: "Add this to ~/.codex/config.toml. The Pro version reads the key from the NEXUS_API_KEY environment variable.",
    free: `[mcp_servers.nexus-ui]\nurl = "${URL}"`,
    pro: `[mcp_servers.nexus-ui]\nurl = "${URL}"\nbearer_token_env_var = "NEXUS_API_KEY"`,
    note: "Remote MCP servers need a recent version of Codex.",
  },
];

const TOOLS = [
  { name: "search_components", what: "Finds components by what they are or do: “pricing section”, “magnetic button”, “loader”. Each result says whether it is free or Pro." },
  { name: "get_component", what: "Hands over one component whole: the source files and the paths they go to, the npm packages, the install command and an example of using it." },
  { name: "list_categories", what: "Lists the categories, from hero sections to loaders, with how many free and Pro components each has." },
];

const ASK = [
  "Find a Nexus UI loader and put it on the dashboard while the data loads",
  "Add a Nexus UI pricing section to app/pricing/page.tsx using our plans",
  "What free Nexus UI components are there for backgrounds?",
  "Add the Nexus UI scroll progress bar to the blog post layout",
];

function Code({ children }: { children: string }) {
  return (
    <pre tabIndex={0} className="mt-3 overflow-x-auto rounded-[14px] bg-[#1d1d1f] p-4 font-mono text-[12.5px] leading-6 text-[#e6e6ea]">
      {children}
    </pre>
  );
}

export default function McpPage() {
  return (
    <>
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-12 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display max-w-[900px] text-[clamp(44px,7vw,76px)] leading-[1.04] text-foreground">
            Nexus UI in your <RainbowWord>coding agent</RainbowWord>
          </h1>
          <p className="mt-5 max-w-[640px] text-[19px] leading-[1.55] text-muted-foreground">
            Connect the Nexus UI MCP server to Claude Code, Cursor, VS Code or Codex. Ask for a component in plain words and your agent
            finds it, reads its files and adds it to your project. Free components work without a key. Pro components need the API key
            from an account with Pro.
          </p>
          <p className="mt-5 inline-block rounded-full bg-card px-4 py-2 font-mono text-[13px] text-foreground ring-1 ring-border">{URL}</p>
        </div>
      </section>

      <section aria-labelledby="connect" className="px-4 pb-20">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="connect" className="pg-display text-[clamp(32px,4.5vw,44px)] leading-[1.02] text-foreground">
            Connect it
          </h2>
          <p className="mt-3 max-w-[640px] text-[17px] leading-[1.55] text-muted-foreground">
            Use the first version for free components. For Pro, create a key at{" "}
            <Link href="/dashboard/api-key" className="text-link underline-offset-4 hover:underline">
              your dashboard
            </Link>{" "}
            (it is shown once, so copy it straight away) and use the second version with your key in place of nxs_your_key_here.
          </p>
          <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-2">
            {SETUPS.map((s) => (
              <article key={s.app} className="pg-float rounded-tile bg-card p-7">
                <h3 className="text-[19px] font-semibold text-foreground">{s.app}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-body">{s.where}</p>
                <p className="mt-4 text-[13px] font-semibold text-foreground">Free components</p>
                <Code>{s.free}</Code>
                <p className="mt-4 text-[13px] font-semibold text-foreground">With Pro</p>
                <Code>{s.pro}</Code>
                {s.note ? <p className="mt-3 text-[13.5px] text-muted-foreground">{s.note}</p> : null}
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-[760px] text-[14.5px] leading-[1.6] text-muted-foreground">
            The Claude app can add {URL} as a custom connector too, but it doesn&apos;t send a key, so there you get the free components
            only. For Pro, use one of the coding tools above.
          </p>
        </div>
      </section>

      <section aria-labelledby="tools" className="px-4 pb-20">
        <div className="mx-auto grid max-w-[1152px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <h2 id="tools" className="pg-display text-[clamp(32px,4.5vw,44px)] leading-[1.02] text-foreground">
            What it can do
          </h2>
          <dl className="border-t border-border">
            {TOOLS.map((t) => (
              <div key={t.name} className="border-b border-border py-5">
                <dt className="font-mono text-[14px] font-semibold text-foreground">{t.name}</dt>
                <dd className="mt-1.5 text-[15.5px] leading-relaxed text-muted-foreground">{t.what}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="ask" className="px-4 pb-20">
        <div className="mx-auto max-w-[1152px] rounded-tile bg-tint-violet p-7 sm:p-10">
          <h2 id="ask" className="pg-display text-[clamp(28px,3.6vw,38px)] leading-[1.06] text-foreground">
            Try asking
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {ASK.map((a) => (
              <li key={a} className="rounded-2xl bg-card/80 px-4 py-3 text-[15px] leading-snug text-foreground">
                &ldquo;{a}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="key" className="px-4 pb-24">
        <div className="mx-auto grid max-w-[1152px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <h2 id="key" className="pg-display text-[clamp(32px,4.5vw,44px)] leading-[1.02] text-foreground">
            Keep your key private
          </h2>
          <div className="text-[16px] leading-relaxed text-muted-foreground">
            <p>
              Your key unlocks Pro under your account, and every Pro file it fetches carries a licence line with your account on it. Don&apos;t
              share it or commit it to a public repository. If it leaks, create a new key on the same page and the old one stops working; the shadcn CLI uses the same key, so update NEXUS_API_KEY in
              .env.local too.
            </p>
            <p className="mt-4">
              It is the same key the shadcn CLI uses, and the MCP server checks it the same way: no key, a key that isn&apos;t recognised, or an
              account without Pro all get the free components and a short note instead of Pro source.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <PillLink href="/pricing" plansSource="mcp_page">
                See Pro
              </PillLink>
              <PillLink href="/claude-code" variant="white">
                Install with the shadcn CLI
              </PillLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
