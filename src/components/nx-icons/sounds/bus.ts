import { blip, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.52;

/** An idling engine rumble with bumps in the road, and two honks of the horn. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 80, t(0.02), 0.06, 0.65, 100, "sawtooth");
  puff(c, o, t(0.02), 0.6, 300, 0.05, "lowpass");
  [0.12, 0.38].forEach((at) => { blip(c, o, 392, t(at), 0.06, 0.12, undefined, "square"); blip(c, o, 330, t(at), 0.05, 0.12, undefined, "square"); });
  [0.18, 0.5].forEach((at) => thud(c, o, t(at), 90, 0.1, 0.06));
}
