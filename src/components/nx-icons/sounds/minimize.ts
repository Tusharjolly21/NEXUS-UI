import { blip, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.7;

/** Four quick clicks as each corner snaps in, then a low hollow pop as the middle pinches shut. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.06, 0.1, 0.14, 0.18].forEach((at, i) => tick(c, o, t(at), 0.1, 3800 - i * 350));
  blip(c, o, N.G5, t(0.26), 0.09, 0.14, N.C5);
  puff(c, o, t(0.3), 0.12, 900, 0.03, "lowpass");
  tick(c, o, t(0.5), 0.07, 2600);
}
