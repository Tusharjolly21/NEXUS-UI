import { ding, blip, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.14;

/** Three rising notes as it bounces up, a clink on landing, and two high sparkles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.C6, N.E6, N.G6].forEach((f, i) => blip(c, o, f, t(0.04 + i * 0.1), 0.07, 0.14));
  ding(c, o, N.C7, t(0.5), 0.09, 0.6);
  thud(c, o, t(0.5), 150, 0.08, 0.06);
  [0.62, 0.76].forEach((at, i) => ding(c, o, i ? N.E7 : N.G7, t(at), 0.04, 0.3));
}
