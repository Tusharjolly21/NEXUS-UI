import { thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.5;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.01;

/** A wet roller rolling onto a wall: a damp low squelch that starts loud and fades as the roller slows, with a lighter sizzle over it and a soft pat as it touches down. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.0), 120, 0.07, 0.05); // 0.00 roller touches the wall
  puff(c, o, t(0.0), 0.55, 1100, 0.055); // 0.00-0.55 wet roll, fastest at the start
  puff(c, o, t(0.0), 0.3, 3200, 0.02); // 0.00-0.30 fine sizzle of fresh paint
  puff(c, o, t(0.3), 0.3, 800, 0.03); // 0.30-0.60 slow wet slide as it comes to rest
}
