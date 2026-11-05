"use client";

import { motion } from "framer-motion";
import { INK, MUTED, SPRING } from "../theme";
import { ForecastRow } from "../ui";
import { TEN_DAY } from "../weather";

/** "Ten days, at a glance": the daily list. Rows slide in one after another each time the screen scrolls into view. */
export function TenDayScreen() {
  return (
    <div className="flex h-full flex-col px-5 pt-14" style={{ background: "#fff", color: INK }}>
      <div className="text-[13px] font-medium" style={{ color: MUTED }}>
        Amsterdam
      </div>
      <div className="mt-1 text-[24px] font-semibold tracking-[-0.02em]">10-day forecast</div>
      <div className="mt-4">
        {TEN_DAY.map((entry, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ ...SPRING, delay: index * 0.04 }}
          >
            <ForecastRow day={entry.day} icon={entry.icon} low={entry.low} high={entry.high} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
