import * as THREE from 'three';
import { COLORS } from '../config';

/**
 * Creates a large flat low-poly terrain with vertex-colored grass
 * and subtle height variation for organic feel.
 */
export function createTerrain(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Terrain';

  const width = 100;
  const depth = 100;
  const segW = 30;
  const segD = 30;

  const geometry = new THREE.PlaneGeometry(width, depth, segW, segD);
  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position;
  const vertexCount = positions.count;

  // Prepare vertex colors
  const colors = new Float32Array(vertexCount * 3);

  const grassColor = new THREE.Color(COLORS.GROUND_GREEN);
  const grassDarkColor = new THREE.Color(COLORS.LEAF_DARK_GREEN);
  const dirtColor = new THREE.Color(COLORS.DIRT_BROWN);

  // Road parameters for dirt coloring
  const mainRoadHalfWidth = 1.8;
  const branchRoadHalfWidth = 1.5;

  const tmpColor = new THREE.Color();

  for (let i = 0; i < vertexCount; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i); // currently 0 after rotation — this is world Y
    const z = positions.getZ(i);

    // Slight random Y displacement for organic terrain (keep mostly flat)
    const displacement = Math.random() * 0.15;
    positions.setY(i, y + displacement);

    // Determine if vertex is near a road (dirt path area)
    const nearMainRoad = Math.abs(x) < mainRoadHalfWidth && z > -45 && z < 45;
    const nearBranchWest =
      Math.abs(z - 5) < branchRoadHalfWidth && x >= -30 && x <= 0;
    const nearBranchEast =
      Math.abs(z + 8) < branchRoadHalfWidth && x >= 0 && x <= 25;

    if (nearMainRoad || nearBranchWest || nearBranchEast) {
      // Dirt color near roads
      tmpColor.copy(dirtColor);
      tmpColor.lerp(grassDarkColor, Math.random() * 0.25);
    } else {
      // Grass with subtle random variation
      const t = Math.random();
      tmpColor.copy(grassColor).lerp(grassDarkColor, t * 0.5);
    }

    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    roughness: 0.9,
    metalness: 0.0,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.name = 'TerrainMesh';

  group.add(mesh);

  return group;
}
