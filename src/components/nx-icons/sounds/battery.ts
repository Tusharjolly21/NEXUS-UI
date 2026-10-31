import { ding, blip, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.1;

/** A charging whine that climbs as each bar fills with a rising note, then a bright full-charge chime. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 150, t(0), 0.03, 1.1, 1200, "sawtooth");
  [N.C5, N.E5, N.G5].forEach((f, i) => blip(c, o, f, t(0.33 + i * 0.35), 0.09, 0.14));
  ding(c, o, N.C6, t(1.12), 0.09, 0.6);
  ding(c, o, N.G6, t(1.2), 0.07, 0.7);
}
