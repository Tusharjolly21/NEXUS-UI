import { ding, blip, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 2.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.41;

/** A cup clinking onto its saucer, a few warm bubbles, and a soft hiss of steam. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  ding(c, o, N.G6, t(0), 0.06, 0.4);
  ding(c, o, N.C7, t(0), 0.04, 0.4);
  tick(c, o, t(0), 0.1, 3000);
  [0.25, 0.5, 0.78].forEach((at, i) => blip(c, o, 180 + i * 60, t(at), 0.07, 0.12, 360 + i * 80));
  puff(c, o, t(0.3), 1.6, 2800, 0.02, "highpass");
}
