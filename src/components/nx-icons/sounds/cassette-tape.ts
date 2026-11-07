import { blip, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A chunky deck button clunk, a low motor whirr with tape hiss, regular reel clicks, a wobbly lo-fi note that drifts flat and back, and a stop click. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.02), 110, 0.3, 0.1);
  tick(c, o, t(0.02), 0.14, 2200);
  blip(c, o, 58, t(0.08), 0.05, 0.9, 92, "sawtooth");
  puff(c, o, t(0.1), 0.85, 6500, 0.02, "bandpass");
  [0.2, 0.32, 0.44, 0.56, 0.68, 0.8].forEach((at) => tick(c, o, t(at), 0.05, 2800));
  blip(c, o, 311.13, t(0.3), 0.045, 0.7, 293.66, "triangle");
  blip(c, o, 293.66, t(0.65), 0.03, 0.3, 311.13, "triangle");
  tick(c, o, t(1.0), 0.12, 1800);
  thud(c, o, t(1.0), 90, 0.22, 0.09);
}
