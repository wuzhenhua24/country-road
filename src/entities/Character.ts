import * as THREE from 'three';
import { Entity } from './Entity';
import { COLORS } from '../config';

export type CharacterRole = 'farmer' | 'craftsman' | 'elder' | 'child';
export type CharacterState = 'idle' | 'walking' | 'working' | 'eating' | 'sleeping' | 'socializing';

export interface CharacterConfig {
  name: string;
  role: CharacterRole;
  homeId: string; // nav point id
  workId: string; // nav point id
}

export class Character extends Entity {
  readonly name: string;
  readonly role: CharacterRole;
  readonly homeId: string;
  readonly workId: string;
  state: CharacterState = 'idle';
  currentLocationId: string;
  targetLocationId: string | null = null;
  stateTimer = 0;
  aiDecisionReason = '';

  // Animation
  private walkCycle = 0;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;

  constructor(config: CharacterConfig) {
    super();
    this.name = config.name;
    this.role = config.role;
    this.homeId = config.homeId;
    this.workId = config.workId;
    this.currentLocationId = config.homeId;
    this.speed = config.role === 'child' ? 2.5 : 2;

    const { leftArm, rightArm, leftLeg, rightLeg } = this.buildModel();
    this.leftArm = leftArm;
    this.rightArm = rightArm;
    this.leftLeg = leftLeg;
    this.rightLeg = rightLeg;

    this.group.userData = { type: 'character', entity: this };
  }

  private getRoleColor(): number {
    switch (this.role) {
      case 'farmer': return COLORS.farmerGreen;
      case 'craftsman': return COLORS.craftsmanBrown;
      case 'child': return COLORS.childRed;
      case 'elder': return COLORS.elderPurple;
    }
  }

  private buildModel() {
    const roleColor = this.getRoleColor();
    const isChild = this.role === 'child';
    const scale = isChild ? 0.7 : 1;
    const mat = (color: number) => new THREE.MeshStandardMaterial({ color, flatShading: true });

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.25 * scale, 6, 4),
      mat(COLORS.skinLight)
    );
    head.position.y = 1.5 * scale;
    head.castShadow = true;

    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.5 * scale, 0.6 * scale, 0.3 * scale),
      mat(roleColor)
    );
    body.position.y = 1.0 * scale;
    body.castShadow = true;

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.08 * scale, 0.08 * scale, 0.5 * scale);
    const leftArm = new THREE.Mesh(armGeo, mat(roleColor));
    leftArm.position.set(-0.35 * scale, 1.0 * scale, 0);
    leftArm.castShadow = true;

    const rightArm = new THREE.Mesh(armGeo, mat(roleColor));
    rightArm.position.set(0.35 * scale, 1.0 * scale, 0);
    rightArm.castShadow = true;

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.09 * scale, 0.09 * scale, 0.5 * scale);
    const legMat = mat(0x444466);
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.12 * scale, 0.4 * scale, 0);
    leftLeg.castShadow = true;

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.12 * scale, 0.4 * scale, 0);
    rightLeg.castShadow = true;

    this.group.add(head, body, leftArm, rightArm, leftLeg, rightLeg);
    return { leftArm, rightArm, leftLeg, rightLeg };
  }

  update(delta: number): void {
    this.stateTimer += delta;

    // Walk animation
    if (this.state === 'walking' && this.isMoving()) {
      this.walkCycle += delta * 8;
      const swing = Math.sin(this.walkCycle) * 0.4;
      this.leftArm.rotation.x = swing;
      this.rightArm.rotation.x = -swing;
      this.leftLeg.rotation.x = -swing;
      this.rightLeg.rotation.x = swing;
    } else {
      // Reset to idle pose
      this.leftArm.rotation.x *= 0.9;
      this.rightArm.rotation.x *= 0.9;
      this.leftLeg.rotation.x *= 0.9;
      this.rightLeg.rotation.x *= 0.9;
    }
  }

  setState(state: CharacterState): void {
    if (this.state !== state) {
      this.state = state;
      this.stateTimer = 0;
    }
  }

  getStatusText(): string {
    const stateLabels: Record<CharacterState, string> = {
      idle: 'Standing around',
      walking: `Walking to ${this.targetLocationId ?? '...'}`,
      working: 'Working',
      eating: 'Eating',
      sleeping: 'Sleeping',
      socializing: 'Chatting',
    };
    return stateLabels[this.state];
  }
}
