import { blip, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A rubbery boing as the cap stretches, squashes and rebounds, with a round bubble pop each time one of the three spots pulses. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 170, t(0.02), 0.09, 0.16, 310); // 0.02-0.15 the cap stretches up
  blip(c, o, 310, t(0.16), 0.07, 0.14, 150); // 0.15-0.30 the cap squashes down
  blip(c, o, 190, t(0.31), 0.05, 0.12, 270); // 0.30-0.45 the cap rebounds
  blip(c, o, 520, t(0.33), 0.065, 0.09, 1100); // 0.325 first spot at its biggest
  blip(c, o, 640, t(0.47), 0.06, 0.09, 1300); // 0.475 second spot at its biggest
  blip(c, o, 780, t(0.62), 0.055, 0.1, 1500); // 0.625 third spot at its biggest
}
