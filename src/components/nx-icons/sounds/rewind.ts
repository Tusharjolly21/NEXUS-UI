import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.39;

/** A falling tape whirr with a stepping run of five soft descending notes as the triangles scroll back, three reel ticks, and a low thump and two small bells as the tape stops. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.6), 3600, 600, 0.055);
  [N.B5, N.A5, N.G5, N.E5, N.D5].forEach((f, i) => blip(c, o, f, t(0.05 + i * 0.12), 0.04, 0.08, f * 0.82, "triangle"));
  tick(c, o, t(0.12), 0.08, 4200);
  tick(c, o, t(0.34), 0.08, 3600);
  tick(c, o, t(0.56), 0.07, 3200);
  thud(c, o, t(0.74), 130, 0.16, 0.1);
  ding(c, o, N.G6, t(0.78), 0.045, 0.3);
  ding(c, o, N.C6, t(0.86), 0.035, 0.3);
}
