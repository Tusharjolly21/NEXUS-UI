import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.73;

/** A trigger click, then a rising electric whirr that lasts exactly as long as the bit spins, with a buzzing sawtooth pulse at each shudder of the body. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0), 0.14, 3100); // 0.00 the trigger is squeezed
  swish(c, o, t(0.02), t(0.76), 600, 3000, 0.06); // 0.02-0.78 the bit spins up, stripes blur
  blip(c, o, 152, t(0.089), 0.04, 0.09, 164, "sawtooth"); // 0.089 body shudders left
  blip(c, o, 174, t(0.178), 0.04, 0.09, 186, "sawtooth"); // 0.178 shudders right
  blip(c, o, 196, t(0.267), 0.04, 0.09, 208, "sawtooth"); // 0.267 left
  blip(c, o, 218, t(0.356), 0.04, 0.09, 230, "sawtooth"); // 0.356 right
  blip(c, o, 240, t(0.444), 0.04, 0.09, 252, "sawtooth"); // 0.444 left
  blip(c, o, 262, t(0.533), 0.035, 0.09, 274, "sawtooth"); // 0.533 right
  blip(c, o, 284, t(0.622), 0.03, 0.09, 296, "sawtooth"); // 0.622 left
  blip(c, o, 306, t(0.711), 0.025, 0.09, 318, "sawtooth"); // 0.711 right, the shaking dies down
}
