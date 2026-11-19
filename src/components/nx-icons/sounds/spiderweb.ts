import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.72;

/** A falling silky zip as the spider drops on its thread, a springy boing as the thread catches, a smaller one as it bounces, then tiny quick taps as it climbs back up. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 1600, t(0.0), 0.04, 0.36, 500); // 0.00-0.35 the spider drops, the silk zipping out
  swish(c, o, t(0.0), t(0.35), 4200, 2200, 0.015); // 0.00-0.35 the thread pays out
  blip(c, o, 230, t(0.35), 0.08, 0.14, 380, "triangle"); // 0.35 the thread catches: a springy boing
  blip(c, o, 260, t(0.62), 0.05, 0.1, 360, "triangle"); // 0.62 the smaller second bounce
  [0.68, 0.74, 0.8, 0.86, 0.92, 0.98].forEach((at, i) => tick(c, o, t(at), 0.03, 7000 - i * 300)); // 0.68-0.98 tiny steps as it climbs back to the hub
}
