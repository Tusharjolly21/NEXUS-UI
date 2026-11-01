import { ding, blip, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.25;

/** A jet spooling up and roaring away, fading into the distance, then a soft whoosh as it glides back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.4), 400, 3400, 0.07);
  puff(c, o, t(0.0), 0.5, 700, 0.06, "lowpass");
  blip(c, o, 120, t(0.02), 0.04, 0.45, 260, "sawtooth");
  swish(c, o, t(0.45), t(0.4), 2600, 700, 0.03);
  ding(c, o, N.G6, t(0.86), 0.06, 0.4);
}
