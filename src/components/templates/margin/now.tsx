"use client";

import { motion } from "framer-motion";
import { useLocalTime } from "./clock";
import { NOW_ITEMS, PROFILE } from "./data";
import { Icon } from "./icons";
import { SPRING } from "./ui";

/** Small cards for what is being built, learned and read, plus a card with the live local time. */
export function NowGrid() {
  const time = useLocalTime(PROFILE.timeZone);
  const items = [
    ...NOW_ITEMS,
    {
      icon: "ph:map-pin" as const,
      label: "Based in",
      text: time ? `${PROFILE.city}, where it's ${time}` : PROFILE.city,
    },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          className="margin-pill flex items-start gap-3 rounded-[14px] p-4"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ ...SPRING, delay: index * 0.05 }}
        >
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px]"
            style={{ background: "var(--chip)", color: "var(--fg2)" }}
          >
            <Icon name={item.icon} size={16} />
          </span>
          <span className="min-w-0">
            <span className="block text-[12px] font-medium" style={{ color: "var(--faint)" }}>
              {item.label}
            </span>
            <span className="block text-[14px] font-medium leading-5" style={{ color: "var(--fg)" }}>
              {item.text}
            </span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}
