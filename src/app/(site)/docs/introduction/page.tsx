import type { Metadata } from "next";
import Link from "next/link";
import {
  DocFooterNav,
  DocPageHeader,
  DocPageShell,
  DocSection,
  TechArticleJsonLd,
  docInlineCodeClass,
} from "@/components/docs/doc-page";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import { createMetadata } from "@/lib/seo";
import { CliSimulator } from "@/components/docs/interactive/cli-simulator";

export const metadata: Metadata = createMetadata({
  title: "Introduction",
  description:
    "Nexus UI — a modern React component library, block catalog, and template marketplace built on Next.js, Tailwind CSS v4, Framer Motion, and shadcn/ui.",
  alternates: { canonical: "/docs/introduction" },
});

export default function IntroductionPage() {
  return (
    <>
      <TechArticleJsonLd
        title="Introduction"
        description="Nexus UI — a modern React component library, block catalog, and template marketplace built on Next.js, Tailwind CSS v4, Framer Motion, and shadcn/ui."
        slug="introduction"
      />
      <DocPageShell>
        <DocPageHeader
          title="Introduction"
          description="Nexus UI is a curated collection of animated React components, production-ready blocks, and full-page templates — all copy-paste ready, built on the modern web stack."
        />

        <DocSection title="What is Nexus UI?">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Nexus UI is a component library and marketplace that ships polished, animated UI primitives
            you own completely. Instead of wrapping a third-party package, you copy the source directly
            into your project and adapt it however you need. Every piece is built on the same
            production-proven stack:{" "}
            <strong className="font-medium text-foreground">Next.js App Router</strong>,{" "}
            <strong className="font-medium text-foreground">TypeScript</strong>,{" "}
            <strong className="font-medium text-foreground">Tailwind CSS v4</strong>,{" "}
            <strong className="font-medium text-foreground">Framer Motion</strong>, and{" "}
            <strong className="font-medium text-foreground">shadcn/ui</strong> design tokens.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The library is organized into three layers: a{" "}
            <Link href="/components" className="text-link underline-offset-4 hover:underline">
              component catalog
            </Link>{" "}
            of {CATALOG_COUNTS.components} animated components, a{" "}
            <Link href="/blocks" className="text-link underline-offset-4 hover:underline">
              block catalog
            </Link>{" "}
            of multi-variant page sections, and a{" "}
            <Link href="/templates" className="text-link underline-offset-4 hover:underline">
              template marketplace
            </Link>{" "}
            of full landing-page compositions.
          </p>
        </DocSection>

        <DocSection title="Tech stack">
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              ["Next.js App Router", "File-based routing, server components, and edge-ready deployment"],
              ["TypeScript", "Strict mode throughout — every component and hook is fully typed"],
              ["Tailwind CSS v4", "CSS-first config, PostCSS plugin, and OKLCH design tokens"],
              ["Framer Motion", "Spring physics, scroll-linked animations, and AnimatePresence transitions"],
              ["shadcn/ui", "Radix-powered primitives — button, dialog, tabs, and more"],
              ["Supabase (optional)", "Auth, user profiles, and bookmarks for gated content"],
              ["Lemon Squeezy (optional)", "Template and plan checkout with webhook handling"],
            ].map(([name, desc]) => (
              <li key={name} className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-primary">—</span>
                <span>
                  <strong className="font-medium text-foreground">{name}</strong>
                  {" — "}
                  {desc}
                </span>
              </li>
            ))}
          </ul>
        </DocSection>

        <DocSection title="Component catalog">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {CATALOG_COUNTS.components} animated components spanning backgrounds, cards, text effects, inputs, navigation,
            media, and data display — all with live previews and copy-ready React source on each detail
            page.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                category: "Backgrounds & Heroes",
                items: ["Background Boxes", "Background Gradient", "Dot Grid Hero", "Starfield Hero", "Particle Noise", "Layered Wave Background", "Shader Flow", "Shooting Stars Grid"],
              },
              {
                category: "Cards & Decks",
                items: ["Cinematic Card Deck", "Card Carousel 3D", "Card Stack Rotator", "Draggable Card Stack", "Expandable Cards", "Glowing Effect Cards", "Warp Speed Card", "3D Folder"],
              },
              {
                category: "Text Effects",
                items: ["Cursor Text Reveal", "Text Generate Effect", "Text Reveal Card", "Typewriter Effect", "Encrypted Text", "Squiggly Text", "Hover Highlight Text", "Animated Select Headline"],
              },
              {
                category: "Inputs & Forms",
                items: ["Gooey Input", "Signup Form", "Phone Input", "Ask Nexus Input", "Command Palette", "Stateful Button", "Glow Button"],
              },
              {
                category: "Navigation",
                items: ["Floating Dock", "Keyboard"],
              },
              {
                category: "Media & Visuals",
                items: ["Globe Pins", "Interactive Globe Explorer", "Interactive Dots", "Image Trail", "Compare", "Sparkles", "Meteors", "Wavy Lines"],
              },
              {
                category: "Data & Social",
                items: ["Infinite Moving Cards", "Scrolling Testimonials", "Avatar Group", "Images Badge", "Chat Messages", "Profile Orbit", "Animated Countdown"],
              },
              {
                category: "Layout & Motion",
                items: ["Animated Bento Grid", "Bento Grid Skeleton", "Motion Layer Scroller", "Circular Carousel", "Word Magnet", "Real-Time Cursors", "Spectra Frame", "Feature Tools Card"],
              },
            ].map(({ category, items }) => (
              <div key={category} className="rounded-xl border border-border bg-muted/40 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary/80">
                  {category}
                </p>
                <ul className="space-y-0.5">
                  {items.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Browse the full catalog →{" "}
            <Link href="/components" className="text-link underline-offset-4 hover:underline">
              /components
            </Link>
          </p>
        </DocSection>

        <DocSection title="Block catalog">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Blocks are multi-variant page sections — each block ships several layout options you can
            drop into any landing page without wiring up animation from scratch.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              ["Text Animations", "Typewriter, blur-fade-in, flipping words, and AI generate-typewriter headings"],
              ["Brand Logo Animation", "Blur-flip grid, marquee, spotlight, swap, and single-row logo clouds"],
              ["Interactive Background Card", "Interactive dots, layered waves, particle noise, and aurora wavy lines"],
              ["Why Choose Us Bento Grid", "Mentorship, ATS scoring, upload flow, progress tracking, interview cards"],
              ["FAQ Folder Card", "Questions & answers, searchable FAQ, and chat-style animated FAQ"],
              ["Sidebar", "Simple hover sidebar, collapsible icon-only sidebar, and grouped sidebar"],
              ["Contact Page", "Global signal, centered intake, gradient proof, and image story layouts"],
              ["Blog Content Sections", "Centered article, sticky TOC, editorial story, and featured posts index"],
            ].map(([name, desc]) => (
              <li key={name} className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-primary">—</span>
                <span>
                  <strong className="font-medium text-foreground">{name}</strong>
                  {" — "}
                  {desc}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Browse blocks →{" "}
            <Link href="/blocks" className="text-link underline-offset-4 hover:underline">
              /blocks
            </Link>
          </p>
        </DocSection>

        <DocSection title="Template marketplace">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Full-page templates are complete landing page compositions built from Nexus UI components.
            Each template includes a live preview, source download, and a &ldquo;Your Brand&rdquo;
            customizer for instant colour and copy changes.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { name: "Asteria AI Launch", category: "AI Startup" },
              { name: "Aurora SaaS Launch", category: "SaaS" },
              { name: "Forge AI Startup", category: "AI Startup" },
              { name: "Simplistic AI SaaS", category: "SaaS" },
              { name: "Orbit AI Developer Tool", category: "AI Tools" },
              { name: "TalentHub Agency Landing", category: "Startup" },
              { name: "Synapse AI Agent Platform", category: "AI Tools" },
              { name: "Helix AI Workflow Intelligence", category: "AI Tools" },
              { name: "Orion Autonomous Enterprise AI", category: "AI Tools" },
              { name: "Startup Landing Page", category: "Startup" },
              { name: "Nova One — Apple-Style Product", category: "Startup" },
              { name: "Lumis AI Agency", category: "Agency" },
              { name: "Pulse Engineering Operations", category: "SaaS" },
              { name: "Aether Personal Portfolio", category: "Portfolio" },
              { name: "Ocean Flow Diving Equipment", category: "E-Commerce" },
            ].map(({ name, category }) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2.5"
              >
                <span className="text-sm text-foreground">{name}</span>
                <span className="ml-3 shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                  {category}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Browse templates →{" "}
            <Link href="/templates" className="text-link underline-offset-4 hover:underline">
              /templates
            </Link>
          </p>
        </DocSection>

        <DocSection title="How components are delivered">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Nexus UI uses the{" "}
            <strong className="font-medium text-foreground">shadcn registry model</strong>. You never
            install an <code className={docInlineCodeClass}>npm</code> package for UI components — you
            copy the source code into your own project and own it fully. Two ways to get a component:
          </p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-primary">1.</span>
              <span>
                <strong className="font-medium text-foreground">Copy from the detail page</strong> —
                open any component page, switch to the{" "}
                <strong className="font-medium text-foreground">Code</strong> tab, and paste the React
                source into your project.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-primary">2.</span>
              <span>
                <strong className="font-medium text-foreground">
                  Install via the @nexus-labs registry
                </strong>{" "}
                — add the hosted registry to your{" "}
                <code className={docInlineCodeClass}>components.json</code> and pull any component by
                slug:
                <pre className="mt-2 overflow-x-auto rounded-xl border border-[#3e3e3e] bg-[#1e1e1e] p-4 text-[13px] leading-relaxed text-[#d4d4d4]">
                  <code>{`npx shadcn@latest add @nexus-labs/terminal\nnpx shadcn@latest add @nexus-labs/gooey-input`}</code>
                </pre>
              </span>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            See the{" "}
            <Link href="/docs/cli" className="text-link underline-offset-4 hover:underline">
              CLI guide
            </Link>{" "}
            for full registry setup instructions.
          </p>
          <CliSimulator autoplay={false} />
        </DocSection>

        <DocSection title="Get started">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Follow the setup guides in order to get a working environment that matches the Nexus UI
            stack.
          </p>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="shrink-0 text-primary">1.</span>
              <Link href="/docs/installation" className="text-link underline-offset-4 hover:underline">
                Nexus-UI setup
              </Link>
              {" — create a Next.js app, add Tailwind, cn(), shadcn/ui, and your first component"}
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 text-primary">2.</span>
              <Link href="/docs/install-nextjs" className="text-link underline-offset-4 hover:underline">
                Install Next.js
              </Link>
              {" — create a fresh App Router project as your target app"}
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 text-primary">3.</span>
              <Link href="/docs/install-tailwindcss" className="text-link underline-offset-4 hover:underline">
                Install Tailwind CSS
              </Link>
              {" — add Tailwind v4 with PostCSS and shared design tokens"}
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 text-primary">4.</span>
              <Link href="/docs/add-utilities" className="text-link underline-offset-4 hover:underline">
                Add utilities
              </Link>
              {" — install clsx, tailwind-merge, and wire the "}
              <code className={docInlineCodeClass}>cn()</code>
              {" helper"}
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 text-primary">5.</span>
              <Link href="/docs/cli" className="text-link underline-offset-4 hover:underline">
                CLI
              </Link>
              {" — initialize shadcn/ui and pull components via the @nexus-labs registry"}
            </li>
          </ol>
        </DocSection>

        <DocFooterNav next={{ href: "/docs/installation", label: "Quick Start" }} />

        <p className="text-sm text-muted-foreground">
          <Link href="/components" className="text-muted-foreground hover:text-foreground">
            ← Components library
          </Link>
        </p>
      </DocPageShell>
    </>
  );
}
