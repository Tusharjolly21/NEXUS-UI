export function hexToRgb(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function rgbToHex(rgb: number[]) {
  return (
    "#" +
    rgb
      .map((channel) =>
        Math.round(Math.max(0, Math.min(255, channel)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

export function mixHex(from: string, to: string, amount: number) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return rgbToHex(a.map((channel, i) => channel + (b[i] - channel) * amount));
}

export function rgba(hex: string, alpha: number) {
  const [red, green, blue] = hexToRgb(hex);
  return `rgba(${red},${green},${blue},${alpha})`;
}
