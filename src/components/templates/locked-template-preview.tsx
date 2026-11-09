"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { GLOBAL_PRICING, type DisplayPricing } from "@/lib/pricing";
import { templateSectionShots } from "@/lib/template-shots";
import type { MarketplaceTemplate } from "@/lib/catalog/templates";
import {
  AnimatedLock,
  ProLockVeil,
} from "@/components/templates/pro-lock-veil";

/**
 * What the live preview shows a visitor without Pro, in place of the running template. The page's
 * code is never sent: the visitor scrolls the real hero and first section as screenshots, then the
 * page frosts over and an animated lock takes over, with the sections still to come drifting past
 * underneath it. Links target the top window because this renders inside the preview iframe.
 */
export function LockedTemplatePreview({
  tmpl,
  name,
  pricing = GLOBAL_PRICING,
}: {
  tmpl: MarketplaceTemplate;
  name: string;
  pricing?: DisplayPricing;
}) {
  const reduce = useReducedMotion();
  const shots = templateSectionShots(tmpl, false);
  const open = shots.filter((s) => !s.locked);
  const locked = shots.filter((s) => s.locked);
  const lockedSections = tmpl.sections.slice(
    Math.min(tmpl.sections.length - 1, 2),
  );
  const pages = [tmpl.previewImages?.hero, ...open.map((s) => s.src)].filter(
    Boolean,
  ) as string[];

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      {/* the free look: real screens, full width, one after another like the page itself */}
      {pages.map((src, i) => (
        <motion.div
          key={src}
          className="relative aspect-[16/10] w-full overflow-hidden"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={src}
            alt={i === 0 ? `${name} home page` : ""}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-top"
          />
        </motion.div>
      ))}

      {/* the rest: frosted stand-ins under the lock; the lock and the offer stay pinned while you scroll */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-32 z-10 h-32 bg-gradient-to-b from-transparent to-white/60" />
        {locked.map((s) => (
          <div
            key={s.src}
            className="relative aspect-[16/10] w-full overflow-hidden"
          >
            <Image
              src={s.src}
              alt=""
              fill
              sizes="100vw"
              className="scale-110 object-cover object-top"
            />
          </div>
        ))}
        <ProLockVeil lock={false} />
        {/* section names drifting up behind the offer, so you know what's in there */}
        {reduce ? null : (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            {lockedSections.map((label, i) => (
              <motion.span
                key={label}
                className="absolute whitespace-nowrap rounded-full bg-white/60 px-4 py-2 text-[14px] font-semibold text-[#1d1d1f]/70 backdrop-blur-md"
                style={{ left: `${6 + ((i * 41) % 72)}%` }}
                initial={{ top: "100%", opacity: 0 }}
                animate={{ top: "-6%", opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 12,
                  delay: i * 2,
                  repeat: Infinity,
                  repeatDelay: Math.max(1, lockedSections.length * 2 - 12 + 2),
                  ease: "linear",
                }}
              >
                {label}
              </motion.span>
            ))}
          </div>
        )}

        <div className="absolute inset-0 z-20 px-4 pt-10">
          <div className="sticky top-6 mx-auto flex max-w-[440px] flex-col items-center">
            <AnimatedLock size="lg" />
            <motion.div
              className="-mt-3 w-full rounded-[28px] bg-white p-7 text-center shadow-[0_0_0_0.5px_rgba(0,0,0,0.08),0_40px_80px_-30px_rgba(0,0,0,0.45)]"
              initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <h2 className="text-[24px] font-semibold leading-tight tracking-[-0.025em]">
                The rest of {name} comes with Pro
              </h2>
              <p className="mx-auto mt-2.5 max-w-[340px] text-[15px] leading-[1.5] text-[#6e6e73]">
                You&apos;ve seen the top
                {locked.length
                  ? ` and there are ${locked.length} more screens below`
                  : ""}
                . Pro opens the whole page live, its source and build prompt,
                and every other template.
              </p>
              <ul className="mx-auto mt-5 grid max-w-[300px] gap-2 text-left text-[14px]">
                {[
                  "The whole template, live",
                  "Source zip, ready to run",
                  "Every template, component and block",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2.5">
                    <span className="mt-[1px] grid size-[18px] shrink-0 place-items-center rounded-full bg-[#0071e3] text-white">
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid gap-2">
                <a
                  href="/pricing"
                  target="_top"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#0071e3] text-[16px] font-semibold text-white transition-colors hover:bg-[#0077ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
                >
                  Get Pro, {pricing.pro} a year
                </a>
                <a
                  href="/pricing"
                  target="_top"
                  className="inline-flex h-11 items-center justify-center rounded-full text-[15px] font-medium text-[#0066cc] transition-colors hover:bg-black/[0.04]"
                >
                  Or lifetime, {pricing.allAccess} once
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
