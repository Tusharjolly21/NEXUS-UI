"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** A surface whose border and inner light follow the pointer (see `.cx-glow`). */
export function Glow({
  as: Tag = "div",
  className,
  children,
}: {
  as?: "div" | "article" | "li";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      onPointerMove={(e: React.PointerEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--gx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--gy", `${e.clientY - r.top}px`);
      }}
      onPointerEnter={(e: React.PointerEvent<HTMLElement>) => e.currentTarget.style.setProperty("--go", "1")}
      onPointerLeave={(e: React.PointerEvent<HTMLElement>) => e.currentTarget.style.setProperty("--go", "0")}
      className={cn("cx-glow", className)}
    >
      {children}
    </Tag>
  );
}
