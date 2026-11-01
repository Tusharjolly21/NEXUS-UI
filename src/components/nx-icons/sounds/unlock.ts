import { ding, blip, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.62;

/** A heavy thunk as the shackle snaps shut, a pair of lock-mechanism clicks, and a springy boing and ding as it pops open. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.28), 85, 0.2, 0.12);
  tick(c, o, t(0.28), 0.14, 2200);
  tick(c, o, t(0.42), 0.09, 3400);
  tick(c, o, t(0.48), 0.08, 3000);
  blip(c, o, 240, t(0.55), 0.07, 0.15, 800, "sawtooth");
  ding(c, o, N.E6, t(0.62), 0.08, 0.5);
}
