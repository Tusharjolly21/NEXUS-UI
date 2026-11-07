import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.46;

/** A small hinge creak as the clapper lifts, then a sharp wooden clack with a crack and a short knock as it slams shut, and a faint soft rub as the clapper settles back open. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.1-0.3 the clapper lifts
  swish(c, o, t(0.1), t(0.2), 600, 1400, 0.04);
  blip(c, o, 420, t(0.1), 0.04, 0.2, 640, "sawtooth");
  // 0.385 the clapper hits the board
  thud(c, o, t(0.385), 240, 0.34, 0.07);
  tick(c, o, t(0.385), 0.26, 4200);
  puff(c, o, t(0.385), 0.05, 2200, 0.28, "bandpass");
  blip(c, o, 880, t(0.385), 0.08, 0.05, 420, "square");
  blip(c, o, 310, t(0.39), 0.06, 0.12);
  // 0.5-0.76 it eases back up to rest
  swish(c, o, t(0.5), t(0.26), 500, 900, 0.025);
}
