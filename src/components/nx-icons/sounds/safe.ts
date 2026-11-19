import { tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.19;

/** Fine ratchet clicks that follow the dial as it spins left, right and left, a heavy clunk as the handle opens the bolt and another as it shuts, then the dial clicks home. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.075, 0.106, 0.132, 0.156, 0.181, 0.213, 0.368, 0.405, 0.443, 0.606, 0.655, 1.116, 1.149, 1.176, 1.205, 1.243].forEach((at) => tick(c, o, t(at), 0.07, 4200)); // a click every 36 degrees the dial turns
  thud(c, o, t(0.832), 140, 0.14, 0.1); // 0.83 the handle throws the bolt open
  tick(c, o, t(0.832), 0.06, 1700); // 0.83 the metal edge of the clunk
  thud(c, o, t(1.04), 120, 0.12, 0.1); // 1.04 the handle shuts the bolt again
}
