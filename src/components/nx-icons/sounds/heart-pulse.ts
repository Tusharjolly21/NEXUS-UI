import { blip, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.84;

/** A double heartbeat, lub-dub, twice, with a monitor beep as the line draws across. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.12, 0.3], [0.5, 0.66]].forEach(([a, b]) => { thud(c, o, t(a), 70, 0.2, 0.14); thud(c, o, t(b), 85, 0.15, 0.12); });
  blip(c, o, N.A6, t(0.15), 0.04, 0.12);
  blip(c, o, N.A6, t(0.55), 0.04, 0.12);
}
