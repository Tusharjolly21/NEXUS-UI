/**
 * A coarse world land mask for Aurora's dotted map, as rough continent outlines
 * in [longitude, latitude]. Accurate enough for a dot grid, not for navigation.
 * Everything here is computed once at module load and is deterministic, so the
 * server and the client render the same dots.
 */
type Poly = [number, number][];

const LAND: Poly[] = [
  // North America
  [[-168, 66], [-162, 70], [-140, 70], [-120, 72], [-95, 72], [-80, 73], [-62, 66], [-55, 52], [-66, 45], [-70, 42], [-76, 35], [-81, 31], [-80, 25], [-85, 30], [-90, 29], [-97, 26], [-97, 20], [-92, 18], [-87, 21], [-88, 16], [-83, 10], [-79, 8], [-82, 8], [-86, 12], [-92, 14], [-100, 17], [-106, 23], [-112, 30], [-115, 30], [-110, 23], [-117, 32], [-121, 36], [-124, 41], [-124, 48], [-130, 54], [-140, 60], [-152, 58], [-160, 56], [-165, 60]],
  // Greenland
  [[-52, 60], [-44, 60], [-20, 70], [-18, 77], [-30, 83], [-60, 82], [-70, 78], [-58, 72]],
  // Iceland
  [[-24, 64], [-14, 64], [-14, 66.5], [-22, 66.5]],
  // South America
  [[-80, 8], [-72, 12], [-62, 10], [-50, 0], [-35, -6], [-38, -13], [-40, -22], [-48, -26], [-53, -34], [-58, -38], [-65, -42], [-66, -48], [-70, -53], [-74, -50], [-73, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -5], [-80, 0], [-78, 4]],
  // Europe
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [8, 57], [5, 58], [6, 62], [14, 67], [22, 70], [30, 70], [40, 67], [44, 68], [60, 69], [60, 55], [50, 46], [40, 44], [30, 46], [28, 41], [24, 38], [20, 40], [16, 38], [12, 44], [8, 44], [3, 43], [-1, 37]],
  // Britain and Ireland
  [[-6, 50], [2, 51], [0, 53], [-2, 56], [-5, 58.5], [-6.5, 56], [-3, 54], [-5, 52]],
  [[-10, 51.5], [-6, 52], [-6, 55], [-9, 54.5]],
  // Africa
  [[-17, 15], [-17, 21], [-13, 27], [-10, 30], [-6, 35], [10, 37], [11, 33], [20, 31], [30, 31], [33, 30], [35, 24], [38, 18], [43, 12], [51, 12], [48, 5], [40, -3], [40, -11], [35, -20], [33, -26], [28, -33], [20, -35], [18, -30], [12, -17], [13, -8], [9, -1], [9, 4], [4, 6], [-4, 5], [-8, 4], [-13, 8], [-17, 12]],
  // Madagascar
  [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]],
  // Asia
  [[26, 40], [36, 36], [35, 32], [34, 28], [43, 13], [52, 16], [57, 22], [57, 25], [50, 27], [48, 30], [57, 26], [62, 25], [67, 24], [73, 20], [77, 8], [80, 15], [80, 13], [87, 21], [92, 22], [94, 17], [98, 16], [98, 8], [101, 3], [104, 1], [103, 10], [106, 10], [109, 12], [108, 21], [115, 22], [121, 29], [121, 32], [118, 38], [122, 40], [121, 41], [126, 38], [127, 35], [129, 36], [130, 43], [135, 44], [141, 52], [136, 55], [140, 60], [155, 60], [160, 62], [163, 69], [178, 66], [180, 69], [150, 72], [140, 72], [113, 74], [100, 77], [80, 73], [68, 70], [60, 69], [60, 55], [50, 46], [48, 42], [40, 44], [30, 46], [28, 41]],
  // Japan
  [[130, 31], [135, 34], [140, 35], [142, 40], [141.5, 45], [144.5, 43], [140, 41], [136, 37], [132, 34]],
  // Sri Lanka, Taiwan, Philippines
  [[80, 6], [82, 7], [81.5, 9.5], [79.8, 9]],
  [[120, 22], [122, 25], [121.5, 22]],
  [[120, 18], [122, 18.5], [126, 7], [122, 7]],
  // Borneo, Sumatra, Java, New Guinea, Sulawesi
  [[109, 1], [111, -3], [116, -4], [119, 1], [117, 7], [113, 3]],
  [[95, 5], [98, 4], [106, -6], [102, -4]],
  [[105, -6], [114, -7], [114, -8.5], [106, -7.5]],
  [[131, -1], [141, -3], [150, -10], [141, -9], [137, -5]],
  [[119, -5], [121, 1], [125, 1], [121, -1], [122, -5]],
  // Australia
  [[114, -22], [114, -34], [118, -35], [124, -33], [131, -31], [138, -35], [141, -38], [147, -39], [150, -37], [153, -28], [153, -25], [146, -19], [142, -11], [136, -12], [136, -15], [130, -12], [125, -14], [122, -18]],
  [[145, -41], [148.5, -41], [147, -43.5]],
  // New Zealand
  [[172, -34], [178, -38], [174, -41], [171, -45], [167, -46], [170, -42]],
];

export const MAP_W = 1000;
export const LAT_TOP = 76;
export const LAT_BOTTOM = -56;
export const MAP_H = Math.round((MAP_W * (LAT_TOP - LAT_BOTTOM)) / 360);

export const project = (lon: number, lat: number) => ({ x: ((lon + 180) / 360) * MAP_W, y: ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * MAP_H });

function inside(lon: number, lat: number, poly: Poly) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

const STEP = 9;
export const DOTS: { x: number; y: number }[] = [];
for (let y = STEP / 2; y < MAP_H; y += STEP) {
  for (let x = STEP / 2; x < MAP_W; x += STEP) {
    const lon = (x / MAP_W) * 360 - 180;
    const lat = LAT_TOP - (y / MAP_H) * (LAT_TOP - LAT_BOTTOM);
    if (LAND.some((p) => inside(lon, lat, p))) DOTS.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }
}

export interface Region { id: string; city: string; lon: number; lat: number }
export const REGIONS: Region[] = [
  { id: "sfo", city: "San Francisco", lon: -122.4, lat: 37.8 },
  { id: "pdx", city: "Portland", lon: -122.7, lat: 45.5 },
  { id: "dfw", city: "Dallas", lon: -97, lat: 32.8 },
  { id: "yyz", city: "Toronto", lon: -79.4, lat: 43.7 },
  { id: "iad", city: "Virginia", lon: -77.5, lat: 38.9 },
  { id: "gru", city: "São Paulo", lon: -46.6, lat: -23.5 },
  { id: "lhr", city: "London", lon: -0.1, lat: 51.5 },
  { id: "cdg", city: "Paris", lon: 2.35, lat: 48.9 },
  { id: "fra", city: "Frankfurt", lon: 8.7, lat: 50.1 },
  { id: "arn", city: "Stockholm", lon: 18, lat: 59.3 },
  { id: "jnb", city: "Johannesburg", lon: 28, lat: -26.2 },
  { id: "dxb", city: "Dubai", lon: 55.3, lat: 25.2 },
  { id: "bom", city: "Mumbai", lon: 72.9, lat: 19.1 },
  { id: "sin", city: "Singapore", lon: 103.8, lat: 1.35 },
  { id: "hkg", city: "Hong Kong", lon: 114.2, lat: 22.3 },
  { id: "icn", city: "Seoul", lon: 126.9, lat: 37.5 },
  { id: "nrt", city: "Tokyo", lon: 139.7, lat: 35.7 },
  { id: "syd", city: "Sydney", lon: 151.2, lat: -33.9 },
];
