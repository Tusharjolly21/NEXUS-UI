export const REGIONS = [
  {
    city: "Virginia",
    code: "us-east",
    zone: "Americas",
    share: 24,
    ms: 31,
    lat: 38.9,
    lon: -77.4,
  },
  {
    city: "Frankfurt",
    code: "eu-central",
    zone: "Europe",
    share: 19,
    ms: 27,
    lat: 50.1,
    lon: 8.7,
  },
  {
    city: "Oregon",
    code: "us-west",
    zone: "Americas",
    share: 14,
    ms: 34,
    lat: 45.6,
    lon: -121.2,
  },
  {
    city: "Tokyo",
    code: "ap-northeast",
    zone: "Asia-Pacific",
    share: 12,
    ms: 38,
    lat: 35.7,
    lon: 139.7,
  },
  {
    city: "Mumbai",
    code: "ap-south",
    zone: "Asia-Pacific",
    share: 10,
    ms: 44,
    lat: 19.1,
    lon: 72.9,
  },
  {
    city: "London",
    code: "eu-west",
    zone: "Europe",
    share: 9,
    ms: 29,
    lat: 51.5,
    lon: -0.1,
  },
  {
    city: "Singapore",
    code: "ap-southeast",
    zone: "Asia-Pacific",
    share: 7,
    ms: 41,
    lat: 1.35,
    lon: 103.8,
  },
  {
    city: "São Paulo",
    code: "sa-east",
    zone: "Americas",
    share: 5,
    ms: 46,
    lat: -23.5,
    lon: -46.6,
  },
];

export const ZONES = ["All regions", "Americas", "Europe", "Asia-Pacific"] as const;
export type Zone = (typeof ZONES)[number];

export const ZONE_STATS: Record<Zone, { p50: number; tps: number; req: number; spend: number }> = {
  "All regions": {
    p50: 36,
    tps: 3920,
    req: 2.41,
    spend: 486,
  },
  Americas: {
    p50: 33,
    tps: 1680,
    req: 1.04,
    spend: 212,
  },
  Europe: {
    p50: 28,
    tps: 1190,
    req: 0.68,
    spend: 139,
  },
  "Asia-Pacific": {
    p50: 41,
    tps: 1050,
    req: 0.69,
    spend: 135,
  },
};
