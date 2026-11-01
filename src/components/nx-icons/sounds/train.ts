import { blip, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.21;

/** A low rail rumble with rhythmic clacks, two brassy horn toots as it arrives, and a high squeal of brakes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.4, 200, 0.07, "lowpass");
  [0.04, 0.12, 0.2, 0.28].forEach((at) => thud(c, o, t(at), 90, 0.07, 0.07));
  [0.3, 0.5].forEach((at) => { blip(c, o, 330, t(at), 0.045, 0.14, undefined, "sawtooth"); blip(c, o, 392, t(at), 0.04, 0.14, undefined, "sawtooth"); });
  blip(c, o, 3200, t(0.68), 0.02, 0.28, 1900, "triangle");
  tick(c, o, t(0.98), 0.08, 2600);
}
