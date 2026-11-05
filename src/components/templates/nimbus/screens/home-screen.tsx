"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../icons";
import { LiveSky } from "../sky/live-sky";
import { SkyBackdrop } from "../sky/sky-backdrop";
import { ForecastRow } from "../ui";
import { glassIconColor, HOURLY, TEN_DAY, WEATHER, type Condition } from "../weather";

const PANEL_STYLE = {
  background: "rgba(255,255,255,.16)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  boxShadow: "inset 0 0 0 .5px rgba(255,255,255,.25)",
} as const;

/**
 * The phone's main screen: the live sky for `condition`, the city, the temperature, an hourly strip and the
 * first days of the forecast. Reused in the hero (switchable) and in the stage of phones below it (night).
 */
export function HomeScreen({ condition }: { condition: Condition }) {
  const weather = WEATHER[condition];
  return (
    <div className="relative h-full overflow-hidden text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,.12)" }}>
      <SkyBackdrop condition={condition} />
      <LiveSky mode={condition} density={0.35} />
      <div className="relative flex h-full flex-col px-5 pt-14">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[13px] font-medium opacity-90">
            <Icon name="navigation-arrow-fill" size={10} />
            My Location
          </div>
          <div className="text-[26px] font-normal tracking-[-0.01em]">Amsterdam</div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={condition}
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-[80px] font-extralight leading-[0.95] tracking-[-0.04em]">{weather.temp}°</div>
              <div className="mt-1 text-[16px] font-medium">{weather.summary}</div>
              <div className="text-[15px] font-medium opacity-90">
                H:{weather.high}° &nbsp;L:{weather.low}°
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 rounded-[16px] p-3" style={PANEL_STYLE}>
          <div className="border-b pb-2 text-[12px] font-medium opacity-90" style={{ borderColor: "rgba(255,255,255,.2)" }}>
            Conditions change around 16:00.
          </div>
          <div className="mt-2 grid grid-cols-6 text-center font-medium tracking-[-0.02em]" style={{ fontSize: "clamp(10px, 4.5cqw, 12.5px)" }}>
            {HOURLY[condition].map((hour) => (
              <div key={hour.time} className="flex flex-col items-center gap-1.5">
                <span>{hour.time}</span>
                <Icon name={hour.icon} size={19} style={{ color: glassIconColor(hour.icon) }} />
                <span>{hour.temp}°</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-[16px] p-3" style={PANEL_STYLE}>
          <div className="text-[12px] font-medium opacity-80">10-day forecast</div>
          {TEN_DAY.slice(0, 3).map((entry) => (
            <ForecastRow key={entry.day} day={entry.day} icon={entry.icon} low={entry.low} high={entry.high} glass />
          ))}
        </div>
      </div>
    </div>
  );
}
