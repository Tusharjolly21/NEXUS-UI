"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "./avatar";
import { useLocalTime } from "./clock";
import { LINKS, PROFILE } from "./data";
import { Icon } from "./icons";
import { DISPLAY_FONT, IconButton, SPRING } from "./ui";

type ThemeToggleProps = { dark: boolean; onToggle: React.MouseEventHandler<HTMLButtonElement> };

/** Sun and moon swap with a small rotation as the theme changes. */
function ThemeToggle({ dark, onToggle }: ThemeToggleProps) {
  return (
    <IconButton label={dark ? "Light mode" : "Dark mode"} onClick={onToggle}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={dark ? "sun" : "moon"}
          className="grid place-items-center"
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={SPRING}
        >
          <Icon name={dark ? "ph:sun" : "ph:moon"} size={15} />
        </motion.span>
      </AnimatePresence>
    </IconButton>
  );
}

/** Avatar overlapping the banner, name, one-line role, local time, social buttons and the theme toggle. */
export function Header({ dark, onToggleTheme }: { dark: boolean; onToggleTheme: ThemeToggleProps["onToggle"] }) {
  const time = useLocalTime(PROFILE.timeZone);

  return (
    <div className="px-6 sm:px-8">
      <div className="relative -mt-11 w-fit rounded-full p-1" style={{ background: "var(--col)" }}>
        <Avatar />
        <span
          role="img"
          aria-label="Taking on projects"
          title="Taking on projects"
          className="absolute bottom-2 right-2 grid h-4 w-4 place-items-center rounded-full"
          style={{ background: "var(--col)" }}
        >
          <span className="margin-pulse absolute h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4 pb-6">
        <div>
          <h1
            className="m-0 text-[32px] font-medium leading-10 tracking-[0.01em] sm:text-[36px]"
            style={{ fontFamily: DISPLAY_FONT, color: "var(--fg)" }}
          >
            {PROFILE.name}
          </h1>
          <p className="m-0 mt-0.5 text-[14px]" style={{ color: "var(--dim)" }}>
            {PROFILE.role} • Founder of {PROFILE.company} •{" "}
            <span className="whitespace-nowrap tabular-nums">
              {PROFILE.city} {time}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {LINKS.map((link) => (
            <IconButton key={link.label} label={link.label} href={link.href}>
              <Icon name={link.icon} size={15} />
            </IconButton>
          ))}
          <ThemeToggle dark={dark} onToggle={onToggleTheme} />
        </div>
      </div>
    </div>
  );
}
