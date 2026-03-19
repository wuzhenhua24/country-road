import * as THREE from 'three';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface BuildingPlacement {
  type: 'house' | 'barn' | 'well';
  position: THREE.Vector3;
  rotation: number; // Y rotation in radians
  options?: Record<string, any>;
}

export interface NaturePlacement {
  type: 'tree' | 'rock' | 'fence' | 'cropField';
  position: THREE.Vector3;
  rotation?: number;
  options?: Record<string, any>;
}

export interface NavPoint {
  id: string;
  position: THREE.Vector3;
  label: string;
  connections: string[];
}

// ── River Path ────────────────────────────────────────────────────────────────
// S-curve control points matching the river defined in River.ts.
// River flows roughly along x≈8 from south (z=-48) to north (z=48),
// curving west through the middle of the map.

export const riverPath: THREE.Vector3[] = [
  new THREE.Vector3(8, -0.25, -48),
  new THREE.Vector3(6, -0.25, -30),
  new THREE.Vector3(3, -0.25, -15),
  new THREE.Vector3(-2, -0.25, 0),
  new THREE.Vector3(-5, -0.25, 12),
  new THREE.Vector3(-3, -0.25, 25),
  new THREE.Vector3(2, -0.25, 35),
  new THREE.Vector3(5, -0.25, 48),
];

// ── Bridge ────────────────────────────────────────────────────────────────────
// Crosses the river near z≈-8 where the curve passes through x≈1

export const bridgePosition = new THREE.Vector3(1, 0, -8);

// ── Buildings ─────────────────────────────────────────────────────────────────
// Houses clustered on the west side of the river, barn near southern fields,
// well at the village square.

export const buildings: BuildingPlacement[] = [
  // --- Houses (west side of river, loosely around the village square) ---

  // House 1: north-west, facing south-east toward the square
  {
    type: 'house',
    position: new THREE.Vector3(-18, 0, -14),
    rotation: Math.PI * 0.1,
    options: { wallColor: 0xf5f0e8, roofColor: 0xb03030 },
  },
  // House 2: west of square, facing east
  {
    type: 'house',
    position: new THREE.Vector3(-22, 0, -4),
    rotation: Math.PI * 0.05,
    options: { wallColor: 0xe8d5a3, roofColor: 0x6b3a2a, scale: 1.1 },
  },
  // House 3: near square, slightly south-west
  {
    type: 'house',
    position: new THREE.Vector3(-15, 0, 3),
    rotation: -Math.PI * 0.08,
    options: { wallColor: 0xf5f0e8, roofColor: 0x6b3a2a },
  },
  // House 4: south-west cluster, near path to barn
  {
    type: 'house',
    position: new THREE.Vector3(-20, 0, 10),
    rotation: Math.PI * 0.15,
    options: { wallColor: 0xe8d5a3, roofColor: 0xb03030, scale: 0.9 },
  },
  // House 5: further north-west, slightly isolated
  {
    type: 'house',
    position: new THREE.Vector3(-26, 0, -20),
    rotation: Math.PI * 0.25,
    options: { wallColor: 0xf5f0e8, roofColor: 0xb03030, scale: 1.05 },
  },
  // House 6: close to the bridge on the west bank
  {
    type: 'house',
    position: new THREE.Vector3(-10, 0, -10),
    rotation: -Math.PI * 0.1,
    options: { wallColor: 0xe8d5a3, roofColor: 0x6b3a2a, scale: 1.15 },
  },

  // --- Barn (near the southern crop fields) ---
  {
    type: 'barn',
    position: new THREE.Vector3(-16, 0, 22),
    rotation: 0,
  },

  // --- Well (village square center) ---
  {
    type: 'well',
    position: new THREE.Vector3(-14, 0, -5),
    rotation: 0,
  },
];

// ── Nature ────────────────────────────────────────────────────────────────────
// Trees scattered around (denser east of river and along north edge), rocks for
// natural detail, fences around fields and barn, crop fields to the south.

export const nature: NaturePlacement[] = [
  // --- Trees (~15, mix of pine and oak) ---

  // East of river – loose forest cluster
  { type: 'tree', position: new THREE.Vector3(14, 0, -20), options: { type: 'pine' } },
  { type: 'tree', position: new THREE.Vector3(18, 0, -16), options: { type: 'oak' } },
  { type: 'tree', position: new THREE.Vector3(20, 0, -22), options: { type: 'pine' } },
  { type: 'tree', position: new THREE.Vector3(16, 0, -10), options: { type: 'pine' } },
  { type: 'tree', position: new THREE.Vector3(22, 0, -6), options: { type: 'oak' } },

  // East, further south
  { type: 'tree', position: new THREE.Vector3(12, 0, 10), options: { type: 'oak' } },
  { type: 'tree', position: new THREE.Vector3(15, 0, 15), options: { type: 'pine' } },
  { type: 'tree', position: new THREE.Vector3(10, 0, 18), options: { type: 'oak' } },

  // West side, scattered between houses
  { type: 'tree', position: new THREE.Vector3(-28, 0, -8), options: { type: 'oak' } },
  { type: 'tree', position: new THREE.Vector3(-30, 0, 5), options: { type: 'pine' } },

  // Along north edge of the map
  { type: 'tree', position: new THREE.Vector3(-8, 0, -35), options: { type: 'pine' } },
  { type: 'tree', position: new THREE.Vector3(0, 0, -38), options: { type: 'pine' } },
  { type: 'tree', position: new THREE.Vector3(12, 0, -35), options: { type: 'oak' } },

  // South, flanking the fields
  { type: 'tree', position: new THREE.Vector3(-28, 0, 25), options: { type: 'oak' } },
  { type: 'tree', position: new THREE.Vector3(-8, 0, 32), options: { type: 'pine' } },

  // --- Rocks (~8) ---
  { type: 'rock', position: new THREE.Vector3(-12, 0, -18), options: { size: 'medium' } },
  { type: 'rock', position: new THREE.Vector3(6, 0, -25), options: { size: 'small' } },
  { type: 'rock', position: new THREE.Vector3(20, 0, 5), options: { size: 'large' } },
  { type: 'rock', position: new THREE.Vector3(-25, 0, 14), options: { size: 'small' } },
  { type: 'rock', position: new THREE.Vector3(8, 0, 28), options: { size: 'medium' } },
  { type: 'rock', position: new THREE.Vector3(-5, 0, 20), options: { size: 'small' } },
  { type: 'rock', position: new THREE.Vector3(-30, 0, -25), options: { size: 'large' } },
  { type: 'rock', position: new THREE.Vector3(25, 0, -30), options: { size: 'medium' } },

  // --- Fences (3 sections: around fields and barn) ---

  // South fence along crop fields
  {
    type: 'fence',
    position: new THREE.Vector3(-18, 0, 30),
    rotation: 0,
    options: { length: 14, direction: 'x' },
  },
  // East fence beside fields
  {
    type: 'fence',
    position: new THREE.Vector3(-10, 0, 26),
    rotation: Math.PI / 2,
    options: { length: 8, direction: 'z' },
  },
  // West fence near barn
  {
    type: 'fence',
    position: new THREE.Vector3(-22, 0, 18),
    rotation: Math.PI / 2,
    options: { length: 10, direction: 'z' },
  },

  // --- Crop Fields (2 patches south of village) ---
  {
    type: 'cropField',
    position: new THREE.Vector3(-18, 0, 26),
    rotation: 0,
    options: { rows: 6, cols: 8 },
  },
  {
    type: 'cropField',
    position: new THREE.Vector3(-12, 0, 34),
    rotation: 0,
    options: { rows: 4, cols: 6 },
  },
];

// ── Navigation Waypoints ──────────────────────────────────────────────────────
// ~15 waypoints forming a walkable graph that covers every key location.

export const navPoints: NavPoint[] = [
  // Village square – central hub connecting most paths
  {
    id: 'square',
    position: new THREE.Vector3(-14, 0, -5),
    label: 'Village Square',
    connections: ['well', 'house1_door', 'house2_door', 'house3_door', 'house6_door', 'bridge_west'],
  },
  {
    id: 'well',
    position: new THREE.Vector3(-14, 0, -5),
    label: 'Village Well',
    connections: ['square'],
  },

  // House doors
  {
    id: 'house1_door',
    position: new THREE.Vector3(-17, 0, -13),
    label: 'House 1 Door',
    connections: ['square', 'house5_door'],
  },
  {
    id: 'house2_door',
    position: new THREE.Vector3(-21, 0, -3),
    label: 'House 2 Door',
    connections: ['square', 'house4_door'],
  },
  {
    id: 'house3_door',
    position: new THREE.Vector3(-14, 0, 3),
    label: 'House 3 Door',
    connections: ['square', 'house4_door', 'field_north'],
  },
  {
    id: 'house4_door',
    position: new THREE.Vector3(-19, 0, 10),
    label: 'House 4 Door',
    connections: ['house2_door', 'house3_door', 'barn'],
  },
  {
    id: 'house5_door',
    position: new THREE.Vector3(-25, 0, -19),
    label: 'House 5 Door',
    connections: ['house1_door'],
  },
  {
    id: 'house6_door',
    position: new THREE.Vector3(-9, 0, -10),
    label: 'House 6 Door',
    connections: ['square', 'bridge_west'],
  },

  // Barn & fields
  {
    id: 'barn',
    position: new THREE.Vector3(-16, 0, 20),
    label: 'Barn Entrance',
    connections: ['house4_door', 'field_north', 'field_south'],
  },
  {
    id: 'field_north',
    position: new THREE.Vector3(-18, 0, 24),
    label: 'North Crop Field',
    connections: ['barn', 'house3_door', 'field_south'],
  },
  {
    id: 'field_south',
    position: new THREE.Vector3(-12, 0, 32),
    label: 'South Crop Field',
    connections: ['field_north', 'barn'],
  },

  // Bridge & river crossing
  {
    id: 'bridge_west',
    position: new THREE.Vector3(-4, 0, -8),
    label: 'Bridge (West Side)',
    connections: ['square', 'house6_door', 'bridge_east'],
  },
  {
    id: 'bridge_east',
    position: new THREE.Vector3(6, 0, -8),
    label: 'Bridge (East Side)',
    connections: ['bridge_west', 'east_bank'],
  },

  // East side of river
  {
    id: 'east_bank',
    position: new THREE.Vector3(10, 0, -8),
    label: 'East River Bank',
    connections: ['bridge_east', 'east_forest'],
  },
  {
    id: 'east_forest',
    position: new THREE.Vector3(18, 0, -15),
    label: 'Eastern Forest',
    connections: ['east_bank'],
  },
];
