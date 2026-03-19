import * as THREE from 'three';
import { COLORS } from '../../config';

const POST_SPACING = 1.5;
const POST_HEIGHT = 1.0;
const POST_RADIUS = 0.06;
const RAIL_HEIGHT_LOW = 0.35;
const RAIL_HEIGHT_HIGH = 0.7;
const RAIL_THICKNESS = 0.05;

/**
 * Create a wooden fence spanning the given number of segments.
 * Each segment is ~1.5 units long.
 * @param length Number of fence segments.
 * @param direction Axis along which the fence extends ('x' or 'z').
 */
export function createFence(length: number, direction: 'x' | 'z' = 'x'): THREE.Group {
  const group = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({
    color: COLORS.FENCE_WOOD,
    flatShading: true,
  });

  const postCount = length + 1;

  // Posts
  for (let i = 0; i < postCount; i++) {
    const postGeo = new THREE.CylinderGeometry(POST_RADIUS, POST_RADIUS, POST_HEIGHT, 5);
    const post = new THREE.Mesh(postGeo, mat);
    const offset = i * POST_SPACING;

    if (direction === 'x') {
      post.position.set(offset, POST_HEIGHT / 2, 0);
    } else {
      post.position.set(0, POST_HEIGHT / 2, offset);
    }

    post.castShadow = true;
    post.receiveShadow = true;
    group.add(post);
  }

  // Horizontal rails between posts
  for (let i = 0; i < length; i++) {
    const railLength = POST_SPACING;
    const railGeo = new THREE.BoxGeometry(
      direction === 'x' ? railLength : RAIL_THICKNESS,
      RAIL_THICKNESS,
      direction === 'z' ? railLength : RAIL_THICKNESS,
    );

    const midOffset = (i + 0.5) * POST_SPACING;

    for (const railY of [RAIL_HEIGHT_LOW, RAIL_HEIGHT_HIGH]) {
      const rail = new THREE.Mesh(railGeo, mat);

      if (direction === 'x') {
        rail.position.set(midOffset, railY, 0);
      } else {
        rail.position.set(0, railY, midOffset);
      }

      rail.castShadow = true;
      rail.receiveShadow = true;
      group.add(rail);
    }
  }

  return group;
}
