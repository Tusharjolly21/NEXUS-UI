import * as React from "react";
import { FaAmazon, FaMicrosoft } from "react-icons/fa";
import {
  SiAirbnb,
  SiApple,
  SiGithub,
  SiGoogle,
  SiMeta,
  SiNetflix,
  SiNvidia,
  SiSpotify,
  SiTesla,
  SiVercel,
} from "react-icons/si";

export type Logo = {
  name: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
};

export const LOGOS: Logo[] = [
  { name: "Google",    Icon: SiGoogle,    color: "#4285F4" },
  { name: "Apple",     Icon: SiApple,     color: "#A8A8A8" },
  { name: "Amazon",    Icon: FaAmazon,    color: "#FF9900" },
  { name: "Meta",      Icon: SiMeta,      color: "#1877F2" },
  { name: "Microsoft", Icon: FaMicrosoft, color: "#00A4EF" },
  { name: "Nvidia",    Icon: SiNvidia,    color: "#76B900" },
  { name: "Netflix",   Icon: SiNetflix,   color: "#E50914" },
  { name: "Spotify",   Icon: SiSpotify,   color: "#1DB954" },
  { name: "Tesla",     Icon: SiTesla,     color: "#CC0000" },
  { name: "Airbnb",    Icon: SiAirbnb,    color: "#FF5A5F" },
  { name: "GitHub",    Icon: SiGithub,    color: "#8B949E" },
  { name: "Vercel",    Icon: SiVercel,    color: "#888888" },
];
