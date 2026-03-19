import * as THREE from 'three';
import { Entity } from './Entity';
import { COLORS, ANIMAL_WALK_CYCLE_SPEED, ANIMAL_LEG_SWING, IDLE_POSE_DECAY } from '../config';

export type AnimalType = 'cow' | 'chicken' | 'sheep' | 'pig';
export type AnimalState = 'idle' | 'walking' | 'grazing' | 'sleeping';

export class Animal extends Entity {
  readonly animalType: AnimalType;
  state: AnimalState = 'idle';
  stateTimer = 0;
  currentLocationId: string;
  targetLocationId: string | null = null;
  private walkCycle = 0;
  private legs: THREE.Mesh[] = [];

  constructor(type: AnimalType, locationId: string) {
    super();
    this.animalType = type;
    this.currentLocationId = locationId;
    this.speed = 1;
    this.buildModel();
    this.group.userData = { type: 'animal', entity: this };
  }

  private buildModel(): void {
    const mat = (color: number) => new THREE.MeshStandardMaterial({ color, flatShading: true });

    switch (this.animalType) {
      case 'cow': this.buildCow(mat); break;
      case 'chicken': this.buildChicken(mat); break;
      case 'sheep': this.buildSheep(mat); break;
      case 'pig': this.buildPig(mat); break;
    }
  }

  private buildCow(mat: (c: number) => THREE.MeshStandardMaterial): void {
    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.7, 0.6),
      mat(COLORS.cowWhite)
    );
    body.position.y = 0.7;
    body.castShadow = true;

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.4),
      mat(COLORS.cowBrown)
    );
    head.position.set(0.7, 0.9, 0);
    head.castShadow = true;

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5);
    const legMat = mat(COLORS.cowBrown);
    const positions = [[-0.35, 0.25, 0.2], [-0.35, 0.25, -0.2], [0.35, 0.25, 0.2], [0.35, 0.25, -0.2]];
    for (const [x, y, z] of positions) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      this.legs.push(leg);
      this.group.add(leg);
    }

    this.group.add(body, head);
  }

  private buildChicken(mat: (c: number) => THREE.MeshStandardMaterial): void {
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 6, 4),
      mat(COLORS.chickenWhite)
    );
    body.position.y = 0.3;
    body.castShadow = true;

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 5, 3),
      mat(COLORS.chickenWhite)
    );
    head.position.set(0.18, 0.45, 0);

    // Comb
    const comb = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.08, 0.06),
      mat(COLORS.chickenRed)
    );
    comb.position.set(0.18, 0.55, 0);

    // Beak
    const beak = new THREE.Mesh(
      new THREE.ConeGeometry(0.03, 0.08, 4),
      mat(0xdd9900)
    );
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(0.28, 0.44, 0);

    this.group.add(body, head, comb, beak);
  }

  private buildSheep(mat: (c: number) => THREE.MeshStandardMaterial): void {
    const body = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.4, 0),
      mat(COLORS.sheepWhite)
    );
    body.position.y = 0.55;
    body.castShadow = true;

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.25, 0.2),
      mat(0x333333)
    );
    head.position.set(0.4, 0.6, 0);
    head.castShadow = true;

    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35);
    const legMat = mat(0x333333);
    const positions = [[-0.15, 0.2, 0.12], [-0.15, 0.2, -0.12], [0.15, 0.2, 0.12], [0.15, 0.2, -0.12]];
    for (const [x, y, z] of positions) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      this.legs.push(leg);
      this.group.add(leg);
    }

    this.group.add(body, head);
  }

  private buildPig(mat: (c: number) => THREE.MeshStandardMaterial): void {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.4, 0.4),
      mat(COLORS.pigPink)
    );
    body.position.y = 0.4;
    body.castShadow = true;

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.3, 0.3),
      mat(COLORS.pigPink)
    );
    head.position.set(0.45, 0.45, 0);

    // Snout
    const snout = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.06, 6),
      mat(0xd08080)
    );
    snout.rotation.z = Math.PI / 2;
    snout.position.set(0.6, 0.42, 0);

    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25);
    const legMat = mat(0xd08080);
    const positions = [[-0.2, 0.15, 0.12], [-0.2, 0.15, -0.12], [0.2, 0.15, 0.12], [0.2, 0.15, -0.12]];
    for (const [x, y, z] of positions) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      this.legs.push(leg);
      this.group.add(leg);
    }

    this.group.add(body, head, snout);
  }

  update(delta: number): void {
    this.stateTimer += delta;

    if (this.state === 'walking' && this.isMoving()) {
      this.walkCycle += delta * ANIMAL_WALK_CYCLE_SPEED;
      const swing = Math.sin(this.walkCycle) * ANIMAL_LEG_SWING;
      for (let i = 0; i < this.legs.length; i++) {
        this.legs[i].rotation.x = (i % 2 === 0 ? swing : -swing);
      }
    } else {
      for (const leg of this.legs) {
        leg.rotation.x *= IDLE_POSE_DECAY;
      }
    }
  }
}
