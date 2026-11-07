import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.02;

/** A quick fizz as the rays vanish, a firm switch click as the button bottoms out, a buzzing bulb hum that rises as the beam bursts out, a flicker dip, and a small release click. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.1), 3200, 900, 0.03); // 0.02-0.12 the rays fade away
  thud(c, o, t(0.2), 240, 0.08, 0.05); // 0.20 the button bottoms out
  tick(c, o, t(0.2), 0.12, 2200); // 0.20 the switch clicks
  blip(c, o, 100, t(0.3), 0.06, 0.34, 190, "sawtooth"); // 0.30-0.64 the bulb catches and hums
  swish(c, o, t(0.3), t(0.3), 500, 3200, 0.035); // 0.30-0.60 the beam bursts out, fastest at 0.36
  tick(c, o, t(0.42), 0.07, 3800); // 0.42 the bulb is lit again
  puff(c, o, t(0.5), 0.07, 5200, 0.04, "highpass"); // 0.50-0.57 flicker, the light dips
  blip(c, o, 1400, t(0.52), 0.018, 0.05, 900, "square"); // 0.52 the buzz of the dip
  tick(c, o, t(0.4), 0.07, 3000); // 0.40 the button springs back up
  tick(c, o, t(0.62), 0.05, 4400); // 0.62 the beam steadies
}
