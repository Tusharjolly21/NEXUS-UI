import { swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.29;

/** Plastic tiles scraping as the dividers slide left, right and back again, with a dull knock and a small tick each time a divider stops. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.27), 350, 1100, 0.04); // 0.00-0.27 the dividers slide left
  thud(c, o, t(0.27), 170, 0.12, 0.08); // 0.27 they stop
  tick(c, o, t(0.27), 0.1, 2200); // 0.27 tile snaps into place
  swish(c, o, t(0.3), t(0.285), 1000, 350, 0.04); // 0.30-0.585 the dividers slide right
  thud(c, o, t(0.585), 130, 0.12, 0.08); // 0.585 they stop further right
  tick(c, o, t(0.585), 0.1, 1900); // 0.585 tile snaps
  swish(c, o, t(0.61), t(0.29), 900, 450, 0.03); // 0.61-0.90 they ease back to the middle
  thud(c, o, t(0.9), 150, 0.09, 0.08); // 0.90 they settle
  tick(c, o, t(0.9), 0.07, 2100); // 0.90 last snap
}
