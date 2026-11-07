import { plink, blip, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Four dry rubbing strokes with a faint rubber squeak on each turn, then a handful of tiny ticks as the shavings scatter, ending on one small soft pluck. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.04, 0.2, 0.36, 0.52].forEach((at, i) => {
    puff(c, o, t(at), 0.13, 2200 + i * 400, 0.05, "bandpass");
    blip(c, o, 1800 + i * 150, t(at + 0.09), 0.018, 0.05, 1500, "triangle");
  });
  [0.34, 0.45, 0.55, 0.64].forEach((at, i) => tick(c, o, t(at), 0.07, 5200 + i * 600));
  plink(c, o, N.C6, t(0.78), 0.06, 0.16);
  plink(c, o, N.A4, t(0.84), 0.05, 0.14);
  plink(c, o, N.E4, t(0.9), 0.05, 0.14);
}
