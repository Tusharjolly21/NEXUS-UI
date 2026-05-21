"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Blocks,
  Bot,
  Clock3,
  Command,
  DatabaseZap,
  Diamond,
  Layers3,
  LockKeyhole,
  MessageSquareText,
  MousePointer2,
  PenTool,
  ShieldCheck,
  Sparkles as SparklesIcon,
  WandSparkles,
} from "lucide-react";
import { AnimatedBentoGrid, type BentoItem } from "@/components/animated-bento-grid";
import { BackgroundGradient } from "@/components/background-gradient";
import { HoverHighlightText } from "@/components/hover-highlight-text";
import { InfiniteMovingCards } from "@/components/infinite-moving-cards";
import { Meteors } from "@/components/meteors";
import { NexusMark } from "@/components/brand";
import { Sparkles } from "@/components/sparkles";
import { StatefulButton } from "@/components/stateful-button";
import { TextGenerateEffect } from "@/components/text-generate-effect";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=85";
const WORKSHOP_IMAGE =
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=85";
const PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1600&q=85";
const OFFICE_IMAGE =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85";

const brands = ["Linear", "Vercel", "Raycast", "Framer", "Stripe", "Supabase", "Arc", "Resend"];

const bentoItems: BentoItem[] = [
  {
    id: "brief",
    label: "Prompt to production",
    value: "12 min",
    icon: <WandSparkles className="size-4" />,
    accent: "#8b5cf6",
    span: "2x1",
    trend: { value: 42, label: "faster" },
  },
  {
    id: "systems",
    label: "Design tokens",
    value: "Synced",
    icon: <Layers3 className="size-4" />,
    accent: "#06b6d4",
  },
  {
    id: "blocks",
    label: "Sections ready",
    value: "48",
    icon: <Blocks className="size-4" />,
    accent: "#f472b6",
  },
  {
    id: "deploy",
    label: "Release notes",
    value: "Auto",
    icon: <DatabaseZap className="size-4" />,
    accent: "#22c55e",
  },
  {
    id: "secure",
    label: "Guardrails",
    value: "Built in",
    icon: <ShieldCheck className="size-4" />,
    accent: "#f59e0b",
    span: "2x1",
  },
];

const testimonials = [
  {
    id: "maya",
    name: "Maya Chen",
    role: "Founder, Northstar Labs",
    rating: 5,
    title: "We launched with a product story, not a blank template.",
    description:
      "The page felt finished on day one. We changed the copy, swapped the data, and shipped a fundraising site before our design sprint even ended.",
  },
  {
    id: "eli",
    name: "Eli Morgan",
    role: "Growth Lead, Atlas Works",
    rating: 5,
    title: "The bento system made every proof point feel intentional.",
    description:
      "It gave our team a visual language for demos, case studies, and conversion sections without adding another design dependency.",
  },
  {
    id: "nora",
    name: "Nora Patel",
    role: "Product Designer, Signal Forge",
    rating: 5,
    title: "Premium motion without the usual performance tax.",
    description:
      "The interactions are polished, responsive, and easy to tune. Our engineering team could actually maintain the page after launch.",
  },
];

const faqs = [
  {
    q: "Can this template be used for a real SaaS launch?",
    a: "Yes. It includes a complete landing-page structure: positioning, social proof, benefits, product visuals, workflow, testimonials, FAQ, and CTA.",
  },
  {
    q: "Is everything built with Nexus UI components?",
    a: "The motion, bento grid, buttons, background effects, text animation, testimonials, and FAQ primitives come from the local Nexus UI component system.",
  },
  {
    q: "Can users customize the copy and imagery?",
    a: "Yes. The sections are data-driven where it matters, and image URLs are isolated constants so teams can replace them with product screenshots or brand photography.",
  },
  {
    q: "Does it support dark and light mode?",
    a: "Yes. The template uses semantic theme tokens, dark variants, and soft neutral surfaces so it stays readable in both modes.",
  },
];

function BrandPill({ name }: { name: string }) {
  return (
    <div className="inline-flex min-w-32 items-center justify-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
      <span className="grid size-5 place-items-center rounded-md bg-foreground text-[10px] font-bold text-background">
        {name.slice(0, 1)}
      </span>
      {name}
    </div>
  );
}

function ProductMockup() {
  return (
    <BackgroundGradient
      borderRadius="2rem"
      className="w-full rounded-[2rem] p-[1px]"
      surfaceClassName="rounded-[calc(2rem-1px)]"
      animationSpeed={0.8}
      blur={28}
    >
      <div className="relative overflow-hidden rounded-[calc(2rem-1px)] border border-white/10 bg-zinc-950 text-white">
        <Image
          src={HERO_IMAGE}
          alt="Team reviewing a launch strategy dashboard"
          width={1800}
          height={1200}
          priority
          className="h-[430px] w-full object-cover opacity-72 sm:h-[520px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(168,85,247,0.35),transparent_32%),linear-gradient(180deg,rgba(9,9,11,0.15),rgba(9,9,11,0.92))]" />
        <div className="absolute inset-x-4 bottom-4 rounded-3xl border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-violet-200/80">
                Launch cockpit
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                Campaign readiness is 94%
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
              +28% trial intent
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Hero clarity", "98"],
              ["Demo clicks", "2.4k"],
              ["Qualified leads", "817"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                <p className="text-xs text-white/50">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BackgroundGradient>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-violet-600 dark:text-violet-300">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function NexusAiLaunchTemplatePage() {
  const handleDemo = React.useCallback(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 900));
  }, []);

  return (
    <main className="overflow-hidden bg-background text-foreground">
      <section className="relative min-h-[calc(100dvh-4rem)] border-b border-border/60">
        <Meteors
          number={22}
          intensity="medium"
          color="rgba(139,92,246,0.95)"
          className="absolute inset-0"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.18),transparent_34%),radial-gradient(circle_at_10%_58%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle,rgba(24,24,27,0.08)_1px,transparent_1px)] bg-[size:auto,auto,28px_28px] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.24),transparent_34%),radial-gradient(circle_at_10%_58%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)]" />
        <Sparkles
          className="pointer-events-none absolute inset-0"
          count={48}
          color="#c4b5fd"
          opacity={0.45}
          speed={0.7}
          background
        />

        <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between rounded-3xl border border-border/70 bg-background/70 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <Link href="/template" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-2xl border border-border/70 bg-card dark:border-white/10 dark:bg-white/[0.06]">
                <NexusMark size={20} />
              </span>
              <span className="text-sm font-semibold">Asteria AI</span>
            </Link>
            <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
              <a href="#features" className="transition-colors hover:text-foreground">Features</a>
              <a href="#workflow" className="transition-colors hover:text-foreground">Workflow</a>
              <a href="#proof" className="transition-colors hover:text-foreground">Proof</a>
              <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
            </div>
            <Link
              href="#contact"
              className={cn(
                buttonVariants({ size: "sm" }),
                "rounded-full bg-foreground px-4 text-background hover:bg-foreground/90",
              )}
            >
              Start
            </Link>
          </nav>

          <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:py-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-200">
                <SparklesIcon className="size-3.5" />
                AI landing system for serious launches
              </div>
              <TextGenerateEffect
                as="h1"
                text="Turn a messy idea into a launch page that feels inevitable."
                mode="word"
                stagger={0.035}
                duration={0.5}
                className="mt-6 max-w-4xl text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
              />
              <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
                Asteria AI is a premium launch template for products that need
                to explain, persuade, and convert without looking like another
                recycled SaaS page.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <StatefulButton
                  onClick={handleDemo}
                  loadingText="Preparing demo..."
                  successText="Demo ready"
                  size="lg"
                  icon={<MousePointer2 className="size-4" />}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  Book interactive demo
                </StatefulButton>
                <Link
                  href="#features"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-12 rounded-full border-border/70 bg-background/70 px-6 backdrop-blur",
                  )}
                >
                  Explore sections <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                {[
                  ["42%", "more demo clicks"],
                  ["8.7k", "waitlist joins"],
                  ["3 hrs", "to customize"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <ProductMockup />
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-muted/20 py-10 dark:bg-zinc-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Built for teams that ship with modern product stacks
          </p>
          <div className="mt-6">
            <InfiniteMovingCards
              items={brands.map((brand) => ({ id: brand, title: brand }))}
              speed="slow"
              gap={14}
              cardClassName="!min-w-0"
              renderItem={(item) => <BrandPill name={item.title ?? ""} />}
            />
          </div>
        </div>
      </section>

      <section id="features" className="relative py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why it converts"
            title="A page architecture that sells the product before the call."
            description="Every block has a job: earn attention, build trust, show the workflow, and create a clear next step."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-border/70 bg-card/80 p-5 shadow-[0_26px_100px_-80px_rgba(15,23,42,0.65)] dark:border-white/10 dark:bg-white/[0.04]">
              <Image
                src={WORKSHOP_IMAGE}
                alt="Product team mapping ideas on a workshop wall"
                width={1600}
                height={1067}
                className="h-72 w-full rounded-3xl object-cover sm:h-96"
              />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  [Command, "Clear narrative", "Headline, proof, and CTA are aligned from the first viewport."],
                  [PenTool, "Editable by design", "Swap copy, colors, imagery, and metrics without rebuilding sections."],
                ].map(([Icon, title, body]) => {
                  const TypedIcon = Icon as typeof Command;
                  return (
                    <div key={String(title)} className="rounded-3xl border border-border/70 bg-background/70 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                      <TypedIcon className="size-5 text-violet-500 dark:text-violet-300" />
                      <p className="mt-4 text-sm font-semibold">{title as string}</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body as string}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <AnimatedBentoGrid
              items={bentoItems}
              columns={3}
              variant="spotlight"
              className="content-start"
              itemClassName="min-h-[150px]"
            />
          </div>
        </div>
      </section>

      <section id="workflow" className="relative border-y border-border/60 bg-zinc-950 py-24 text-white md:py-32">
        <Sparkles
          className="pointer-events-none absolute inset-0"
          count={42}
          color="#93c5fd"
          opacity={0.35}
          background
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(139,92,246,0.28),transparent_34%),radial-gradient(circle_at_80%_70%,rgba(14,165,233,0.16),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="self-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-violet-200">
              Workflow
            </p>
            <HoverHighlightText
              text="From first prompt to polished launch."
              as="h2"
              containerClassName="mt-4 block"
              baseClassName="text-left text-4xl font-bold tracking-tight text-white/15 sm:text-5xl"
              highlightClassName="text-left text-4xl font-bold tracking-tight text-white sm:text-5xl"
              highlightColor="#ffffff"
              strokeColor="rgba(255,255,255,0.22)"
            />
            <p className="mt-6 max-w-xl text-pretty text-base leading-8 text-white/65">
              Use the template as a launch command center: refine the product
              story, showcase proof, connect analytics, and publish without
              losing the premium feel.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              ["01", "Write the offer", "Use the hero and proof blocks to make the value proposition impossible to miss.", Bot],
              ["02", "Show the system", "Bento cards, metrics, and media panels translate abstract AI features into product clarity.", BarChart3],
              ["03", "Launch and learn", "CTA, testimonials, and FAQ blocks support real conversion experiments after launch.", Clock3],
            ].map(([step, title, body, Icon]) => {
              const TypedIcon = Icon as typeof Bot;
              return (
                <div key={String(step)} className="group grid gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur transition-colors hover:bg-white/[0.07] sm:grid-cols-[auto_1fr_auto] sm:items-center">
                  <span className="text-sm font-semibold text-violet-200">{step as string}</span>
                  <div>
                    <p className="text-lg font-semibold">{title as string}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/55">{body as string}</p>
                  </div>
                  <span className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/70">
                    <TypedIcon className="size-5" />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="proof" className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Proof layer"
            title="Give visitors enough confidence to move."
            description="A strong landing page is not just beautiful. It gives buyers proof, speed, clarity, and a reason to believe the product will work for them."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/80 p-4 shadow-[0_28px_100px_-78px_rgba(15,23,42,0.65)] dark:border-white/10 dark:bg-white/[0.04]">
              <Image
                src={PRODUCT_IMAGE}
                alt="Team collaborating around product analytics"
                width={1600}
                height={1067}
                className="h-[430px] w-full rounded-[1.5rem] object-cover"
              />
              <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/15 bg-black/55 p-5 text-white backdrop-blur-xl">
                <p className="text-sm text-white/60">Live experiment</p>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                  <p className="max-w-md text-2xl font-semibold tracking-tight">
                    Pricing page variant won by 19.4%
                  </p>
                  <span className="rounded-full bg-emerald-400 px-3 py-1 text-sm font-semibold text-emerald-950">
                    Ship winner
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                ["Conversion story", "Use metrics, feature proof, and testimonials in one continuous persuasion path.", MessageSquareText],
                ["Trust by default", "Security, deployment, and governance cards are already designed into the page.", LockKeyhole],
                ["Premium restraint", "Elegant motion and rich surfaces without turning the page into visual noise.", Diamond],
              ].map(([title, body, Icon]) => {
                const TypedIcon = Icon as typeof MessageSquareText;
                return (
                  <div key={String(title)} className="rounded-3xl border border-border/70 bg-card/80 p-6 dark:border-white/10 dark:bg-white/[0.04]">
                    <TypedIcon className="size-5 text-violet-500 dark:text-violet-300" />
                    <p className="mt-5 text-lg font-semibold">{title as string}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body as string}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-14">
            <InfiniteMovingCards
              items={testimonials}
              speed="slow"
              gap={18}
              cardClassName="w-[min(24rem,calc(100vw-3rem))]"
            />
          </div>
        </div>
      </section>

      <section id="faq" className="relative border-y border-border/60 bg-muted/20 py-24 dark:bg-zinc-950/40 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-violet-600 dark:text-violet-300">
              FAQ
            </p>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Built to be edited, shipped, and trusted.
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
              Use this as a production-ready starting point, then replace the
              story with your customer, product, and market details.
            </p>
          </div>

          <Accordion className="rounded-3xl border border-border/70 bg-card/80 p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            {faqs.map((item) => (
              <AccordionItem key={item.q} value={item.q} className="border-border/60 px-3 dark:border-white/10">
                <AccordionTrigger className="py-4 text-base hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="contact" className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.14),transparent_34%)]" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <BackgroundGradient borderRadius="2rem" className="w-full rounded-[2rem] p-[1px]">
            <div className="rounded-[calc(2rem-1px)] bg-zinc-950 px-6 py-14 text-white sm:px-10 md:py-18">
              <Image
                src={OFFICE_IMAGE}
                alt="Modern studio workspace"
                width={400}
                height={400}
                className="mx-auto h-24 w-24 rounded-3xl border border-white/10 object-cover shadow-2xl"
              />
              <h2 className="mx-auto mt-8 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                Bring the page online before the idea cools down.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-8 text-white/65">
                Replace the copy, connect the CTA, tune the brand palette, and
                you have a landing page that can carry a real launch.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants(),
                    "h-11 rounded-full bg-white px-6 text-zinc-950 hover:bg-white/90",
                  )}
                >
                  Customize this template <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/components"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-11 rounded-full border-white/15 bg-white/[0.04] px-6 text-white hover:bg-white/[0.08] hover:text-white",
                  )}
                >
                  Browse components
                </Link>
              </div>
            </div>
          </BackgroundGradient>
        </div>
      </section>
    </main>
  );
}

export default NexusAiLaunchTemplatePage;
