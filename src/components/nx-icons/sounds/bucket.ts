import { ding, blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.65;

/** A watery slosh and a small metal clink of the handle at each extreme of the swing, the sloshes getting softer as the bucket settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.2), 350, 900, 0.03); // 0.00-0.20 the bucket swings out to the left on its handle
  blip(c, o, 240, t(0.2), 0.1, 0.16, 400); // 0.20 the water slops against the left wall
  ding(c, o, 1850, t(0.2), 0.035, 0.16); // 0.20 the handle clinks at the end of the swing
  swish(c, o, t(0.22), t(0.22), 900, 380, 0.03); // 0.22-0.45 the bucket swings back to the right
  blip(c, o, 205, t(0.45), 0.08, 0.15, 340); // 0.45 the water slops against the right wall
  ding(c, o, 1700, t(0.45), 0.025, 0.14); // 0.45 the handle clinks again, softer
  swish(c, o, t(0.47), t(0.2), 700, 350, 0.02); // 0.47-0.68 the swing eases
  blip(c, o, 175, t(0.68), 0.055, 0.12, 280); // 0.68 a smaller slosh on the left
  blip(c, o, 150, t(0.86), 0.035, 0.1, 230); // 0.86 the last ripple of water
  thud(c, o, t(1.0), 140, 0.05, 0.1); // 1.00 the bucket hangs still
}
