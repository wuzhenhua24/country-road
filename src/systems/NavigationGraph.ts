import * as THREE from 'three';
import { NavPoint } from '../world/VillageLayout';

export class NavigationGraph {
  private points = new Map<string, NavPoint>();

  constructor(navPoints: NavPoint[]) {
    for (const p of navPoints) {
      this.points.set(p.id, p);
    }
  }

  getPoint(id: string): NavPoint | undefined {
    return this.points.get(id);
  }

  getPosition(id: string): THREE.Vector3 | undefined {
    return this.points.get(id)?.position;
  }

  getAllPoints(): NavPoint[] {
    return Array.from(this.points.values());
  }

  getRandomPointId(): string {
    const ids = Array.from(this.points.keys());
    return ids[Math.floor(Math.random() * ids.length)];
  }

  findPath(fromId: string, toId: string): string[] {
    if (fromId === toId) return [fromId];

    const visited = new Set<string>();
    const queue: string[][] = [[fromId]];
    visited.add(fromId);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];
      const node = this.points.get(current);
      if (!node) continue;

      for (const neighbor of node.connections) {
        if (neighbor === toId) {
          return [...path, neighbor];
        }
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }

    // No path found, return direct
    return [fromId, toId];
  }

  getPositionsForPath(pathIds: string[]): THREE.Vector3[] {
    return pathIds
      .map(id => this.points.get(id)?.position)
      .filter((p): p is THREE.Vector3 => p !== undefined);
  }

  findNearestPoint(position: THREE.Vector3): string {
    let nearest = '';
    let minDist = Infinity;
    for (const [id, point] of this.points) {
      const dist = position.distanceTo(point.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = id;
      }
    }
    return nearest;
  }
}
