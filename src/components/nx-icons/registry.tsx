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
import { SendIcon } from "./icons/send";
import { StatusIcon } from "./icons/status";
import { LockIcon } from "./icons/lock";
import { EyeIcon } from "./icons/eye";
import { ShieldIcon } from "./icons/shield";
import { UserIcon } from "./icons/user";
import { InfoIcon } from "./icons/info";
import { AlertTriangleIcon } from "./icons/alert-triangle";
import { CalendarIcon } from "./icons/calendar";
import { AlarmClockIcon } from "./icons/alarm-clock";
import { ToggleIcon } from "./icons/toggle";
import { StarIcon } from "./icons/star";
import { FolderIcon } from "./icons/folder";
import { CloudUploadIcon } from "./icons/cloud-upload";
import { VolumeIcon } from "./icons/volume";
import { MicIcon } from "./icons/mic";
import { SunIcon } from "./icons/sun";
import { MoonIcon } from "./icons/moon";
import { CloudRainIcon } from "./icons/cloud-rain";
import { ZapIcon } from "./icons/zap";
import { CreditCardIcon } from "./icons/credit-card";
import { GiftIcon } from "./icons/gift";
import { MessageIcon } from "./icons/message";
import { PhoneIcon } from "./icons/phone";
import { ThumbsUpIcon } from "./icons/thumbs-up";
import { MapPinIcon } from "./icons/map-pin";
import { CompassIcon } from "./icons/compass";
import { RocketIcon } from "./icons/rocket";
import { LightbulbIcon } from "./icons/lightbulb";
import { CoffeeIcon } from "./icons/coffee";

export type NxIconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
  speed?: number;
  accent?: string;
  play?: boolean;
  /** Only the Status icon: which state to show. */
  state?: "idle" | "loading" | "success" | "error";
};

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
  "send": SendIcon,
  "status": StatusIcon,
  "lock": LockIcon,
  "eye": EyeIcon,
  "shield": ShieldIcon,
  "user": UserIcon,
  "info": InfoIcon,
  "alert-triangle": AlertTriangleIcon,
  "calendar": CalendarIcon,
  "alarm-clock": AlarmClockIcon,
  "toggle": ToggleIcon,
  "star": StarIcon,
  "folder": FolderIcon,
  "cloud-upload": CloudUploadIcon,
  "volume": VolumeIcon,
  "mic": MicIcon,
  "sun": SunIcon,
  "moon": MoonIcon,
  "cloud-rain": CloudRainIcon,
  "zap": ZapIcon,
  "credit-card": CreditCardIcon,
  "gift": GiftIcon,
  "message": MessageIcon,
  "phone": PhoneIcon,
  "thumbs-up": ThumbsUpIcon,
  "map-pin": MapPinIcon,
  "compass": CompassIcon,
  "rocket": RocketIcon,
  "lightbulb": LightbulbIcon,
  "coffee": CoffeeIcon,
};
