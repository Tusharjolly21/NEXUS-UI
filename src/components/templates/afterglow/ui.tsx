import type { ReactNode } from "react";
import { motion } from "framer-motion";

export const COLORS = { smoke: "#a39c94", ember: "#ff7a2f", honey: "#ffc58a", up: "#5ee6a3", down: "#ff6b6b" };

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="ag-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COLORS.honey} />
          <stop offset="1" stopColor={COLORS.ember} />
        </linearGradient>
      </defs>
      <path d="M4 14a8 8 0 0 1 16 0Z" fill="url(#ag-sun)" />
      <rect x="3" y="16" width="18" height="1.8" rx=".9" fill={COLORS.ember} opacity=".75" />
      <rect x="6" y="19.4" width="12" height="1.6" rx=".8" fill={COLORS.ember} opacity=".4" />
    </svg>
  );
}

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "ghost";
  size?: "md" | "lg";
  className?: string;
  onClick?: () => void;
};

export function Button({ children, href = "#", variant = "primary", size = "md", className = "", onClick }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[-0.01em] outline-none transition-[background-color,box-shadow,color] duration-200 focus-visible:ring-2 focus-visible:ring-[#ffc58a] focus-visible:ring-offset-2 focus-visible:ring-offset-black";
  const sizing = size === "lg" ? "h-12 px-6 text-[15px]" : "h-10 px-[18px] text-[14px]";
  const tone =
    variant === "primary"
      ? "bg-[#f3efe9] text-black hover:bg-white hover:shadow-[0_0_0_4px_rgba(255,122,47,.18),0_10px_30px_-10px_rgba(255,122,47,.55)]"
      : "text-[#f3efe9] shadow-[inset_0_0_0_1px_rgba(255,255,255,.16)] hover:bg-white/[.06] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,.28)]";
  return (
    <motion.a
      href={href}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${sizing} ${tone} ${className}`}
    >
      {children}
    </motion.a>
  );
}

export function Section({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section
      id={id}
      className={`relative mx-auto w-full max-w-[1180px] px-5 sm:px-8 ${className}`}
      style={{ scrollMarginTop: 80 }}
    >
      {children}
    </section>
  );
}

export function SectionHead({ title, body, center = false }: { title: string; body?: string; center?: boolean }) {
  return (
    <div className={`flex flex-col gap-4 ${center ? "items-center text-center" : ""}`}>
      <h2 className="max-w-[18ch] text-[clamp(34px,5.2vw,58px)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#f3efe9]">
        {title}
      </h2>
      {body && <p className="max-w-[52ch] text-[17px] leading-[1.55] text-[#a39c94]">{body}</p>}
    </div>
  );
}

export const CARD =
  "rounded-[20px] bg-[linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.012))] shadow-[inset_0_0_0_1px_rgba(255,255,255,.075)]";
