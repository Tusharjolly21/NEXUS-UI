import { blip, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.61;

/** Two soft marimba nods stepping down in pitch, one after the other, each with a tiny breath of air for its trail. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.E6, t(0.05), 0.07, 0.15, N.C6, "triangle");
  puff(c, o, t(0.07), 0.2, 6000, 0.012, "highpass");
  blip(c, o, N.A5, t(0.17), 0.07, 0.17, N.E5, "triangle");
  puff(c, o, t(0.19), 0.2, 5000, 0.012, "highpass");
}
