import { blip, swish, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.4;

/** A projector clatter of six dry clacks with a low whirring hum, a rustle as the strip scrolls past, and a soft landing click with a single dull note as the next frame settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.04, 0.17, 0.3, 0.43, 0.56, 0.69].forEach((at, i) => {
    tick(c, o, t(at), 0.12, 3400 - i * 200);
    puff(c, o, t(at), 0.03, 1800, 0.04, "bandpass");
  });
  blip(c, o, N.G4, t(0.02), 0.03, 0.8, N.A4, "sawtooth");
  swish(c, o, t(0.05), t(0.7), 600, 1800, 0.02);
  thud(c, o, t(0.82), 140, 0.12, 0.08);
  blip(c, o, N.C5, t(0.84), 0.05, 0.2);
}
