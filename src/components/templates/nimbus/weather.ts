import type { IconName } from "./icons";

/** The five skies the page can show. The order is the order of the switcher in the hero. */
export type Condition = "sunny" | "rain" | "snow" | "storm" | "night";

export const CONDITIONS: readonly Condition[] = ["sunny", "rain", "snow", "storm", "night"];

export type WeatherInfo = {
  label: string;
  icon: IconName;
  /** Current temperature, high and low in degrees Celsius. */
  temp: number;
  high: number;
  low: number;
  /** The one-line description under the temperature. */
  summary: string;
  /** Top, middle and bottom stops of the sky gradient behind the canvas. */
  sky: readonly [string, string, string];
};

export const WEATHER: Record<Condition, WeatherInfo> = {
  sunny: { label: "Sunny", icon: "sun-fill", temp: 24, high: 26, low: 15, summary: "Sunny", sky: ["#1c63c4", "#4f94e0", "#b4d6f3"] },
  rain: { label: "Rain", icon: "cloud-rain-fill", temp: 14, high: 16, low: 11, summary: "Rain", sky: ["#4c5664", "#6f7a88", "#9aa4b0"] },
  snow: { label: "Snow", icon: "cloud-snow-fill", temp: -2, high: 1, low: -5, summary: "Snow", sky: ["#6c7a8c", "#919dac", "#bfc7d1"] },
  storm: { label: "Storm", icon: "cloud-lightning-fill", temp: 17, high: 21, low: 14, summary: "Thunderstorms", sky: ["#11141a", "#232830", "#3a4049"] },
  night: { label: "Night", icon: "moon-stars-fill", temp: 9, high: 13, low: 7, summary: "Clear", sky: ["#03060f", "#0a1431", "#1c2a55"] },
};

export type HourlyEntry = { time: string; icon: IconName; temp: number };

const hour = (time: string, icon: IconName, temp: number): HourlyEntry => ({ time, icon, temp });

/** Six hourly readings per sky, shown in the phone's forecast card and in the rain widget. */
export const HOURLY: Record<Condition, readonly HourlyEntry[]> = {
  sunny: [
    hour("Now", "sun-fill", 24),
    hour("14", "sun-fill", 25),
    hour("15", "sun-fill", 26),
    hour("16", "cloud-sun-fill", 25),
    hour("17", "cloud-sun-fill", 23),
    hour("18", "sun-fill", 21),
  ],
  rain: [
    hour("Now", "cloud-rain-fill", 14),
    hour("14", "cloud-rain-fill", 14),
    hour("15", "cloud-fill", 15),
    hour("16", "cloud-rain-fill", 15),
    hour("17", "cloud-fill", 14),
    hour("18", "cloud-fill", 13),
  ],
  snow: [
    hour("Now", "cloud-snow-fill", -2),
    hour("14", "cloud-snow-fill", -1),
    hour("15", "cloud-snow-fill", 0),
    hour("16", "cloud-fill", 1),
    hour("17", "cloud-snow-fill", -1),
    hour("18", "cloud-fill", -3),
  ],
  storm: [
    hour("Now", "cloud-lightning-fill", 17),
    hour("14", "cloud-lightning-fill", 18),
    hour("15", "cloud-rain-fill", 19),
    hour("16", "cloud-lightning-fill", 20),
    hour("17", "cloud-rain-fill", 18),
    hour("18", "cloud-fill", 16),
  ],
  night: [
    hour("Now", "moon-stars-fill", 9),
    hour("23", "moon-stars-fill", 8),
    hour("00", "moon-stars-fill", 8),
    hour("01", "cloud-fill", 7),
    hour("02", "moon-stars-fill", 7),
    hour("03", "moon-stars-fill", 7),
  ],
};

export type DailyEntry = { day: string; icon: IconName; low: number; high: number };

const day = (name: string, icon: IconName, low: number, high: number): DailyEntry => ({ day: name, icon, low, high });

export const TEN_DAY: readonly DailyEntry[] = [
  day("Today", "cloud-sun-fill", 14, 24),
  day("Fri", "sun-fill", 16, 27),
  day("Sat", "cloud-rain-fill", 13, 19),
  day("Sun", "cloud-lightning-fill", 12, 18),
  day("Mon", "cloud-fill", 11, 17),
  day("Tue", "cloud-sun-fill", 12, 21),
  day("Wed", "sun-fill", 15, 25),
  day("Thu", "sun-fill", 17, 28),
  day("Fri", "cloud-sun-fill", 16, 24),
  day("Sat", "cloud-rain-fill", 13, 18),
];

/** On the dark glass of the phone, only the plain sun icon is yellow; every other icon is white. */
export function glassIconColor(icon: IconName) {
  return icon === "sun-fill" ? "#ffd60a" : "#ffffff";
}
