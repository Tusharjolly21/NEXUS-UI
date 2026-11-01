import { blip, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.9;

/** A stretching elastic groan as the arrow pulls back, then a twang as it snaps home against the stop. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 520, t(0.02), 0.05, 0.3, 240, "triangle");
  tick(c, o, t(0.3), 0.1, 3000);
  blip(c, o, 200, t(0.32), 0.06, 0.12, 900, "sawtooth");
  thud(c, o, t(0.6), 120, 0.14, 0.07);
  tick(c, o, t(0.6), 0.12, 2400);
}
