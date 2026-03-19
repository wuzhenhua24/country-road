import * as THREE from 'three';
import { Character } from '../entities/Character';

export class CharacterPanel {
  private panel: HTMLDivElement;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private selectedCharacter: Character | null = null;
  private characters: Character[] = [];

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

    // Try raycasting against character meshes first
    const meshes: THREE.Object3D[] = [];
    for (const c of this.characters) {
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
          this.selectedCharacter = obj.userData.entity as Character;
          this.panel.style.display = 'block';
          this.update();
          return;
        }
        obj = obj.parent;
      }
    }

    // Fallback: find nearest character to click point on ground
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const clickPoint = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(groundPlane, clickPoint);

    if (clickPoint) {
      let nearest: Character | null = null;
      let minDist = 3; // max selection distance
      for (const c of this.characters) {
        const dist = clickPoint.distanceTo(c.position);
        if (dist < minDist) {
          minDist = dist;
          nearest = c;
        }
      }
      if (nearest) {
        this.selectedCharacter = nearest;
        this.panel.style.display = 'block';
        this.update();
        return;
      }
    }

    this.selectedCharacter = null;
    this.panel.style.display = 'none';
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
