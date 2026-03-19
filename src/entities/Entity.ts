import * as THREE from 'three';

export abstract class Entity {
  group = new THREE.Group();
  velocity = new THREE.Vector3();
  protected targetPosition: THREE.Vector3 | null = null;
  protected path: THREE.Vector3[] = [];
  protected pathIndex = 0;
  protected speed = 2;

  get position(): THREE.Vector3 {
    return this.group.position;
  }

  setPath(positions: THREE.Vector3[]): void {
    this.path = positions;
    this.pathIndex = 0;
    if (positions.length > 0) {
      this.targetPosition = positions[0];
    }
  }

  hasReachedTarget(): boolean {
    if (!this.targetPosition) return true;
    const dist = this.group.position.distanceTo(this.targetPosition);
    return dist < 0.3;
  }

  isMoving(): boolean {
    return this.targetPosition !== null;
  }

  advancePath(): boolean {
    this.pathIndex++;
    if (this.pathIndex < this.path.length) {
      this.targetPosition = this.path[this.pathIndex];
      return true;
    }
    this.targetPosition = null;
    return false;
  }

  abstract update(delta: number): void;
}
