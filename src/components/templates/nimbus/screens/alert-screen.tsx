"use client";

import { motion } from "framer-motion";
import { AppIcon } from "../app-icon";
import { LiveSky } from "../sky/live-sky";
import { SkyBackdrop } from "../sky/sky-backdrop";
import { INK, MUTED, SPRING } from "../theme";

/** "Alerts before it hits": a lock screen in a thunderstorm, with rain on the glass and a notification that rises in. */
export function AlertScreen() {
  return (
    <div className="relative h-full overflow-hidden text-white">
      <SkyBackdrop condition="storm" />
      <LiveSky mode="storm" density={0.3} glass />
      <div className="relative flex h-full flex-col items-center px-4 pt-20">
        <div className="text-[15px] font-medium opacity-90">Thursday, 6 November</div>
        <div className="text-[84px] font-semibold leading-none tracking-[-0.04em]">16:41</div>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ ...SPRING, delay: 0.25 }}
          className="mb-16 mt-auto w-full rounded-[22px] p-3.5 text-left"
          style={{ background: "rgba(245,245,247,.82)", color: INK, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
        >
          <div className="flex items-center gap-2 text-[12.5px]" style={{ color: MUTED }}>
            <AppIcon size={20} />
            NIMBUS
            <span className="ml-auto">now</span>
          </div>
          <div className="mt-1.5 text-[15px] font-semibold">Thunderstorm in 25 minutes</div>
          <div className="text-[14px] leading-[1.35]" style={{ color: "#3a3a3c" }}>
            Heavy rain and lightning near you until about 18:00. Bring the bikes in.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
