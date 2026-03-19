import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CAMERA } from '../config';

export class CameraController {
  public readonly controls: OrbitControls;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.controls = new OrbitControls(camera, domElement);

    // Target
    this.controls.target.set(0, 0, 0);

    // Distance limits
    this.controls.minDistance = 10;
    this.controls.maxDistance = 80;

    // Prevent camera from going underground
    this.controls.maxPolarAngle = Math.PI / 2.2;

    // Smooth damping
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Set initial camera position from config
    camera.position.copy(CAMERA.INITIAL_POSITION);
    this.controls.update();
  }

  /** Must be called every frame for damping to work. */
  public update(): void {
    this.controls.update();
  }

  /** Clean up controls. */
  public dispose(): void {
    this.controls.dispose();
  }
}
