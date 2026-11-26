"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { PillLink } from "@/components/site";

export type TemplateShot = { slug: string; title: string; image: string; category: string };

function Row({ shots, x }: { shots: TemplateShot[]; x: MotionValue<number> }) {
  return (
    <motion.ul style={{ x }} className="flex w-max gap-5 will-change-transform">
      {shots.map((t) => (
        <li key={t.slug} className="w-[280px] shrink-0 sm:w-[420px]">
          <Link
            href={`/templates/${t.slug}`}
            className="group block overflow-hidden rounded-[20px] bg-card shadow-[0_0_0_0.5px_var(--cx-hairline),0_20px_40px_-24px_rgba(0,0,0,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
              <Image
                src={t.image}
                alt={`${t.title} template`}
                fill
                sizes="(min-width: 640px) 420px, 280px"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <p className="truncate text-[15px] font-semibold tracking-[-0.2px] text-foreground">{t.title}</p>
              <p className="shrink-0 text-[13px] text-muted-foreground">{t.category}</p>
            </div>
          </Link>
        </li>
      ))}
    </motion.ul>
  );
}

/** Two rows of finished templates that slide past each other as the page scrolls. */
export function TemplateRows({ rows, total }: { rows: [TemplateShot[], TemplateShot[]]; total: number }) {
  const reduce = !!useReducedMotion();
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const a = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -520]);
  const b = useTransform(scrollYProgress, [0, 1], reduce ? [-260, -260] : [-620, -100]);

  return (
    <section ref={ref} aria-labelledby="templates-title" className="cx-section overflow-hidden py-24 sm:py-32">
      <div className="mx-auto flex max-w-[1152px] flex-col gap-6 px-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[560px]">
          <h2 id="templates-title" className="pg-display text-[clamp(38px,6vw,56px)] leading-[1.02] text-foreground">
            Whole sites, made from the same pieces.
          </h2>
          <p className="mt-4 text-[18px] leading-[1.55] text-muted-foreground">
            {total} landing pages built with Nexus UI. Open any of them live; the source comes with Pro.
          </p>
        </div>
        <PillLink href="/templates" variant="white" className="shrink-0 self-start md:self-auto">
          See all {total} templates
        </PillLink>
      </div>
      <div className="mt-12 flex flex-col gap-5 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <Row shots={rows[0]} x={a} />
        <Row shots={rows[1]} x={b} />
      </div>
    </section>
  );
}
