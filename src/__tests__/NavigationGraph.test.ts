import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { NavigationGraph } from '../systems/NavigationGraph';
import { NavPoint } from '../world/VillageLayout';

function makePoint(id: string, x: number, z: number, connections: string[]): NavPoint {
  return { id, position: new THREE.Vector3(x, 0, z), label: id, connections };
}

// A ─ B ─ C
//         |
//         D
const points: NavPoint[] = [
  makePoint('A', 0, 0, ['B']),
  makePoint('B', 5, 0, ['A', 'C']),
  makePoint('C', 10, 0, ['B', 'D']),
  makePoint('D', 10, 5, ['C']),
];

describe('NavigationGraph', () => {
  const nav = new NavigationGraph(points);

  it('returns a point by id', () => {
    const p = nav.getPoint('A');
    expect(p).toBeDefined();
    expect(p!.id).toBe('A');
  });

  it('returns undefined for unknown id', () => {
    expect(nav.getPoint('Z')).toBeUndefined();
  });

  it('returns position for a known id', () => {
    const pos = nav.getPosition('B');
    expect(pos).toBeDefined();
    expect(pos!.x).toBe(5);
  });

  it('getAllPoints returns all points', () => {
    expect(nav.getAllPoints()).toHaveLength(4);
  });

  it('getRandomPointId returns a valid id', () => {
    const id = nav.getRandomPointId();
    expect(nav.getPoint(id)).toBeDefined();
  });

  // ── findPath (BFS) ──────────────────────────────────────────────────────

  it('returns single-element path when from === to', () => {
    expect(nav.findPath('A', 'A')).toEqual(['A']);
  });

  it('finds direct neighbor path', () => {
    expect(nav.findPath('A', 'B')).toEqual(['A', 'B']);
  });

  it('finds multi-hop shortest path A→D', () => {
    const path = nav.findPath('A', 'D');
    expect(path).toEqual(['A', 'B', 'C', 'D']);
  });

  it('finds path in reverse direction D→A', () => {
    const path = nav.findPath('D', 'A');
    expect(path).toEqual(['D', 'C', 'B', 'A']);
  });

  it('returns fallback [from, to] when no real path exists', () => {
    const isolated = new NavigationGraph([
      makePoint('X', 0, 0, []),
      makePoint('Y', 5, 0, []),
    ]);
    expect(isolated.findPath('X', 'Y')).toEqual(['X', 'Y']);
  });

  // ── getPositionsForPath ────────────────────────────────────────────────

  it('converts path ids to positions, skipping unknown ids', () => {
    const positions = nav.getPositionsForPath(['A', 'UNKNOWN', 'C']);
    expect(positions).toHaveLength(2);
    expect(positions[0].x).toBe(0);
    expect(positions[1].x).toBe(10);
  });

  // ── findNearestPoint ──────────────────────────────────────────────────

  it('finds the nearest navigation point to a position', () => {
    const near = nav.findNearestPoint(new THREE.Vector3(9, 0, 4));
    expect(near).toBe('D'); // D is at (10, 0, 5)
  });

  it('returns exact match when position is on a point', () => {
    const near = nav.findNearestPoint(new THREE.Vector3(5, 0, 0));
    expect(near).toBe('B');
  });
});
