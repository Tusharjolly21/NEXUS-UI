"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardItem {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  category: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface ExpandableCardsProps {
  cards: CardItem[];
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function ExpandableCards({ cards, className }: ExpandableCardsProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const activeCard = cards.find((c) => c.id === activeId) ?? null;

  const open  = (id: string) => setActiveId(id);
  const close = () => setActiveId(null);

  // Escape key
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Body scroll lock
  React.useEffect(() => {
    document.body.style.overflow = activeId ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeId]);

  return (
    <>
      {/* ── Card grid ── */}
      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {cards.map((card) => (
          <motion.article
            key={card.id}
            onClick={() => open(card.id)}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "group cursor-pointer overflow-hidden rounded-2xl",
              "border border-white/[0.06] bg-zinc-900 shadow-lg shadow-black/25",
              "transition-[border-color,box-shadow] duration-200",
              "hover:border-white/[0.14] hover:shadow-xl hover:shadow-black/35",
              "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_40px_-12px_rgba(0,0,0,0.5)]",
            )}
          >
            {/* Image */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={card.image}
                alt={card.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75 backdrop-blur-sm">
                {card.category}
              </span>
            </div>

            {/* Body */}
            <div className="p-4">
              <h3 className="text-[15px] font-semibold leading-snug text-white">
                {card.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/45">
                {card.description}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-white/30 transition-colors duration-200 group-hover:text-white/60">
                <span>Read more</span>
                <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* ── Overlay + expanded card ── */}
      <AnimatePresence>
        {activeCard && (
          <>
            {/* Backdrop */}
            <motion.div
              key="ec-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm"
              onClick={close}
            />

            {/* Expanded card */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
              <motion.div
                key={activeCard.id}
                initial={{ opacity: 0, scale: 0.93, y: 24 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{    opacity: 0, scale: 0.93, y: 24 }}
                transition={{ duration: 0.32, ease: EASE }}
                className={cn(
                  "relative w-full max-w-lg overflow-hidden rounded-3xl",
                  "border border-white/[0.08] bg-zinc-900 shadow-2xl shadow-black/60",
                )}
                style={{ maxHeight: "90dvh" }}
              >
                {/* Image */}
                <div className="relative h-56 shrink-0 overflow-hidden sm:h-64">
                  <img
                    src={activeCard.image}
                    alt={activeCard.title}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/85 via-zinc-900/20 to-transparent" />

                  {/* Category */}
                  <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75 backdrop-blur-sm">
                    {activeCard.category}
                  </span>

                  {/* Close */}
                  <button
                    onClick={close}
                    aria-label="Close"
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/70 backdrop-blur-sm transition hover:bg-black/75 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Scrollable content */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0  }}
                  transition={{ delay: 0.12, duration: 0.28, ease: EASE }}
                  className="overflow-y-auto p-5"
                  style={{ maxHeight: "calc(90dvh - 14rem)" }}
                >
                  <h2 className="text-xl font-bold text-white">{activeCard.title}</h2>

                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    {activeCard.fullDescription}
                  </p>

                  {activeCard.ctaText && (
                    <div className="mt-5">
                      <a
                        href={activeCard.ctaLink ?? "#"}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-white/90"
                      >
                        {activeCard.ctaText}
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
