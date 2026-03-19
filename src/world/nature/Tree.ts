import * as THREE from 'three';
import { COLORS } from '../../config';

/**
 * Create a low-poly tree of the given type.
 */
export function createTree(type: 'pine' | 'oak' | 'birch' = 'oak'): THREE.Group {
  const group = new THREE.Group();
  const scaleFactor = 0.8 + Math.random() * 0.4; // 0.8 – 1.2

  switch (type) {
    case 'pine':
      buildPine(group);
      break;
    case 'oak':
      buildOak(group);
      break;
    case 'birch':
      buildBirch(group);
      break;
  }

  group.scale.setScalar(scaleFactor);
  group.rotation.y = Math.random() * Math.PI * 2;

  return group;
}

// ── Pine ──────────────────────────────────────────────────────────────────────

function buildPine(group: THREE.Group): void {
  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 2.0, 6);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: COLORS.TRUNK_BROWN,
    flatShading: true,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.0;
  setShadow(trunk);
  group.add(trunk);

  // Cone layers (bottom to top, decreasing size)
  const layers = [
    { radius: 1.4, height: 1.6, y: 2.4 },
    { radius: 1.1, height: 1.4, y: 3.4 },
    { radius: 0.7, height: 1.2, y: 4.2 },
  ];

  const leafMat = new THREE.MeshStandardMaterial({
    color: COLORS.LEAF_DARK_GREEN,
    flatShading: true,
  });

  for (const layer of layers) {
    const coneGeo = new THREE.ConeGeometry(layer.radius, layer.height, 7);
    const cone = new THREE.Mesh(coneGeo, leafMat);
    cone.position.y = layer.y;
    setShadow(cone);
    group.add(cone);
  }
}

// ── Oak ───────────────────────────────────────────────────────────────────────

function buildOak(group: THREE.Group): void {
  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.8, 6);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: COLORS.TRUNK_BROWN,
    flatShading: true,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.9;
  setShadow(trunk);
  group.add(trunk);

  // Canopy – dodecahedron with randomised vertices
  const canopyGeo = new THREE.DodecahedronGeometry(1.6, 1);
  randomizeVertices(canopyGeo, 0.2);
  const canopyMat = new THREE.MeshStandardMaterial({
    color: COLORS.LEAF_GREEN,
    flatShading: true,
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.y = 3.0;
  setShadow(canopy);
  group.add(canopy);
}

// ── Birch ─────────────────────────────────────────────────────────────────────

function buildBirch(group: THREE.Group): void {
  // Thin white trunk
  const trunkGeo = new THREE.CylinderGeometry(0.1, 0.15, 2.4, 6);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: COLORS.BIRCH_WHITE,
    flatShading: true,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.2;
  setShadow(trunk);
  group.add(trunk);

  // Smaller canopy
  const canopyGeo = new THREE.IcosahedronGeometry(1.1, 1);
  randomizeVertices(canopyGeo, 0.15);
  const canopyMat = new THREE.MeshStandardMaterial({
    color: COLORS.LEAF_GREEN,
    flatShading: true,
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.y = 3.4;
  setShadow(canopy);
  group.add(canopy);
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

function setShadow(mesh: THREE.Mesh): void {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}
