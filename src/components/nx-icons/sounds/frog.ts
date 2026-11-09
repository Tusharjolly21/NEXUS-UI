import { blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A squeak as it crouches, a rubbery boing as it springs, a wet plop as it lands, then two croaks that match the throat puffing out twice. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 190, t(0.03), 0.04, 0.1, 130); // 0.03-0.13 the crouch squeaks
  blip(c, o, 180, t(0.14), 0.1, 0.24, 560); // 0.14-0.38 the legs spring and the frog launches
  swish(c, o, t(0.2), t(0.18), 900, 2400, 0.04); // 0.20-0.38 air rushes past on the way up
  thud(c, o, t(0.55), 115, 0.14, 0.1); // 0.55 the frog lands
  blip(c, o, 520, t(0.55), 0.06, 0.07, 240); // 0.55 wet plop
  blip(c, o, 150, t(0.655), 0.08, 0.14, 92, "sawtooth"); // 0.66 first croak as the throat puffs out
  blip(c, o, 300, t(0.655), 0.02, 0.12, 190, "triangle"); // 0.66 its brighter layer
  blip(c, o, 140, t(0.88), 0.07, 0.14, 88, "sawtooth"); // 0.89 second croak as the throat puffs out again
  blip(c, o, 280, t(0.88), 0.018, 0.12, 180, "triangle"); // 0.89 its brighter layer
}
