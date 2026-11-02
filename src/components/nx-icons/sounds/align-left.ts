import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.11;

/** Four soft sliding blips stepping down the scale, each with a short leftward sweep of air and a tiny click as the line lands on the margin. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.E6, N.D6, N.A5, N.E5].forEach((f, i) => {
    blip(c, o, f, t(0.04 + i * 0.1), 0.06, 0.12, f * 0.82, "triangle");
    swish(c, o, t(0.04 + i * 0.1), t(0.14), 3600, 1400, 0.02);
    tick(c, o, t(0.2 + i * 0.1), 0.05, 4200);
  });
  ding(c, o, N.A4, t(0.5), 0.05, 0.3);
}
