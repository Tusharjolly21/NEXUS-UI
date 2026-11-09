import { ding, blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.95;

/** A smooth brass slide as the tube pans up, a small lock click when it stops, a three note starlight shimmer as the sparkle blooms, twinkles and fades, then a slide back down and a last click as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), 0.32, 420, 1300, 0.05); // 0.0 to 0.32 the tube pans up on its mount, fastest at 0.16
  tick(c, o, t(0.325), 0.11, 3000); // 0.32 the pan stops at its highest point
  ding(c, o, 3951, t(0.33), 0.05, 0.45); // 0.3 the sparkle starts to grow
  ding(c, o, 5274, t(0.44), 0.045, 0.5); // 0.45 the sparkle reaches its biggest
  ding(c, o, 6272, t(0.72), 0.03, 0.35); // 0.72 the sparkle twinkles larger for the last time
  blip(c, o, 2600, t(0.8), 0.03, 0.14, 1500); // 0.85 the sparkle shrinks away
  swish(c, o, t(0.72), 0.28, 1300, 420, 0.045); // 0.72 to 1.0 the tube pans back down, fastest at 0.86
  tick(c, o, t(0.99), 0.09, 2600); // 1.0 the tube settles on its rest position
}
