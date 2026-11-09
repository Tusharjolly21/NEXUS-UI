import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.58;

/** A rolling rumble, a sharp wooden slap as the tail hits the ground, a short whoosh in the air, then a clack of the landing, a rattle of the trucks and the rumble of the wheels rolling on. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), 0.22, 350, 500, 0.05); // 0.1 wheels rumble as the board rolls
  tick(c, o, t(0.2), 0.2, 2200); // 0.20 the tail slaps the ground
  thud(c, o, t(0.2), 210, 0.15, 0.06); // 0.20 wood on concrete
  blip(c, o, 900, t(0.2), 0.08, 0.04, 500, "square"); // 0.20 snap of the tail
  swish(c, o, t(0.25), 0.3, 900, 500, 0.015); // 0.38 the board is in the air
  thud(c, o, t(0.74), 140, 0.22, 0.1); // 0.74 landing on all four wheels
  tick(c, o, t(0.74), 0.14, 2800); // 0.74 clack
  tick(c, o, t(0.76), 0.08, 2400); // 0.76 trucks rattle
  tick(c, o, t(0.785), 0.06, 2000); // 0.785 trucks settle
  tick(c, o, t(0.8), 0.06, 2600); // 0.80 the board compresses once more
  swish(c, o, t(0.76), 0.26, 320, 480, 0.04); // 0.88 wheels roll on
}
