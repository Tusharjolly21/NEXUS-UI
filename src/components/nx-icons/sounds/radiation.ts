import { swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A faint creak as the blades wind back, then a Geiger counter clicking at every twenty degrees the blades turn, with a soft rising air sweep under them and a low thump as the hub swells. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.16), 600, 380, 0.02); // 0.02-0.18 the blades wind back a little
  swish(c, o, t(0.22), t(0.64), 350, 1500, 0.03); // 0.18-0.88 the turn, fastest at 0.54
  [0.332, 0.425, 0.495, 0.559, 0.625, 0.705].forEach((at, i) => tick(c, o, t(at), 0.12, 3300 + (i % 3) * 700)); // 0.33-0.71 the blades pass 0, 20, 40, 60, 80 and 100 degrees
  thud(c, o, t(0.63), 95, 0.14, 0.12); // 0.63 the hub swells to its largest
  tick(c, o, t(0.84), 0.07, 2400); // 0.84 the blades come to rest
}
