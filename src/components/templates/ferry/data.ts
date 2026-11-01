export type Currency = {
  code: string;
  name: string;
  symbol: string;
  perUsd: number;
  decimals: number;
  city: string;
  lat: number;
  lng: number;
  rail: string;
  minutes: number;
  tint: string;
};

export const CURRENCIES: Currency[] = [
  {
    code: "USD",
    name: "US dollar",
    symbol: "$",
    perUsd: 1,
    decimals: 2,
    city: "New York",
    lat: 40.71,
    lng: -74.01,
    rail: "RTP",
    minutes: 1,
    tint: "#2f9e5a",
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    perUsd: 0.9233,
    decimals: 2,
    city: "Berlin",
    lat: 52.52,
    lng: 13.4,
    rail: "SEPA Instant",
    minutes: 3,
    tint: "#2f6fe8",
  },
  {
    code: "GBP",
    name: "British pound",
    symbol: "£",
    perUsd: 0.7871,
    decimals: 2,
    city: "London",
    lat: 51.51,
    lng: -0.13,
    rail: "Faster Payments",
    minutes: 2,
    tint: "#7a5af0",
  },
  {
    code: "JPY",
    name: "Japanese yen",
    symbol: "¥",
    perUsd: 151.32,
    decimals: 0,
    city: "Tokyo",
    lat: 35.68,
    lng: 139.69,
    rail: "Zengin",
    minutes: 240,
    tint: "#d9465c",
  },
  {
    code: "SGD",
    name: "Singapore dollar",
    symbol: "S$",
    perUsd: 1.3402,
    decimals: 2,
    city: "Singapore",
    lat: 1.35,
    lng: 103.82,
    rail: "FAST",
    minutes: 5,
    tint: "#e8902a",
  },
  {
    code: "INR",
    name: "Indian rupee",
    symbol: "₹",
    perUsd: 83.41,
    decimals: 2,
    city: "Mumbai",
    lat: 19.08,
    lng: 72.88,
    rail: "IMPS",
    minutes: 20,
    tint: "#c9762a",
  },
  {
    code: "BRL",
    name: "Brazilian real",
    symbol: "R$",
    perUsd: 5.0512,
    decimals: 2,
    city: "São Paulo",
    lat: -23.55,
    lng: -46.63,
    rail: "Pix",
    minutes: 4,
    tint: "#1f9d8a",
  },
  {
    code: "AUD",
    name: "Australian dollar",
    symbol: "A$",
    perUsd: 1.5213,
    decimals: 2,
    city: "Sydney",
    lat: -33.87,
    lng: 151.21,
    rail: "NPP",
    minutes: 4,
    tint: "#3b8fd0",
  },
  {
    code: "CAD",
    name: "Canadian dollar",
    symbol: "C$",
    perUsd: 1.3684,
    decimals: 2,
    city: "Toronto",
    lat: 43.65,
    lng: -79.38,
    rail: "Interac",
    minutes: 30,
    tint: "#cf3f3f",
  },
  {
    code: "MXN",
    name: "Mexican peso",
    symbol: "MX$",
    perUsd: 17.204,
    decimals: 2,
    city: "Mexico City",
    lat: 19.43,
    lng: -99.13,
    rail: "SPEI",
    minutes: 6,
    tint: "#3a9a4e",
  },
  {
    code: "AED",
    name: "UAE dirham",
    symbol: "AED ",
    perUsd: 3.6725,
    decimals: 2,
    city: "Dubai",
    lat: 25.2,
    lng: 55.27,
    rail: "UAEFTS",
    minutes: 120,
    tint: "#8a6d3b",
  },
  {
    code: "NGN",
    name: "Nigerian naira",
    symbol: "₦",
    perUsd: 1521.4,
    decimals: 2,
    city: "Lagos",
    lat: 6.52,
    lng: 3.38,
    rail: "NIP",
    minutes: 25,
    tint: "#2c8a5c",
  },
];

export const getCurrency = (code: string): Currency => CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0];

export const rateBetween = (from: Currency, to: Currency): number => to.perUsd / from.perUsd;

export const FEE_RATE = 0.004;

export const feeFor = (amount: number): number => (amount > 0 ? Math.max(1, amount * FEE_RATE) : 0);

export const formatAmount = (amount: number, currency: Currency, digits: number = currency.decimals): string =>
  amount.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const arrivalPhrase = (minutes: number): string =>
  minutes <= 1
    ? "in seconds"
    : minutes < 60
      ? `in about ${minutes} minutes`
      : minutes < 180
        ? "within 2 hours"
        : "the same day";

export const arrivalShort = (minutes: number): string =>
  minutes <= 1
    ? "in seconds"
    : minutes < 60
      ? `in ${minutes} minutes`
      : minutes < 180
        ? "in 2 hours"
        : "the same day";

export const formatRate = (rate: number): string =>
  rate >= 100 ? rate.toFixed(2) : rate >= 10 ? rate.toFixed(3) : rate.toFixed(4);
