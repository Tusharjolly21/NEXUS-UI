import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.74;

/** Two fast whips of the rope cutting the air, a slap as it hits the floor under the handles, and a soft landing thump after the hop. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.1), t(0.22), 900, 3200, 0.05); // 0.10-0.32 the rope whips over at its fastest
  tick(c, o, t(0.45), 0.12, 1800); // 0.45 the rope slaps the floor underneath
  puff(c, o, t(0.45), 0.05, 900, 0.05, "lowpass"); // 0.45 the slap body
  thud(c, o, t(0.63), 120, 0.08, 0.1); // 0.63 the handles land after the hop
  swish(c, o, t(0.56), t(0.22), 3000, 1000, 0.035); // 0.56-0.78 the rope swings back up
}
