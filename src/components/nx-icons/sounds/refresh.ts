import { blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.46;

/** A ratchet of tiny ticks as the arrows turn, slowing down, and a soft clunk as they lock into place. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.02, 0.09, 0.18, 0.3, 0.46, 0.66].forEach((at, i) => tick(c, o, t(at), 0.07 + i * 0.01, 3600 - i * 250));
  swish(c, o, t(0.02), t(0.6), 900, 2000, 0.03);
  thud(c, o, t(0.82), 190, 0.1, 0.07);
  blip(c, o, N.G6, t(0.82), 0.05, 0.1);
}
