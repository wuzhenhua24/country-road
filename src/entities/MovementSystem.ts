import * as THREE from 'three';
import { Character } from './Character';
import { Animal } from './Animal';
import { ROTATION_SPEED } from '../config';

export class MovementSystem {
  private tempVec = new THREE.Vector3();

  update(character: Character, delta: number): void {
    if (!character.isMoving()) return;

    if (character.hasReachedTarget()) {
      if (!character.advancePath()) {
        // Arrived at final destination
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

    this.moveAnimalToward(animal, delta);
  }

  private moveToward(entity: Character, delta: number): void {
    const target = entity['targetPosition'];
    if (!target) return;

    this.tempVec.copy(target).sub(entity.position);
    this.tempVec.y = 0;
    const dist = this.tempVec.length();

    if (dist > 0.1) {
      // Face movement direction
      const angle = Math.atan2(this.tempVec.x, this.tempVec.z);
      const currentAngle = entity.group.rotation.y;
      let angleDiff = angle - currentAngle;
      // Normalize angle difference
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      entity.group.rotation.y += angleDiff * Math.min(1, ROTATION_SPEED * delta);

      // Move
      this.tempVec.normalize().multiplyScalar(entity['speed'] * delta);
      if (this.tempVec.length() > dist) {
        entity.position.copy(target);
        entity.position.y = 0;
      } else {
        entity.position.add(this.tempVec);
        entity.position.y = 0;
      }
    }
  }

  private moveAnimalToward(entity: Animal, delta: number): void {
    const target = entity['targetPosition'];
    if (!target) return;

    this.tempVec.copy(target).sub(entity.position);
    this.tempVec.y = 0;
    const dist = this.tempVec.length();

    if (dist > 0.1) {
      const angle = Math.atan2(this.tempVec.x, this.tempVec.z);
      const currentAngle = entity.group.rotation.y;
      let angleDiff = angle - currentAngle;
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      entity.group.rotation.y += angleDiff * Math.min(1, ROTATION_SPEED * delta);

      this.tempVec.normalize().multiplyScalar(entity['speed'] * delta);
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
