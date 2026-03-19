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

// ── Local colors ─────────────────────────────────────────────────────────
const WOOD_DARK = 0x5c3a1e;

// ── Well ──────────────────────────────────────────────────────────────────

/**
 * Small village well with a stone base, post-and-roof structure, and hanging bucket.
 * Footprint ~1.5 x 1.5 units, group centred at base.
 */
export function createWell(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Well';

  // ── Stone base (hollow-looking cylinder) ───────────────────────────
  const baseRadius = 0.7;
  const baseHeight = 0.9;
  const baseGeo = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 8);
  const base = shadow(new THREE.Mesh(baseGeo, mat(COLORS.stone)));
  base.position.y = baseHeight / 2;
  base.name = 'StoneBase';
  group.add(base);

  // Dark inner face to simulate hollow interior
  const innerRadius = baseRadius - 0.12;
  const innerGeo = new THREE.CylinderGeometry(innerRadius, innerRadius, 0.06, 8);
  const inner = shadow(
    new THREE.Mesh(innerGeo, mat(COLORS.stoneDark)),
    false,
    true,
  );
  inner.position.y = baseHeight - 0.02;
  inner.name = 'InnerDark';
  group.add(inner);

  // ── Support posts ──────────────────────────────────────────────────
  const postRadius = 0.06;
  const postHeight = 1.6;
  const postGeo = new THREE.CylinderGeometry(postRadius, postRadius, postHeight, 5);
  const postMat = mat(COLORS.wood);

  const postLeft = shadow(new THREE.Mesh(postGeo, postMat));
  postLeft.position.set(-baseRadius + 0.1, baseHeight + postHeight / 2, 0);
  postLeft.name = 'PostLeft';
  group.add(postLeft);

  const postRight = shadow(new THREE.Mesh(postGeo, postMat));
  postRight.position.set(baseRadius - 0.1, baseHeight + postHeight / 2, 0);
  postRight.name = 'PostRight';
  group.add(postRight);

  // ── Cross-beam ─────────────────────────────────────────────────────
  const beamLength = (baseRadius - 0.1) * 2;
  const beamGeo = new THREE.CylinderGeometry(0.05, 0.05, beamLength, 5);
  const beam = shadow(new THREE.Mesh(beamGeo, postMat));
  beam.position.y = baseHeight + postHeight;
  beam.rotation.z = Math.PI / 2;
  beam.name = 'CrossBeam';
  group.add(beam);

  // ── Small pyramid roof ─────────────────────────────────────────────
  const roofRadius = 0.65;
  const roofHeight = 0.6;
  const roofGeo = new THREE.ConeGeometry(roofRadius, roofHeight, 4);
  const roof = shadow(new THREE.Mesh(roofGeo, mat(WOOD_DARK)));
  roof.position.y = baseHeight + postHeight + roofHeight / 2;
  roof.rotation.y = Math.PI / 4;
  roof.name = 'Roof';
  group.add(roof);

  // ── Rope (thin cylinder hanging down) ──────────────────────────────
  const ropeLength = postHeight * 0.55;
  const ropeGeo = new THREE.CylinderGeometry(0.02, 0.02, ropeLength, 4);
  const rope = shadow(
    new THREE.Mesh(ropeGeo, mat(COLORS.fenceWood)),
    false,
    false,
  );
  rope.position.set(0, baseHeight + postHeight - ropeLength / 2, 0);
  rope.name = 'Rope';
  group.add(rope);

  // ── Bucket (small cylinder at rope end) ────────────────────────────
  const bucketRadius = 0.12;
  const bucketHeight = 0.18;
  const bucketGeo = new THREE.CylinderGeometry(bucketRadius, bucketRadius * 0.85, bucketHeight, 6);
  const bucket = shadow(new THREE.Mesh(bucketGeo, mat(COLORS.wood)));
  bucket.position.set(0, baseHeight + postHeight - ropeLength - bucketHeight / 2, 0);
  bucket.name = 'Bucket';
  group.add(bucket);

  return group;
}
