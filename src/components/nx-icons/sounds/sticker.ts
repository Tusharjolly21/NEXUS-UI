import { thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.64;

/** A sticky crackling peel as the corner lifts, a short pause, and a flat slap as the sticker lets go and smacks down, with a tiny flutter of the edge. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.0, 0.05, 0.1, 0.15, 0.2, 0.25].forEach((at, i) => puff(c, o, t(at), 0.05, 2600 + i * 350, 0.03)); // 0.00-0.32 the adhesive crackles as the corner peels
  puff(c, o, t(0.666), 0.06, 1100, 0.08, "lowpass"); // 0.67 the sticker slaps flat
  thud(c, o, t(0.666), 165, 0.08, 0.06); // 0.67 the slap has a little weight
  puff(c, o, t(0.792), 0.03, 3300, 0.025); // 0.79 the edge flutters once
}
