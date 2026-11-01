import { blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.85;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.58;

/** Fast scuttling clicks of tiny legs in alternating rhythm, with a faint buzzing wing at the end. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.04, 0.09, 0.14, 0.2, 0.26, 0.31, 0.37, 0.43].forEach((at, i) => { tick(c, o, t(at), 0.07 + (i % 2) * 0.03, 4600 + (i % 3) * 500); blip(c, o, 1400 + (i % 2) * 300, t(at), 0.015, 0.03); });
  blip(c, o, 180, t(0.5), 0.04, 0.25, 220, "sawtooth");
}
