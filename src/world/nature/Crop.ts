import * as THREE from 'three';
import { COLORS } from '../../config';

const CELL_SIZE = 0.8;

/**
 * Create a crop field arranged as a rows x cols grid.
 * Each cell contains a small crop plant on a dirt mound.
 */
export function createCropField(rows: number, cols: number): THREE.Group {
  const group = new THREE.Group();

  const fieldWidth = cols * CELL_SIZE;
  const fieldDepth = rows * CELL_SIZE;

  // Dirt ground plane
  const groundGeo = new THREE.BoxGeometry(fieldWidth, 0.08, fieldDepth);
  const groundMat = new THREE.MeshStandardMaterial({
    color: COLORS.DIRT_BROWN,
    flatShading: true,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.set(fieldWidth / 2 - CELL_SIZE / 2, -0.02, fieldDepth / 2 - CELL_SIZE / 2);
  ground.castShadow = true;
  ground.receiveShadow = true;
  group.add(ground);

  // Shared materials
  const wheatMat = new THREE.MeshStandardMaterial({
    color: COLORS.WHEAT_GOLD,
    flatShading: true,
  });
  const vegMat = new THREE.MeshStandardMaterial({
    color: COLORS.CROP_GREEN,
    flatShading: true,
  });
  const stalkMat = new THREE.MeshStandardMaterial({
    color: COLORS.CROP_GREEN,
    flatShading: true,
  });
  const dirtMat = new THREE.MeshStandardMaterial({
    color: COLORS.DIRT_BROWN,
    flatShading: true,
  });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * CELL_SIZE;
      const cz = r * CELL_SIZE;

      // Small dirt mound per cell
      const moundGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.08, 6);
      const mound = new THREE.Mesh(moundGeo, dirtMat);
      mound.position.set(cx, 0.04, cz);
      mound.castShadow = true;
      mound.receiveShadow = true;
      group.add(mound);

      // Decide crop type: roughly 50/50 wheat vs vegetable
      const isWheat = Math.random() > 0.5;

      // Random height variation
      const heightScale = 0.8 + Math.random() * 0.4;
      const stalkHeight = 0.3 * heightScale;
      const jitterX = (Math.random() - 0.5) * 0.1;
      const jitterZ = (Math.random() - 0.5) * 0.1;

      // Stalk
      const stalkGeo = new THREE.CylinderGeometry(0.02, 0.02, stalkHeight, 4);
      const stalk = new THREE.Mesh(stalkGeo, stalkMat);
      stalk.position.set(cx + jitterX, 0.08 + stalkHeight / 2, cz + jitterZ);
      stalk.castShadow = true;
      stalk.receiveShadow = true;
      group.add(stalk);

      // Crop top
      if (isWheat) {
        // Wheat: small cone pointing up (golden)
        const topGeo = new THREE.ConeGeometry(0.06, 0.15 * heightScale, 4);
        const top = new THREE.Mesh(topGeo, wheatMat);
        top.position.set(cx + jitterX, 0.08 + stalkHeight + 0.06, cz + jitterZ);
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
      } else {
        // Vegetable: small box (green)
        const topSize = 0.08 * heightScale;
        const topGeo = new THREE.BoxGeometry(topSize, topSize, topSize);
        const top = new THREE.Mesh(topGeo, vegMat);
        top.position.set(cx + jitterX, 0.08 + stalkHeight + 0.03, cz + jitterZ);
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
      }
    }
  }

  return group;
}
