import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.58;

/** A buzzing motor hum with a rush of air that streams out in three waves and eases off as the last stream settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 185, t(0.0), 0.03, 0.9, 170, "sawtooth"); // 0.00-0.90 the motor hums
  swish(c, o, t(0.0), t(0.32), 1800, 3600, 0.05); // 0.00-0.32 the first stream blows out
  swish(c, o, t(0.1), t(0.32), 2000, 3800, 0.045); // 0.10-0.42 the second stream blows out
  swish(c, o, t(0.2), t(0.32), 2200, 4000, 0.04); // 0.20-0.52 the third stream blows out
  swish(c, o, t(0.5), t(0.4), 3000, 1500, 0.03); // 0.50-0.90 the air eases as the streams return
}
