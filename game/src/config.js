// Vaultbreak — Midnight Heist: level constants and the vault floor plan.
// One top-down room with three routes to the vault: the west gallery, the
// central hall and the east service duct. All positions are in canvas px.
export const VIEW = { w: 1280, h: 720 };
export const HUD_H = 64;

// The vault room (outer walls included as the first four entries).
export const ROOM = { x: 40, y: 84, w: 1200, h: 596 };
export const WALL_T = 14;

export const WALLS = [
  // Outer shell
  { x: 40, y: 84, w: 1200, h: 14 }, // north
  { x: 40, y: 666, w: 540, h: 14 }, // south, west of the exit door
  { x: 640, y: 666, w: 600, h: 14 }, // south, east of the exit door
  { x: 40, y: 84, w: 14, h: 596 }, // west
  { x: 1226, y: 84, w: 14, h: 596 }, // east
  // Interior: west gallery divider (gap at the bottom)
  { x: 430, y: 84, w: 14, h: 300 },
  // Interior: east duct divider (gap at the top)
  { x: 850, y: 300, w: 14, h: 380 },
  // Interior: central hall divider with a doorway in the middle
  { x: 430, y: 384, w: 170, h: 14 },
  { x: 680, y: 384, w: 170, h: 14 },
  // Cover pillars
  { x: 560, y: 180, w: 36, h: 36 },
  { x: 720, y: 180, w: 36, h: 36 },
  { x: 240, y: 300, w: 36, h: 36 },
  { x: 1020, y: 480, w: 36, h: 36 },
  // The vault itself (solid gold box; the loot sits in front of it)
  { x: 595, y: 112, w: 90, h: 56 },
];

// Exit door: the 100px gap in the south wall, dead centre.
export const EXIT = { x: 580, y: 666, w: 60, h: 14 };

// The loot: the vault target plus three grab-bags tucked off the main route.
export const VAULT_LOOT = { x: 640, y: 196, r: 22, value: 5000, name: 'The Midnight Diamond' };
export const BAGS = [
  { x: 190, y: 540, r: 16, value: 500, name: 'Coin bag', taken: false },
  { x: 1090, y: 180, r: 16, value: 500, name: 'Coin bag', taken: false },
  { x: 640, y: 580, r: 16, value: 500, name: 'Coin bag', taken: false },
];

export const PLAYER_START = { x: 120, y: 620 };

// Guards: name, patrol waypoints (loops), speed and facing start.
export const GUARDS = [
  {
    name: 'Rook',
    waypoints: [
      { x: 200, y: 160 },
      { x: 200, y: 560 },
      { x: 360, y: 560 },
      { x: 360, y: 160 },
    ],
    speed: 72,
    color: '#4aa3ff',
  },
  {
    name: 'Bishop',
    waypoints: [
      { x: 500, y: 250 },
      { x: 780, y: 250 },
      { x: 780, y: 330 },
      { x: 500, y: 330 },
    ],
    speed: 66,
    color: '#ff9f43',
  },
  {
    name: 'Knight',
    waypoints: [
      { x: 930, y: 160 },
      { x: 1140, y: 160 },
      { x: 1140, y: 560 },
      { x: 930, y: 560 },
    ],
    speed: 78,
    color: '#b388ff',
  },
];

// Wall cameras: fixed mount, sweeping arc.
export const CAMERAS = [
  { x: 420, y: 100, baseAngle: Math.PI / 2, sweep: 0.8, speed: 0.55, range: 230, name: 'CAM-1' },
  { x: 1226, y: 380, baseAngle: Math.PI, sweep: 0.7, speed: 0.7, range: 220, name: 'CAM-2' },
];

export const VISION = {
  guardRange: 178,
  guardHalfAngle: 0.58, // ~33 degrees each side
  camHalfAngle: 0.34,
  // Alarm points per second while spotted (near vs far edge of the cone).
  nearRate: 58,
  farRate: 24,
  camRate: 46,
  decayPerSec: 5,
  alertSpeed: 1.45, // guard speed multiplier once the alarm passes 60
};

export const PLAYER = { radius: 13, speed: 172 };
export const TOOLS = { smokeCharges: 3, smokeRadius: 150, smokeSecs: 4, decoyCharges: 2 };
