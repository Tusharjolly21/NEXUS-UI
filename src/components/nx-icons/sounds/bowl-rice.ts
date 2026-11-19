import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.01;

/** A soft woody whoosh as the chopsticks lift out of the rice, then a light wooden tap when they land back on the mound and a smaller tap as they settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.25), 600, 1500, 0.025); // 0.00-0.25 the chopsticks lift up out of the rice
  swish(c, o, t(0.45), t(0.2), 1300, 650, 0.02); // 0.45-0.65 they come back down
  tick(c, o, t(0.648), 0.07, 2600); // 0.65 the tips tap the rice mound
  blip(c, o, 1180, t(0.648), 0.05, 0.05, 1040, "triangle"); // 0.65 the hollow knock of the wood
  tick(c, o, t(0.9), 0.03, 2900); // 0.90 a smaller tap as they settle
  blip(c, o, 1260, t(0.9), 0.025, 0.04, 1130, "triangle"); // 0.90 the wood rings faintly
}
