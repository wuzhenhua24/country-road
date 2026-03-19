import * as THREE from 'three';
import { COLORS } from '../config';

/**
 * Creates dirt road segments connecting key village locations.
 * Roads are flat planes slightly above the terrain.
 */
export function createRoads(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Roads';

  const roadY = 0.02; // slightly above terrain
  const roadWidth = 2.5;

  /**
   * Create a single road segment given center position, length, width, and rotation.
   */
  function makeRoadSegment(
    cx: number,
    cz: number,
    length: number,
    width: number,
    rotationY: number = 0
  ): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(length, width, Math.ceil(length / 2), 1);
    geo.rotateX(-Math.PI / 2);

    // Add subtle vertex color variation for a dirt look
    const positions = geo.attributes.position;
    const count = positions.count;
    const colors = new Float32Array(count * 3);
    const baseColor = new THREE.Color(COLORS.DIRT_BROWN);
    const darkColor = new THREE.Color(COLORS.DIRT_DARK);
    const tmpColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const t = Math.random() * 0.3;
      tmpColor.copy(baseColor).lerp(darkColor, t);
      colors[i * 3] = tmpColor.r;
      colors[i * 3 + 1] = tmpColor.g;
      colors[i * 3 + 2] = tmpColor.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.95,
      metalness: 0.0,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cx, roadY, cz);
    mesh.rotation.y = rotationY;
    mesh.receiveShadow = true;
    mesh.name = 'RoadSegment';
    return mesh;
  }

  // --- Main road: runs north-south through village center (along Z axis) ---
  // x ~ 0, from z = -40 to z = 40
  group.add(makeRoadSegment(0, 0, roadWidth, 80));

  // --- West branch road: from center towards west buildings ---
  // Goes along x-axis from x=0 to x=-25, at z ~ 5
  group.add(makeRoadSegment(-12.5, 5, 25, roadWidth, Math.PI / 2));

  // --- East branch road: from center towards east buildings ---
  // Goes along x-axis from x=0 to x=20, at z ~ -8
  group.add(makeRoadSegment(10, -8, 20, roadWidth, Math.PI / 2));

  // --- Small connecting path to southern area ---
  group.add(makeRoadSegment(-8, -20, 16, roadWidth * 0.8, Math.PI / 2));

  // --- Path towards northern fields ---
  group.add(makeRoadSegment(6, 25, 12, roadWidth * 0.8, Math.PI / 2));

  return group;
}
