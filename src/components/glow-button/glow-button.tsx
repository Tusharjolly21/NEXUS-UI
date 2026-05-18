"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type GlowButtonProps = {
  children?: React.ReactNode;
  href?: string;
  className?: string;
  innerClassName?: string;
  background?: string;
  textColor?: string;
  arrowColor?: string;
  radius?: number;
  glow?: string;
  borderColor?: string;
  openInNewTab?: boolean;
} & Omit<React.ComponentPropsWithoutRef<typeof motion.a>, "children" | "href" | "color">;

export function GlowButton({
  children = "Get Started Now",
  href = "#",
  className,
  innerClassName,
  background = "rgb(0, 0, 0)",
  textColor = "rgb(255, 255, 255)",
  arrowColor = "rgb(255, 255, 255)",
  radius = 8,
  glow = "0px 20px 50px 4px rgba(255, 255, 255, 0.25)",
  borderColor = "rgba(255, 255, 255, 0.25)",
  openInNewTab = false,
  ...props
}: GlowButtonProps) {
  const rounded = `${radius}px`;
  const target = openInNewTab ? "_blank" : undefined;
  const rel = openInNewTab ? "noreferrer noopener" : undefined;

  return (
    <motion.a
      href={href}
      target={target}
      rel={rel}
      initial="rest"
      animate="rest"
      whileHover="hover"
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center overflow-visible no-underline",
        className,
      )}
      {...props}
    >
      <motion.span
        aria-hidden
        variants={{
          rest: {
            scale: 0.4,
            boxShadow: glow,
          },
          hover: {
            scale: 1,
            boxShadow: "0px 7px 20px 0px rgba(255, 255, 255, 0.25)",
          },
        }}
        transition={{ type: "spring", duration: 1, bounce: 0 }}
        className="absolute inset-0 z-0 origin-bottom"
        style={{
          borderRadius: rounded,
          backgroundColor: "transparent",
        }}
      />

      <span
        className="relative z-10 inline-flex items-center justify-center overflow-hidden p-px"
        style={{ borderRadius: rounded, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
      >
        <motion.span
          aria-hidden
          variants={{
            rest: {
              left: "30%",
              width: "40%",
            },
            hover: {
              left: "0%",
              width: "100%",
            },
          }}
          transition={{ type: "spring", duration: 1, bounce: 0 }}
          className="absolute bottom-0 z-10 h-1/2"
          style={{
            borderRadius: rounded,
            background:
              "radial-gradient(50% 200% at 50% 50%, rgba(255,255,255,0.1) 0%, rgb(255,255,255) 52%, rgba(255,255,255,0.1) 100%)",
          }}
        />

        <span
          aria-hidden
          className="absolute inset-0 z-0 backdrop-blur-[10px]"
          style={{
            borderRadius: rounded,
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.47) 0%, rgba(171,171,171,0.4) 100%)",
          }}
        />

        <span
          aria-hidden
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            borderRadius: rounded,
            border: `1px solid ${borderColor}`,
          }}
        />

        <span
          className={cn(
            "relative z-20 inline-flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm leading-none",
            innerClassName,
          )}
          style={{
            borderRadius: rounded,
            background,
            color: textColor,
          }}
        >
          <span>{children}</span>
          <span className="grid size-5 place-items-center overflow-hidden">
            <motion.span
              variants={{
                rest: { x: 0 },
                hover: { x: [0, 4, 0] },
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <ArrowRight className="size-5" style={{ color: arrowColor, strokeWidth: 1.5 }} />
            </motion.span>
          </span>
        </span>
      </span>
    </motion.a>
  );
}

export function GlowButtonLink(props: GlowButtonProps) {
  return <GlowButton {...props} />;
}
