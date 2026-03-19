import * as THREE from 'three';
import { COLORS } from '../../config';

/**
 * Create a low-poly rock of the given size.
 */
export function createRock(size: 'small' | 'medium' | 'large' = 'medium'): THREE.Group {
  const group = new THREE.Group();

  const scaleMap = { small: 0.3, medium: 0.6, large: 1.0 };
  const baseScale = scaleMap[size];

  // Slight colour variation per rock
  const greyVariation = (Math.random() - 0.5) * 0.08;
  const baseColor = new THREE.Color(COLORS.STONE_GREY);
  baseColor.r += greyVariation;
  baseColor.g += greyVariation;
  baseColor.b += greyVariation;

  // Use DodecahedronGeometry with detail 0 for a chunky low-poly look
  const geo = new THREE.DodecahedronGeometry(1.0, 0);
  randomizeVertices(geo, 0.15);

  const mat = new THREE.MeshStandardMaterial({
    color: baseColor,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Slightly squash vertically for a more natural boulder shape
  group.scale.set(
    baseScale * (0.9 + Math.random() * 0.3),
    baseScale * (0.7 + Math.random() * 0.3),
    baseScale * (0.9 + Math.random() * 0.3),
  );

  group.rotation.y = Math.random() * Math.PI * 2;

  return group;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomizeVertices(geo: THREE.BufferGeometry, amount: number): void {
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * amount);
    pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * amount);
    pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * amount);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}
