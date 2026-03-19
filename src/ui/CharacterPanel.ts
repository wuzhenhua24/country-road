import * as THREE from 'three';
import { Character } from '../entities/Character';
import { CHARACTER_SELECTION_DISTANCE } from '../config';

/** Radius of the bounding sphere used for coarse ray–character hit test. */
const CHARACTER_BOUNDS_RADIUS = 1.2;
/** Squared max distance from camera — characters beyond this are skipped. */
const MAX_RAY_DISTANCE_SQ = 80 * 80;

export class CharacterPanel {
  private panel: HTMLDivElement;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private selectedCharacter: Character | null = null;
  private characters: Character[] = [];
  private boundingSphere = new THREE.Sphere();

  constructor(private camera: THREE.PerspectiveCamera, private canvas: HTMLElement) {
    this.panel = document.createElement('div');
    this.panel.style.cssText = `
      position: fixed; bottom: 16px; right: 16px; z-index: 100;
      background: rgba(0,0,0,0.7); color: #fff; padding: 16px;
      border-radius: 8px; font-family: monospace; font-size: 13px;
      min-width: 200px; display: none; backdrop-filter: blur(4px);
    `;
    document.body.appendChild(this.panel);

    canvas.addEventListener('click', this.onClick.bind(this));
  }

  setCharacters(characters: Character[]): void {
    this.characters = characters;
  }

  private onClick(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const ray = this.raycaster.ray;
    const camPos = this.camera.position;

    // Phase 1: coarse filter — distance cull + bounding-sphere test per character
    const candidates: Character[] = [];
    for (const c of this.characters) {
      const distSq = camPos.distanceToSquared(c.position);
      if (distSq > MAX_RAY_DISTANCE_SQ) continue;

      this.boundingSphere.center.copy(c.position).y += 0.8; // centre at torso height
      this.boundingSphere.radius = CHARACTER_BOUNDS_RADIUS;
      if (ray.intersectsSphere(this.boundingSphere)) {
        candidates.push(c);
      }
    }

    // Phase 2: precise raycast only on candidates' meshes
    if (candidates.length > 0) {
      const meshes: THREE.Object3D[] = [];
      for (const c of candidates) {
        c.group.traverse(child => {
          if (child instanceof THREE.Mesh) {
            meshes.push(child);
          }
        });
      }

      const intersects = this.raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj) {
          if (obj.userData?.type === 'character') {
            this.selectCharacter(obj.userData.entity as Character);
            return;
          }
          obj = obj.parent;
        }
      }
    }

    // Fallback: find nearest character to click point on ground
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const clickPoint = new THREE.Vector3();
    const hit = ray.intersectPlane(groundPlane, clickPoint);

    if (hit) {
      let nearest: Character | null = null;
      let minDist = CHARACTER_SELECTION_DISTANCE;
      for (const c of this.characters) {
        const dist = clickPoint.distanceTo(c.position);
        if (dist < minDist) {
          minDist = dist;
          nearest = c;
        }
      }
      if (nearest) {
        this.selectCharacter(nearest);
        return;
      }
    }

    this.selectedCharacter = null;
    this.panel.style.display = 'none';
  }

  private selectCharacter(character: Character): void {
    this.selectedCharacter = character;
    this.panel.style.display = 'block';
    this.update();
  }

  update(): void {
    if (!this.selectedCharacter) return;

    const c = this.selectedCharacter;
    this.panel.innerHTML = `
      <div style="font-size:16px;font-weight:bold;margin-bottom:8px;">${c.name}</div>
      <div>Role: ${c.role}</div>
      <div>State: ${c.getStatusText()}</div>
      <div>Location: ${c.currentLocationId}</div>
      ${c.aiDecisionReason ? `<div style="margin-top:8px;opacity:0.8;font-style:italic;">"${c.aiDecisionReason}"</div>` : ''}
    `;
  }
}
