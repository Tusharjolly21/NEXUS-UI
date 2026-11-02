import { blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.8;

/** A speaker thump, two waves of sound dropping away in pitch, and a short dull knock as the cross is drawn. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.03), 100, 0.28, 0.14);
  blip(c, o, N.B5, t(0.08), 0.05, 0.1, N.E5, "triangle");
  blip(c, o, N.G6, t(0.14), 0.04, 0.1, N.C6, "triangle");
  swish(c, o, t(0.1), t(0.3), 3000, 400, 0.03);
  tick(c, o, t(0.38), 0.09, 2200);
  tick(c, o, t(0.46), 0.08, 1700);
  thud(c, o, t(0.5), 70, 0.15, 0.1);
}
