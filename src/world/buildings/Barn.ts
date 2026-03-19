import * as THREE from 'three';
import { COLORS } from '../../config';

// ── Helpers ───────────────────────────────────────────────────────────────

function mat(color: number) {
  return new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.9,
    metalness: 0.0,
  });
}

function shadow(mesh: THREE.Mesh, cast = true, receive = true) {
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  return mesh;
}

// ── Local colors not in global palette ───────────────────────────────────
const WOOD_DARK = 0x5c3a1e;
const DOOR_DARK = 0x4a2a12;

// ── Barn ──────────────────────────────────────────────────────────────────

/**
 * Large low-poly barn with a steep roof, wide door, and hay bales inside.
 * Group is centred at the base for direct terrain placement.
 */
export function createBarn(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Barn';

  const barnW = 5;
  const barnH = 3.5;
  const barnD = 4;

  // ── Walls ──────────────────────────────────────────────────────────
  const wallGeo = new THREE.BoxGeometry(barnW, barnH, barnD);
  const walls = shadow(new THREE.Mesh(wallGeo, mat(COLORS.wood)));
  walls.position.y = barnH / 2;
  walls.name = 'Walls';
  group.add(walls);

  // ── Roof (steep triangular prism via ExtrudeGeometry) ──────────────
  // Build a triangular cross-section and extrude along Z
  const roofOverhang = 0.5;
  const roofHalfW = barnW / 2 + roofOverhang;
  const roofPeakH = 2.2;

  const shape = new THREE.Shape();
  shape.moveTo(-roofHalfW, 0);
  shape.lineTo(0, roofPeakH);
  shape.lineTo(roofHalfW, 0);
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: barnD + roofOverhang * 2,
    bevelEnabled: false,
  };
  const roofGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const roof = shadow(new THREE.Mesh(roofGeo, mat(WOOD_DARK)));
  roof.position.set(0, barnH, -(barnD / 2 + roofOverhang));
  roof.name = 'Roof';
  group.add(roof);

  // ── Large door opening (dark recessed box) ─────────────────────────
  const doorW = 2;
  const doorH = 2.8;
  const doorD = 0.12;
  const doorGeo = new THREE.BoxGeometry(doorW, doorH, doorD);
  const door = shadow(new THREE.Mesh(doorGeo, mat(DOOR_DARK)));
  door.position.set(0, doorH / 2, barnD / 2 + doorD / 2);
  door.name = 'DoorOpening';
  group.add(door);

  // ── Hay bale peeking inside ────────────────────────────────────────
  const hayW = 1.2;
  const hayH = 0.8;
  const hayD = 1.0;
  const hayGeo = new THREE.BoxGeometry(hayW, hayH, hayD);
  const hay = shadow(new THREE.Mesh(hayGeo, mat(COLORS.wheat)));
  hay.position.set(0.3, hayH / 2, barnD / 2 - hayD / 2 - 0.1);
  hay.name = 'HayBale';
  group.add(hay);

  // Second hay bale stacked slightly
  const hay2 = shadow(new THREE.Mesh(hayGeo, mat(COLORS.wheat)));
  hay2.position.set(-0.5, hayH / 2, barnD / 2 - hayD - 0.4);
  hay2.name = 'HayBale2';
  group.add(hay2);

  return group;
}
