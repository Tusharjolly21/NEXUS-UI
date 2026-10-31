import { blip, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 2.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.65;

/** A two-tone horn, then a diesel chug with the cab rattling and air rushing by. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 349, t(0), 0.05, 0.22, undefined, "sawtooth");
  blip(c, o, 440, t(0), 0.04, 0.22, undefined, "sawtooth");
  [0, 0.4, 0.8, 1.2, 1.6].forEach((at) => thud(c, o, t(at + 0.02), 75, 0.16, 0.14));
  [0.2, 0.6, 1.0, 1.4, 1.8].forEach((at) => tick(c, o, t(at), 0.04, 1500));
  puff(c, o, t(0.1), 1.9, 300, 0.02, "lowpass");
}
