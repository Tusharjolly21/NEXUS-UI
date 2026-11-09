import { ding, blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A dry rustle as the bone starts to wobble, four wooden knocks that fade as it turns round at each end of its swing, and a glassy glint as the sparkle opens. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.18), 1100, 600, 0.02); // 0.00-0.18 the bone starts to swing
  [[0.2, 0.13], [0.4, 0.1], [0.6, 0.07], [0.8, 0.04]].forEach(([at, g]) => { blip(c, o, 720, t(at), g, 0.05, 360, "triangle"); tick(c, o, t(at), g * 0.6, 3800); }); // 0.20 0.40 0.60 0.80 the swing turns round
  ding(c, o, 3900, t(0.3), 0.035, 0.3); // 0.30 the sparkle opens
  ding(c, o, 5200, t(0.48), 0.02, 0.22); // 0.48 the sparkle is at its biggest
}
