import { blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.2;

/** A short record-stop beep, a low square-wave blip falling away and a soft thud as the body folds, then a faint high tick as the red slash lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.E6, t(0.02), 0.06, 0.07, undefined, "square");
  blip(c, o, N.C6, t(0.12), 0.06, 0.07, undefined, "square");
  swish(c, o, t(0.1), t(0.35), 2600, 500, 0.035);
  blip(c, o, 420, t(0.24), 0.07, 0.22, 110, "triangle");
  thud(c, o, t(0.46), 90, 0.18, 0.12);
  tick(c, o, t(0.5), 0.06, 4600);
}
