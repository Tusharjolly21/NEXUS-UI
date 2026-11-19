import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.99;

/** A small motor whirr while the arrows sweep round and the body turns, a mechanical clack when the arrows overshoot and stop, and a light click as the view settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 140, t(0.0), 0.04, 0.47, 410, "sawtooth"); // 0.00-0.47 the lens motor spins the arrows round
  swish(c, o, t(0.0), t(0.46), 1200, 3600, 0.025); // 0.00-0.47 the camera body turns to the other side
  tick(c, o, t(0.4675), 0.1, 2600); // 0.47 the arrows overshoot and stop
  thud(c, o, t(0.47), 240, 0.05, 0.05); // 0.47 the mechanism clacks
  tick(c, o, t(0.68), 0.06, 4600); // 0.68 the arrows ease back and click
}
