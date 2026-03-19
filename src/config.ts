import * as THREE from 'three';

// ── World ────────────────────────────────────────────────────────────────────
export const WORLD_SIZE = 100;
export const TILE_SIZE = 1;

// ── Time ─────────────────────────────────────────────────────────────────────
export const GAME_MINUTES_PER_SECOND = 10;
export const DAY_START_HOUR = 6;
export const NIGHT_START_HOUR = 21;

// ── Colors ───────────────────────────────────────────────────────────────────
export const COLORS = {
  // Sky / lighting
  SKY_BLUE: 0x87ceeb,
  DAWN_PINK: 0xffaaaa,
  DUSK_ORANGE: 0xff7744,
  NIGHT_DARK: 0x0a0a2e,
  SUN_WARM: 0xffcc66,
  SUN_NOON: 0xfff4e0,
  SUN_DAWN: 0xffaa88,

  // Ground
  GROUND_GREEN: 0x7ec850,
  GROUND_BROWN: 0x8b7355,
  LEAF_DARK_GREEN: 0x3a7030,
  LEAF_GREEN: 0x4a8c3f,
  LEAF_YELLOW: 0xc8b040,

  // Terrain
  DIRT_BROWN: 0xc4a76c,
  DIRT_DARK: 0x8b7355,
  WATER_BLUE: 0x4a90d9,
  WATER_DEEP: 0x2e6bb5,

  // Wood
  WOOD_BROWN: 0x8b6914,
  WOOD_DARK: 0x5a4510,
  TRUNK_BROWN: 0x6b4226,
  BIRCH_WHITE: 0xe8dcc8,
  FENCE_WOOD: 0x9c7a3c,

  // Stone
  STONE_GREY: 0x888888,

  // Crops
  WHEAT_GOLD: 0xdaa520,
  CROP_GREEN: 0x5a9e3c,

  // Buildings (used by House, Barn, Well)
  stone: 0x888888,
  stoneDark: 0x666666,
  wood: 0x8b6914,
  roofRed: 0xb84c3c,
  roofBrown: 0x7a5230,
  wallWhite: 0xf0e6d3,
  wallYellow: 0xe8d5a3,
  fenceWood: 0x9c7a3c,
  wheat: 0xdaa520,

  // Characters
  skinLight: 0xf5c6a0,
  skinDark: 0xd4a373,
  farmerGreen: 0x4a7a3a,
  craftsmanBrown: 0x7a5230,
  childRed: 0xcc4444,
  elderPurple: 0x6a4a8a,

  // Animals
  cowWhite: 0xf0f0f0,
  cowBrown: 0x6b3a1f,
  chickenWhite: 0xf5f0e0,
  chickenRed: 0xcc3333,
  sheepWhite: 0xf0ece0,
  pigPink: 0xf0a0a0,
} as const;

// ── Camera ───────────────────────────────────────────────────────────────────
export const CAMERA = {
  FOV: 50,
  NEAR: 0.1,
  FAR: 200,
  INITIAL_POSITION: new THREE.Vector3(30, 25, 30),
};

// ── Fog ──────────────────────────────────────────────────────────────────────
export const FOG = {
  NEAR: 60,
  FAR: 120,
};

// ── Shadows ──────────────────────────────────────────────────────────────────
export const SHADOW = {
  MAP_SIZE: 2048,
  CAMERA_SIZE: 40,
  CAMERA_NEAR: 0.5,
  CAMERA_FAR: 100,
  BIAS: -0.001,
};

// ── Day / Night Cycle ────────────────────────────────────────────────────────
export const DAY_CYCLE = {
  DAWN_START: 5,
  DAWN_END: 7,
  DUSK_START: 17,
  DUSK_END: 20,
  SUN_ORBIT_RADIUS: 40,
};

// ── Navigation ───────────────────────────────────────────────────────────────
export const NAV_POINT_COUNT = 15;
export const MOVE_SPEED = 2;
export const ROTATION_SPEED = 5;

// ── AI ───────────────────────────────────────────────────────────────────────
export const AI_BATCH_INTERVAL = 15000;
export const AI_BATCH_SIZE = 4;
export const AI_CACHE_SIZE = 50;
export const AI_CACHE_TTL = 300000; // 5 minutes
export const GEMINI_RPM_LIMIT = 5;

// ── Animation ────────────────────────────────────────────────────────────────
export const WALK_CYCLE_SPEED = 8;
export const WALK_ARM_SWING = 0.4;
export const ANIMAL_WALK_CYCLE_SPEED = 6;
export const ANIMAL_LEG_SWING = 0.3;
export const IDLE_POSE_DECAY = 0.9;

// ── Behavior ─────────────────────────────────────────────────────────────────
export const MIN_STATE_DURATION = 3;
export const CHARACTER_SELECTION_DISTANCE = 3;
export const ARRIVAL_THRESHOLD = 0.3;
export const FACING_THRESHOLD = 0.1;
