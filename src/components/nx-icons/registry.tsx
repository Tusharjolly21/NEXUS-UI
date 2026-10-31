"use client";

import type { ComponentType } from "react";
import { ArcSpinnerIcon } from "./icons/arc-spinner";
import { TickSpinnerIcon } from "./icons/tick-spinner";
import { WaveDotsIcon } from "./icons/wave-dots";
import { PulseDotsIcon } from "./icons/pulse-dots";
import { RippleIcon } from "./icons/ripple";
import { OrbitIcon } from "./icons/orbit";
import { BouncingBallIcon } from "./icons/bouncing-ball";
import { HourglassIcon } from "./icons/hourglass";
import { ClockIcon } from "./icons/clock";
import { WifiScanIcon } from "./icons/wifi-scan";
import { BellIcon } from "./icons/bell";
import { HeartIcon } from "./icons/heart";
import { SearchIcon } from "./icons/search";
import { MailIcon } from "./icons/mail";
import { HomeIcon } from "./icons/home";
import { DownloadIcon } from "./icons/download";
import { ShareIcon } from "./icons/share";
import { CheckCircleIcon } from "./icons/check-circle";
import { CopyIcon } from "./icons/copy";
import { SettingsIcon } from "./icons/settings";
import { TrashIcon } from "./icons/trash";
import { ShoppingCartIcon } from "./icons/shopping-cart";
import { BatteryIcon } from "./icons/battery";
import { CameraIcon } from "./icons/camera";
import { CoinIcon } from "./icons/coin";
import { TruckIcon } from "./icons/truck";

export type NxIconProps = { size?: number; strokeWidth?: number; className?: string; play?: boolean };

/** Every icon by slug, for the grid and the icon pages. */
export const NX_ICONS: Record<string, ComponentType<NxIconProps>> = {
  "arc-spinner": ArcSpinnerIcon,
  "tick-spinner": TickSpinnerIcon,
  "wave-dots": WaveDotsIcon,
  "pulse-dots": PulseDotsIcon,
  "ripple": RippleIcon,
  "orbit": OrbitIcon,
  "bouncing-ball": BouncingBallIcon,
  "hourglass": HourglassIcon,
  "clock": ClockIcon,
  "wifi-scan": WifiScanIcon,
  "bell": BellIcon,
  "heart": HeartIcon,
  "search": SearchIcon,
  "mail": MailIcon,
  "home": HomeIcon,
  "download": DownloadIcon,
  "share": ShareIcon,
  "check-circle": CheckCircleIcon,
  "copy": CopyIcon,
  "settings": SettingsIcon,
  "trash": TrashIcon,
  "shopping-cart": ShoppingCartIcon,
  "battery": BatteryIcon,
  "camera": CameraIcon,
  "coin": CoinIcon,
  "truck": TruckIcon,
};
