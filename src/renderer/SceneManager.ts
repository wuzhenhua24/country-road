import * as THREE from 'three';
import { COLORS, CAMERA, FOG } from '../config';

export class SceneManager {
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly renderer: THREE.WebGLRenderer;

  constructor(canvas?: HTMLCanvasElement) {
    // ── Scene ────────────────────────────────────────────────────────────
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.SKY_BLUE);
    this.scene.fog = new THREE.Fog(COLORS.SKY_BLUE, FOG.NEAR, FOG.FAR);

    // ── Camera ───────────────────────────────────────────────────────────
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(
      CAMERA.FOV,
      aspect,
      CAMERA.NEAR,
      CAMERA.FAR,
    );
    this.camera.position.copy(CAMERA.INITIAL_POSITION);
    this.camera.lookAt(0, 0, 0);

    // ── Renderer ─────────────────────────────────────────────────────────
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Append to DOM
    if (!canvas) {
      const container = document.getElementById('app');
      if (container) {
        container.appendChild(this.renderer.domElement);
      } else {
        document.body.appendChild(this.renderer.domElement);
      }
    }

    // ── Resize ───────────────────────────────────────────────────────────
    window.addEventListener('resize', this.onResize);
  }

  private onResize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  /** Called each frame with delta time (seconds). */
  public update(_delta: number): void {
    // Reserved for future per-frame scene updates (particles, animations, etc.)
  }

  /** Render the scene from the active camera. */
  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /** Clean up event listeners when no longer needed. */
  public dispose(): void {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
