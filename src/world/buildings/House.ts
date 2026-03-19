import * as THREE from 'three';
import { COLORS } from '../../config';

// ── Helpers ───────────────────────────────────────────────────────────────

function mat(color: number, opts?: { emissive?: number; emissiveIntensity?: number }) {
  return new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.85,
    metalness: 0.0,
    ...(opts?.emissive != null && {
      emissive: opts.emissive,
      emissiveIntensity: opts.emissiveIntensity ?? 0,
    }),
  });
}

function shadow(mesh: THREE.Mesh, cast = true, receive = true) {
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  return mesh;
}

// ── Window color constant (light blue-grey, not in global palette) ───────
const WINDOW_LIGHT = 0xc8dce8;
const DOOR_BROWN = 0x4a2a12;

// ── House variants ────────────────────────────────────────────────────────

export interface HouseOptions {
  wallColor?: number;
  roofColor?: number;
  /** Uniform scale multiplier (default 1) */
  scale?: number;
  /** Include a chimney on the roof */
  chimney?: boolean;
}

/**
 * Low-poly village house.
 * Returns a Group centred at the base so it can be placed directly on terrain.
 */
export function createHouse(options?: HouseOptions): THREE.Group {
  const {
    wallColor = COLORS.wallWhite,
    roofColor = COLORS.roofRed,
    scale = 1,
    chimney = false,
  } = options ?? {};

  const group = new THREE.Group();
  group.name = 'House';

  // ── Walls ──────────────────────────────────────────────────────────
  const wallW = 3;
  const wallH = 2.5;
  const wallD = 3;
  const wallGeo = new THREE.BoxGeometry(wallW, wallH, wallD);
  const walls = shadow(new THREE.Mesh(wallGeo, mat(wallColor)));
  walls.position.y = wallH / 2;
  walls.name = 'Walls';
  group.add(walls);

  // ── Roof (4-sided pyramid) ─────────────────────────────────────────
  const roofRadius = wallW * 0.75; // slightly wider than walls
  const roofHeight = 1.8;
  const roofGeo = new THREE.ConeGeometry(roofRadius, roofHeight, 4);
  const roof = shadow(new THREE.Mesh(roofGeo, mat(roofColor)));
  roof.position.y = wallH + roofHeight / 2;
  roof.rotation.y = Math.PI / 4; // align edges with walls
  roof.name = 'Roof';
  group.add(roof);

  // ── Door ───────────────────────────────────────────────────────────
  const doorW = 0.7;
  const doorH = 1.4;
  const doorD = 0.08;
  const doorGeo = new THREE.BoxGeometry(doorW, doorH, doorD);
  const door = shadow(new THREE.Mesh(doorGeo, mat(DOOR_BROWN)));
  door.position.set(0, doorH / 2, wallD / 2 + doorD / 2);
  door.name = 'Door';
  group.add(door);

  // ── Windows (one on each side) ─────────────────────────────────────
  const winSize = 0.55;
  const winD = 0.06;
  const winGeo = new THREE.BoxGeometry(winD, winSize, winSize);
  const winMat = mat(WINDOW_LIGHT, {
    emissive: WINDOW_LIGHT,
    emissiveIntensity: 0, // can be turned up at night
  });

  const windowLeft = shadow(new THREE.Mesh(winGeo, winMat));
  windowLeft.position.set(-wallW / 2 - winD / 2, wallH * 0.55, 0);
  windowLeft.name = 'WindowLeft';
  group.add(windowLeft);

  const windowRight = shadow(new THREE.Mesh(winGeo, winMat));
  windowRight.position.set(wallW / 2 + winD / 2, wallH * 0.55, 0);
  windowRight.name = 'WindowRight';
  group.add(windowRight);

  // ── Chimney (optional) ─────────────────────────────────────────────
  if (chimney) {
    const chimW = 0.4;
    const chimH = 1.2;
    const chimGeo = new THREE.BoxGeometry(chimW, chimH, chimW);
    const chimMesh = shadow(new THREE.Mesh(chimGeo, mat(COLORS.stone)));
    chimMesh.position.set(wallW * 0.25, wallH + roofHeight * 0.55, -wallD * 0.15);
    chimMesh.name = 'Chimney';
    group.add(chimMesh);
  }

  // Apply uniform scale
  if (scale !== 1) {
    group.scale.setScalar(scale);
  }

  return group;
}

// ── Predefined variants ──────────────────────────────────────────────────

/** Classic white house with red roof */
export function createHouseVariantA(): THREE.Group {
  return createHouse({
    wallColor: COLORS.wallWhite,
    roofColor: COLORS.roofRed,
    chimney: true,
  });
}

/** Yellow cottage with brown roof, slightly smaller */
export function createHouseVariantB(): THREE.Group {
  return createHouse({
    wallColor: COLORS.wallYellow,
    roofColor: COLORS.roofBrown,
    scale: 0.85,
    chimney: false,
  });
}

/** Larger farmhouse, white walls, brown roof */
export function createHouseVariantC(): THREE.Group {
  return createHouse({
    wallColor: COLORS.wallWhite,
    roofColor: COLORS.roofBrown,
    scale: 1.15,
    chimney: true,
  });
}
