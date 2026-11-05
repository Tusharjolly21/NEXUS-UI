"use client";

import { motion } from "framer-motion";
import { AppIcon } from "./app-icon";
import { BLUE, INK } from "./theme";

const LINKS = [
  { label: "Features", target: "features" },
  { label: "Radar", target: "radar" },
  { label: "Widgets", target: "widgets" },
  { label: "Pricing", target: "pricing" },
] as const;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * The fixed top bar. Over the hero's sky (`onSky`) it is a dark translucent strip with white text; over the
 * white sections it turns into frosted white with grey text.
 */
export function NavBar({ onSky }: { onSky: boolean }) {
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-colors duration-500"
      style={{
        background: onSky ? "rgba(0,0,0,.18)" : "rgba(251,251,253,.8)",
        backdropFilter: "saturate(1.8) blur(20px)",
        WebkitBackdropFilter: "saturate(1.8) blur(20px)",
        boxShadow: onSky ? "inset 0 -1px 0 rgba(255,255,255,.12)" : "inset 0 -1px 0 rgba(0,0,0,.08)",
      }}
    >
      <nav aria-label="Main" className="mx-auto flex h-[52px] max-w-[1024px] items-center justify-between px-5">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="nb-ring flex items-center gap-2 rounded text-[21px] font-semibold tracking-[-0.02em] outline-none transition-colors duration-500"
          style={{ color: onSky ? "#fff" : INK }}
        >
          <AppIcon size={26} style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,.18))" }} />
          Nimbus
        </button>
        <div className="flex items-center gap-6 text-[12px]">
          <span className="hidden items-center gap-6 sm:flex">
            {LINKS.map(({ label, target }) => (
              <button
                key={target}
                type="button"
                onClick={() => scrollToSection(target)}
                className="nb-ring rounded outline-none transition-colors duration-500 hover:opacity-70"
                style={{ color: onSky ? "rgba(255,255,255,.85)" : "#424245" }}
              >
                {label}
              </button>
            ))}
          </span>
          <motion.button
            type="button"
            onClick={() => scrollToSection("pricing")}
            whileTap={{ scale: 0.95 }}
            className="nb-ring rounded-full px-3 py-1 text-[12px] font-normal text-white outline-none"
            style={{ background: BLUE }}
          >
            Download
          </motion.button>
        </div>
      </nav>
    </header>
  );
}
