import { ding, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.26;

/** A rising whistle as the mercury climbs, tiny ticks at each mark, and a bright ding at the top. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 350, t(0.04), 0.07, 0.5, 1700);
  [0.14, 0.26, 0.38].forEach((at, i) => tick(c, o, t(at), 0.07, 3600 + i * 500));
  ding(c, o, N.C7, t(0.5), 0.09, 0.5);
  blip(c, o, N.E6, t(0.7), 0.04, 0.12);
}
