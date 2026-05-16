"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type LogoCloudClient = {
  name: string;
  slug?: string;
  text?: boolean;
  className?: string;
  invertDark?: boolean;
};

export interface CinematicLogoCloudProps {
  clients: LogoCloudClient[];
  className?: string;
  eyebrow?: string;
  description?: string;
}

export function CinematicLogoCloud({
  clients,
  className,
  eyebrow = "Trusted by teams building the future of AI.",
  description = "From prototype to production, autonomously.",
}: CinematicLogoCloudProps) {
  const renderClient = (client: LogoCloudClient) => {
    if (client.text) {
      return (
        <span className={cn("text-xl font-bold text-zinc-900 dark:text-white", client.className)}>
          {client.name}
        </span>
      );
    }
    return (
      <img
        src={`https://cdn.simpleicons.org/${client.slug}`}
        alt={client.name}
        className={cn("h-6 w-auto", client.invertDark && "dark:invert")}
        loading="lazy"
      />
    );
  };

  return (
    <div className={cn("w-full bg-zinc-50/50 py-12 md:py-16 dark:bg-zinc-950", className)}>
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          {eyebrow}
        </p>
        {description && <p className="mt-1 text-xs text-zinc-500">{description}</p>}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
            hidden: {},
          }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 transition-all"
        >
          {clients.map((brand) => (
            <motion.div
              key={brand.name}
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="flex min-w-[100px] items-center justify-center px-2 sm:min-w-[120px]"
            >
              {renderClient(brand)}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
