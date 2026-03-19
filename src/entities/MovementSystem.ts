import * as THREE from 'three';
import { Entity } from './Entity';
import { Character } from './Character';
import { Animal } from './Animal';
import { ROTATION_SPEED, FACING_THRESHOLD } from '../config';

export class MovementSystem {
  private tempVec = new THREE.Vector3();

  update(character: Character, delta: number): void {
    if (!character.isMoving()) return;

    if (character.hasReachedTarget()) {
      if (!character.advancePath()) {
        character.currentLocationId = character.targetLocationId ?? character.currentLocationId;
        character.targetLocationId = null;
        if (character.state === 'walking') {
          character.setState('idle');
        }
        return;
      }
    }

    this.moveToward(character, delta);
  }

  updateAnimal(animal: Animal, delta: number): void {
    if (!animal.isMoving()) return;

    if (animal.hasReachedTarget()) {
      if (!animal.advancePath()) {
        animal.currentLocationId = animal.targetLocationId ?? animal.currentLocationId;
        animal.targetLocationId = null;
        if (animal.state === 'walking') {
          animal.state = 'idle';
        }
        return;
      }
    }

    this.moveToward(animal, delta);
  }

  private moveToward(entity: Entity, delta: number): void {
    const target = entity.targetPosition;
    if (!target) return;

    this.tempVec.copy(target).sub(entity.position);
    this.tempVec.y = 0;
    const dist = this.tempVec.length();

    if (dist > FACING_THRESHOLD) {
      // Face movement direction
      const angle = Math.atan2(this.tempVec.x, this.tempVec.z);
      const currentAngle = entity.group.rotation.y;
      let angleDiff = angle - currentAngle;
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      entity.group.rotation.y += angleDiff * Math.min(1, ROTATION_SPEED * delta);

      // Move
      this.tempVec.normalize().multiplyScalar(entity.speed * delta);
      if (this.tempVec.length() > dist) {
        entity.position.copy(target);
        entity.position.y = 0;
      } else {
        entity.position.add(this.tempVec);
        entity.position.y = 0;
      }
    }
  }
}
