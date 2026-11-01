"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { BellIcon } from "@/components/nx-icons/icons/bell";
import { HeartIcon } from "@/components/nx-icons/icons/heart";
import { RocketIcon } from "@/components/nx-icons/icons/rocket";
import { TrophyIcon } from "@/components/nx-icons/icons/trophy";
import { CameraIcon } from "@/components/nx-icons/icons/camera";
import { CakeIcon } from "@/components/nx-icons/icons/cake";

const PEEK = [
  { Icon: BellIcon, accent: "#ff453a" },
  { Icon: RocketIcon, accent: "#ff9f0a" },
  { Icon: HeartIcon, accent: "#ff375f" },
  { Icon: TrophyIcon, accent: "#ffd60a" },
  { Icon: CameraIcon, accent: "#0a84ff" },
  { Icon: CakeIcon, accent: "#bf5af2" },
] as const;

/**
 * A few of the real animated icons, shown so an announcement can *show* the icons instead of describing them.
 * They take turns playing (once at a time), and stay still for reduced motion. Decorative: the text beside it says it all.
 */
export function IconPeek({
  count = 6,
  size = 22,
  className,
  tile,
}: {
  count?: number;
  size?: number;
  className?: string;
  /** Wrap each icon in this class (a tile); omit for bare icons. */
  tile?: string;
}) {
  const reduce = useReducedMotion();
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setTick((n) => n + 1), 1500);
    return () => window.clearInterval(t);
  }, [reduce]);
  const items = PEEK.slice(0, count);
  return (
    <span aria-hidden className={className} style={{ display: "inline-flex", alignItems: "center" }}>
      {items.map(({ Icon, accent }, i) => (
        <span key={i} className={tile} style={{ display: "inline-flex" }}>
          <Icon size={size} accent={accent} play={!reduce && tick % items.length === i} />
        </span>
      ))}
    </span>
  );
}
