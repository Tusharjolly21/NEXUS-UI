"use client";

import * as React from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BellIcon } from "./icons/bell";
import { HeartIcon } from "./icons/heart";
import { RocketIcon } from "./icons/rocket";
import { PlayPauseIcon } from "./icons/play-pause";
import { TrophyIcon } from "./icons/trophy";
import { CameraIcon } from "./icons/camera";
import { CakeIcon } from "./icons/cake";
import { GamepadIcon } from "./icons/gamepad";
import { KeyIcon } from "./icons/key";
import { WalletIcon } from "./icons/wallet";
import { PizzaIcon } from "./icons/pizza";
import { LightbulbIcon } from "./icons/lightbulb";

const ITEMS = [
  { slug: "bell", title: "Bell", Icon: BellIcon, accent: "#ff3b30" },
  { slug: "heart", title: "Heart", Icon: HeartIcon, accent: "#ff375f" },
  { slug: "rocket", title: "Rocket", Icon: RocketIcon, accent: "#ff9f0a" },
  { slug: "play-pause", title: "Play pause", Icon: PlayPauseIcon, accent: "#ff375f" },
  { slug: "trophy", title: "Trophy", Icon: TrophyIcon, accent: "#ff9f0a" },
  { slug: "camera", title: "Camera", Icon: CameraIcon, accent: "#0a84ff" },
  { slug: "cake", title: "Cake", Icon: CakeIcon, accent: "#ff375f" },
  { slug: "gamepad", title: "Gamepad", Icon: GamepadIcon, accent: "#bf5af2" },
  { slug: "key", title: "Key", Icon: KeyIcon, accent: "#ff9f0a" },
  { slug: "wallet", title: "Wallet", Icon: WalletIcon, accent: "#30d158" },
  { slug: "pizza", title: "Pizza", Icon: PizzaIcon, accent: "#ff9f0a" },
  { slug: "lightbulb", title: "Lightbulb", Icon: LightbulbIcon, accent: "#ffd60a" },
] as const;

/**
 * A short wall of animated icons for the home page. Only these twelve files are loaded (not the whole set),
 * each plays under the pointer or keyboard focus, and one plays by itself every moment so the wall is
 * never still. Each tile links to that icon's page.
 */
export function HomeIconStrip({ count = 12, className }: { count?: number; className?: string }) {
  const reduce = useReducedMotion();
  const [hot, setHot] = React.useState<string | null>(null);
  const [auto, setAuto] = React.useState(0);
  const items = ITEMS.slice(0, count);

  React.useEffect(() => {
    if (reduce || hot) return;
    const t = setInterval(() => setAuto((n) => (n + 1) % items.length), 1300);
    return () => clearInterval(t);
  }, [reduce, hot, items.length]);

  return (
    <ul className={cn("grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6", className)}>
      {items.map(({ slug, title, Icon, accent }, i) => {
        const on = hot ? hot === slug : !reduce && auto === i;
        return (
          <li key={slug}>
            <Link
              href={`/icons/${slug}`}
              onPointerEnter={() => setHot(slug)}
              onPointerLeave={() => setHot(null)}
              onFocus={() => setHot(slug)}
              onBlur={() => setHot(null)}
              className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-[22px] bg-card text-foreground shadow-[0_0_0_1px_rgba(0,0,0,.05)] outline-none transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
            >
              <Icon size={40} accent={accent} play={on} />
              <span className="text-[13px] font-medium text-muted-foreground transition-colors group-hover:text-foreground">{title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
