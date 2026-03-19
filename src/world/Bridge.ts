import * as THREE from 'three';
import { COLORS } from '../config';

/**
 * Creates a simple wooden bridge to cross the river.
 * Deck planks, side rails, and cylindrical support posts.
 */
export function createBridge(position: THREE.Vector3): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Bridge';

  const bridgeLength = 6;
  const bridgeWidth = 3;
  const deckY = 0.35; // just above water level

  const woodMat = new THREE.MeshStandardMaterial({
    color: COLORS.WOOD_BROWN,
    flatShading: true,
    roughness: 0.85,
  });

  const woodDarkMat = new THREE.MeshStandardMaterial({
    color: COLORS.WOOD_DARK,
    flatShading: true,
    roughness: 0.9,
  });

  // --- Deck planks ---
  const plankCount = 10;
  const plankWidth = bridgeLength / plankCount;
  const plankDepth = bridgeWidth;
  const plankHeight = 0.08;

  for (let i = 0; i < plankCount; i++) {
    const plankGeo = new THREE.BoxGeometry(plankWidth - 0.04, plankHeight, plankDepth);
    const plank = new THREE.Mesh(plankGeo, i % 2 === 0 ? woodMat : woodDarkMat);
    plank.position.set(
      -bridgeLength / 2 + plankWidth * (i + 0.5),
      deckY,
      0
    );
    plank.castShadow = true;
    plank.receiveShadow = true;
    group.add(plank);
  }

  // --- Side rails ---
  const railHeight = 0.6;
  const railThickness = 0.1;

  for (const side of [-1, 1]) {
    // Horizontal rail
    const railGeo = new THREE.BoxGeometry(bridgeLength, railThickness, railThickness);
    const rail = new THREE.Mesh(railGeo, woodDarkMat);
    rail.position.set(0, deckY + railHeight, side * (bridgeWidth / 2));
    rail.castShadow = true;
    group.add(rail);

    // Lower horizontal rail
    const lowerRailGeo = new THREE.BoxGeometry(bridgeLength, railThickness, railThickness);
    const lowerRail = new THREE.Mesh(lowerRailGeo, woodDarkMat);
    lowerRail.position.set(0, deckY + railHeight * 0.45, side * (bridgeWidth / 2));
    lowerRail.castShadow = true;
    group.add(lowerRail);
  }

  // --- Support posts (vertical cylinders at the four corners) ---
  const postRadius = 0.1;
  const postHeight = deckY + railHeight + 0.1;

  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const postGeo = new THREE.CylinderGeometry(postRadius, postRadius, postHeight, 6);
      const post = new THREE.Mesh(postGeo, woodDarkMat);
      post.position.set(
        sx * (bridgeLength / 2 - 0.15),
        postHeight / 2 - 0.1,
        sz * (bridgeWidth / 2)
      );
      post.castShadow = true;
      group.add(post);
    }
  }

  // --- Under-bridge support beams ---
  const beamGeo = new THREE.CylinderGeometry(0.12, 0.12, bridgeWidth + 0.4, 6);
  beamGeo.rotateX(Math.PI / 2);

  for (const bx of [-bridgeLength / 3, 0, bridgeLength / 3]) {
    const beam = new THREE.Mesh(beamGeo, woodDarkMat);
    beam.position.set(bx, deckY - 0.15, 0);
    beam.castShadow = true;
    group.add(beam);
  }

  group.position.copy(position);

  return group;
}
