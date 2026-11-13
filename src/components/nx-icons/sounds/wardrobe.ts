import { ding, blip, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.35;

/** A wooden creak as the two doors swing open and a dull knock when they stop, a faint clink of hangers inside, then a creak back and a latch click as they shut. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 520, t(0.0), 0.04, 0.4, 330, "sawtooth"); // 0.00-0.40 the doors creak open on their hinges
  thud(c, o, t(0.4), 190, 0.1, 0.1); // 0.40 the doors reach their stops
  ding(c, o, 2900, t(0.42), 0.03, 0.22); // 0.42 the clothes hanger clinks on the rail
  blip(c, o, 340, t(0.66), 0.04, 0.34, 560, "sawtooth"); // 0.66-1.00 the doors creak shut
  thud(c, o, t(1.0), 130, 0.14, 0.12); // 1.00 the doors meet
  tick(c, o, t(1.02), 0.12, 2800); // 1.02 the latch clicks
}
