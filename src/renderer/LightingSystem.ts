import * as THREE from 'three';
import { COLORS, SHADOW, DAY_CYCLE } from '../config';

// ── Helper: smoothstep for natural transitions ─────────────────────────────
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// ── Pre-built color objects to avoid per-frame allocations ─────────────────
const _sunColor = new THREE.Color();
const _ambientColor = new THREE.Color();
const _bgColor = new THREE.Color();
const _tmpA = new THREE.Color();
const _tmpB = new THREE.Color();

const COLOR_SKY_BLUE = new THREE.Color(COLORS.SKY_BLUE);
const COLOR_DAWN_PINK = new THREE.Color(COLORS.DAWN_PINK);
const COLOR_DUSK_ORANGE = new THREE.Color(COLORS.DUSK_ORANGE);
const COLOR_NIGHT_DARK = new THREE.Color(COLORS.NIGHT_DARK);
const COLOR_SUN_WARM = new THREE.Color(COLORS.SUN_WARM);
const COLOR_SUN_NOON = new THREE.Color(COLORS.SUN_NOON);
const COLOR_SUN_DAWN = new THREE.Color(COLORS.SUN_DAWN);

export class LightingSystem {
  public readonly sunLight: THREE.DirectionalLight;
  public readonly ambientLight: THREE.AmbientLight;
  public readonly hemiLight: THREE.HemisphereLight;

  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // ── Directional (sun) light ──────────────────────────────────────────
    this.sunLight = new THREE.DirectionalLight(COLORS.SUN_NOON, 1.2);
    this.sunLight.castShadow = true;

    const shadow = this.sunLight.shadow;
    shadow.mapSize.width = SHADOW.MAP_SIZE;
    shadow.mapSize.height = SHADOW.MAP_SIZE;
    shadow.camera.left = -SHADOW.CAMERA_SIZE;
    shadow.camera.right = SHADOW.CAMERA_SIZE;
    shadow.camera.top = SHADOW.CAMERA_SIZE;
    shadow.camera.bottom = -SHADOW.CAMERA_SIZE;
    shadow.camera.near = SHADOW.CAMERA_NEAR;
    shadow.camera.far = SHADOW.CAMERA_FAR;
    shadow.bias = SHADOW.BIAS;

    scene.add(this.sunLight);

    // ── Ambient light ────────────────────────────────────────────────────
    this.ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(this.ambientLight);

    // ── Hemisphere light (sky → ground bounce) ───────────────────────────
    this.hemiLight = new THREE.HemisphereLight(
      COLORS.SKY_BLUE,        // sky color
      COLORS.GROUND_GREEN,    // ground color
      0.4,
    );
    scene.add(this.hemiLight);
  }

  /**
   * Update all lights and sky color based on the current in-game hour (0-24).
   */
  public update(gameHour: number): void {
    const { DAWN_START, DAWN_END, DUSK_START, DUSK_END, SUN_ORBIT_RADIUS } =
      DAY_CYCLE;

    // ── Sun position (arc from east → overhead → west) ───────────────────
    // Map 6:00 → 18:00 across a 0→PI arc (east horizon → west horizon).
    const sunAngle = ((gameHour - 6) / 12) * Math.PI;
    const sunX = Math.cos(sunAngle) * SUN_ORBIT_RADIUS;
    const sunY = Math.sin(sunAngle) * SUN_ORBIT_RADIUS;
    const sunZ = 0;
    this.sunLight.position.set(sunX, Math.max(sunY, -5), sunZ);

    // ── Daytime factor (0 = full night, 1 = full day) ────────────────────
    let dayFactor: number;
    if (gameHour >= DAWN_END && gameHour <= DUSK_START) {
      dayFactor = 1; // full day
    } else if (gameHour >= DAWN_START && gameHour < DAWN_END) {
      dayFactor = smoothstep(DAWN_START, DAWN_END, gameHour);
    } else if (gameHour > DUSK_START && gameHour <= DUSK_END) {
      dayFactor = 1 - smoothstep(DUSK_START, DUSK_END, gameHour);
    } else {
      dayFactor = 0; // night
    }

    // ── Twilight factor (peaks at dawn / dusk) ───────────────────────────
    const dawnTwilight =
      smoothstep(DAWN_START, (DAWN_START + DAWN_END) / 2, gameHour) *
      (1 - smoothstep((DAWN_START + DAWN_END) / 2, DAWN_END, gameHour));
    const duskTwilight =
      smoothstep(DUSK_START, (DUSK_START + DUSK_END) / 2, gameHour) *
      (1 - smoothstep((DUSK_START + DUSK_END) / 2, DUSK_END, gameHour));
    const twilightFactor = Math.max(dawnTwilight, duskTwilight);

    // ── Sun color: warm at twilight, white at noon ───────────────────────
    _sunColor.copy(COLOR_SUN_NOON);
    if (twilightFactor > 0) {
      const tintColor = dawnTwilight > duskTwilight ? COLOR_SUN_DAWN : COLOR_SUN_WARM;
      _sunColor.lerp(tintColor, twilightFactor);
    }
    this.sunLight.color.copy(_sunColor);
    this.sunLight.intensity = THREE.MathUtils.lerp(0.05, 1.2, dayFactor);

    // ── Ambient light ────────────────────────────────────────────────────
    _ambientColor.set(0x404060).lerp(new THREE.Color(0x808090), dayFactor);
    this.ambientLight.color.copy(_ambientColor);
    this.ambientLight.intensity = THREE.MathUtils.lerp(0.15, 0.5, dayFactor);

    // ── Hemisphere light tracks time of day ──────────────────────────────
    this.hemiLight.intensity = THREE.MathUtils.lerp(0.1, 0.4, dayFactor);

    // ── Scene background / fog color ─────────────────────────────────────
    // Blend between: night → dawn pink → day blue → dusk orange → night
    _bgColor.copy(COLOR_NIGHT_DARK);
    _bgColor.lerp(COLOR_SKY_BLUE, dayFactor);

    if (dawnTwilight > 0) {
      _tmpA.copy(_bgColor);
      _bgColor.copy(_tmpA).lerp(COLOR_DAWN_PINK, dawnTwilight * 0.6);
    }
    if (duskTwilight > 0) {
      _tmpB.copy(_bgColor);
      _bgColor.copy(_tmpB).lerp(COLOR_DUSK_ORANGE, duskTwilight * 0.6);
    }

    (this.scene.background as THREE.Color).copy(_bgColor);
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.color.copy(_bgColor);
    }
  }

  /** Remove lights from the scene. */
  public dispose(): void {
    this.scene.remove(this.sunLight);
    this.scene.remove(this.ambientLight);
    this.scene.remove(this.hemiLight);
  }
}
