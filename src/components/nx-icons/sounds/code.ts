import { ding, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.21;

/** Keyboard clacks as the brackets spread, a pen-stroke whoosh as the slash writes in, and a ding when it compiles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.02, 0.1, 0.18].forEach((at, i) => { tick(c, o, t(at), 0.12, 2400 + i * 400); thud(c, o, t(at), 260, 0.04, 0.03); });
  swish(c, o, t(0.15), t(0.3), 700, 3200, 0.045);
  tick(c, o, t(0.52), 0.12, 2800);
  ding(c, o, N.G6, t(0.55), 0.08, 0.45);
  ding(c, o, N.D7, t(0.62), 0.05, 0.4);
}
