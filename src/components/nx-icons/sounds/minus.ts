import { blip, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.17;

/** A dull low zip as the bar parts, a small bubbly pop for the dot between, and a firm click as the halves rejoin. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.08, 2600);
  blip(c, o, 140, t(0.06), 0.06, 0.2, 90, "triangle");
  blip(c, o, N.A6, t(0.24), 0.05, 0.08, 2600);
  tick(c, o, t(0.58), 0.14, 3200);
  thud(c, o, t(0.58), 210, 0.06, 0.04);
}
