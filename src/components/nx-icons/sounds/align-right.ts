import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.26;

/** Four soft rising blips stepping up the scale with a rightward sweep of air, finishing on a bright click at the margin. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.A4, N.D5, N.G5, N.B5].forEach((f, i) => {
    blip(c, o, f, t(0.04 + i * 0.1), 0.06, 0.12, f * 1.22, "triangle");
    swish(c, o, t(0.04 + i * 0.1), t(0.14), 1400, 3600, 0.02);
    tick(c, o, t(0.2 + i * 0.1), 0.05, 5200);
  });
  ding(c, o, N.D7, t(0.5), 0.04, 0.3);
}
