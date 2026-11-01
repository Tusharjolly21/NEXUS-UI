import { ding, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.03;

/** A ratcheting turn of clicks, a firm clunk when the bolt is tight, and a release click. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.04, 0.1, 0.16, 0.22, 0.28].forEach((at, i) => { tick(c, o, t(at), 0.1, 3000 - i * 200); thud(c, o, t(at), 200, 0.04, 0.02); });
  thud(c, o, t(0.34), 100, 0.22, 0.1);
  ding(c, o, N.A6, t(0.34), 0.04, 0.3);
  [0.6, 0.7, 0.78].forEach((at) => tick(c, o, t(at), 0.08, 2600));
}
