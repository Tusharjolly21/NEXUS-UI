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
import { API_KEY_ENV_VAR } from "@/lib/registry-config";

export const metadata: Metadata = createMetadata({
  title: "Nexus UI MCP server for Claude Code and Cursor",
  description:
    "Connect Claude Code, Cursor or any MCP client to Nexus UI: search components, blocks, templates and icons, read install commands and pull free source. Pro source uses your API key.",
  alternates: { canonical: "/docs/mcp" },
});

const code = docInlineCodeClass;
const link = "text-link underline-offset-4 hover:underline";
const ENDPOINT = "https://www.nexus-ui.com/mcp";

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

        <DocSection title="What it can do">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>
              <code className={code}>search_nexus</code>: search components, blocks, templates, videos and icons by what
              they do, and filter to free ones.
            </li>
            <li>
              <code className={code}>get_nexus_item</code>: what one item is, whether it is free or Pro, its page and
              its install command.
            </li>
            <li>
              <code className={code}>get_component_source</code>: the source files of a component or block, with the path
              to write each one to and the npm packages it needs.
            </li>
            <li>
              <code className={code}>get_build_prompt</code>: the build prompt of a free component.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            It reads only. It never changes anything in your project on its own; your tool decides what to write and asks
            you first, as it does for any other file change.
          </p>
        </DocSection>

        <DocSection title="Connect Claude Code">
          <DocPre>{`claude mcp add --transport http nexus-ui ${ENDPOINT}`}</DocPre>
          <p className="text-sm text-muted-foreground">
            That is enough for every free item. For Pro items, send your API key too (the same key the CLI uses; create
            one in the{" "}
            <Link href="/dashboard/api-key" className={link}>
              dashboard
            </Link>{" "}
            and keep it in <code className={code}>{API_KEY_ENV_VAR}</code>):
          </p>
          <DocPre>{`claude mcp add --transport http nexus-ui ${ENDPOINT} \\
  --header "Authorization: Bearer $${API_KEY_ENV_VAR}"`}</DocPre>
        </DocSection>

        <DocSection title="Connect Cursor and other tools">
          <p className="text-sm text-muted-foreground">
            Any client that supports remote MCP servers over HTTP can use the same address. In Cursor, add this to{" "}
            <code className={code}>.cursor/mcp.json</code>:
          </p>
          <DocPre>{`{
  "mcpServers": {
    "nexus-ui": {
      "url": "${ENDPOINT}",
      "headers": {
        "Authorization": "Bearer \${env:${API_KEY_ENV_VAR}}"
      }
    }
  }
}`}</DocPre>
          <p className="text-sm text-muted-foreground">
            Leave out <code className={code}>headers</code> if you only use free items. Other tools name the settings
            differently; they need the address and, for Pro, that one header.
          </p>
        </DocSection>

        <DocSection title="Free and Pro">
          <p className="text-sm text-muted-foreground">
            Searching and reading what an item is are open to everyone, including Pro items, the same as the site. Source
            code follows the same rules as <code className={code}>npx shadcn add</code>: free items work without a key,
            and a Pro item needs a key from an account with a Pro plan or All-Access. Without one, the server tells your
            tool where to get a key instead of returning code. Pro build prompts stay on the component pages for signed-in
            Pro members.
          </p>
          <p className="text-sm text-muted-foreground">
            Keep your key out of your repository: put it in an environment variable, as the CLI guide describes. See{" "}
            <Link href="/docs/cli" className={link}>
              CLI
            </Link>{" "}
            for the key setup and <Link href="/pricing" className={link}>
              pricing
            </Link> for the plans.
          </p>
        </DocSection>

        <DocSection title="Try it">
          <p className="text-sm text-muted-foreground">Once connected, ask your tool something like:</p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>Find a free pricing section in Nexus UI and add it to my landing page.</li>
            <li>Which Nexus UI components make a sound when you press them?</li>
            <li>Show me the fintech templates in Nexus UI.</li>
          </ul>
        </DocSection>

        <DocFooterNav prev={{ href: "/docs/icons", label: "Icons" }} />
      </DocPageShell>
    </>
  );
}
