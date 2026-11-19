import { blip, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.83;

/** A woody knock as the frame is nudged, then a dry creak of the wire on the nail at each end of the swing, each creak smaller as the frame settles straight. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.0), 212, 0.09, 0.07); // 0.00 the frame is knocked
  blip(c, o, 187, t(0.2), 0.05, 0.12, 236, "sawtooth"); // 0.22 the wire creaks at the right end of the swing
  blip(c, o, 223, t(0.44), 0.035, 0.11, 178, "sawtooth"); // 0.46 creak at the left end
  blip(c, o, 198, t(0.66), 0.025, 0.1, 228, "sawtooth"); // 0.68 a smaller creak
  puff(c, o, t(0.902), 0.05, 1500, 0.02); // 0.90 the last tiny sway rubs the wall
}
