"use client";

import { motion } from "framer-motion";
import { Icon, type IconName } from "../icons";
import { FAINT, INK, MUTED, SPRING, SURFACE } from "../theme";

/** 60 one-minute rain readings: dry for 12 minutes, then a shower that swells and fades. Values are 0..1. */
const RAIN_BY_MINUTE = Array.from({ length: 60 }, (_, minute) =>
  minute < 12 ? 0 : Math.max(0, Math.sin(((minute - 12) / 48) * Math.PI) * (0.75 + 0.25 * Math.sin(minute * 1.3))),
);

const STATS: [IconName, string, string][] = [
  ["drop", "Rainfall", "2.4 mm"],
  ["wind", "Wind", "18 km/h"],
];

/** "Rain, to the minute": the next-hour chart. Bars grow in each time the screen scrolls into view. */
export function RainScreen() {
  return (
    <div className="flex h-full flex-col px-5 pt-14" style={{ background: "#fff", color: INK }}>
      <div className="text-[13px] font-medium" style={{ color: MUTED }}>
        Next hour
      </div>
      <div className="mt-1 text-[24px] font-semibold leading-[1.15] tracking-[-0.02em]">Rain starting in 12 min, stopping 11 min later.</div>
      <div className="mt-8 flex h-[150px] items-end gap-[2px]">
        {RAIN_BY_MINUTE.map((level, minute) => (
          <motion.span
            key={minute}
            className="flex-1 rounded-t-[2px]"
            initial={{ height: 0 }}
            whileInView={{ height: `${4 + level * 96}%` }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ ...SPRING, delay: minute * 0.008 }}
            style={{ background: level > 0.05 ? "linear-gradient(180deg,#0a84ff,#5ac8fa)" : "#e5e5ea" }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px]" style={{ color: FAINT }}>
        {["Now", "10", "20", "30", "40", "50", "60 min"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {STATS.map(([icon, label, value]) => (
          <div key={label} className="rounded-[14px] p-3" style={{ background: SURFACE }}>
            <Icon name={icon} size={16} style={{ color: MUTED }} />
            <div className="mt-2 text-[12px]" style={{ color: MUTED }}>
              {label}
            </div>
            <div className="text-[18px] font-semibold">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
