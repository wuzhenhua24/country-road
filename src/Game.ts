import { SceneManager } from './renderer/SceneManager';
import { CameraController } from './renderer/CameraController';
import { LightingSystem } from './renderer/LightingSystem';
import { WorldBuilder } from './world/WorldBuilder';
import { TimeSystem } from './systems/TimeSystem';
import { HUD } from './ui/HUD';
import { NavigationGraph } from './systems/NavigationGraph';
import { CharacterFactory } from './entities/CharacterFactory';
import { MovementSystem } from './entities/MovementSystem';
import { Character } from './entities/Character';
import { Animal } from './entities/Animal';
import { FallbackBehavior } from './ai/FallbackBehavior';
import { CharacterPanel } from './ui/CharacterPanel';
import { AIDirector } from './ai/AIDirector';
import { navPoints } from './world/VillageLayout';

export class Game {
  private sceneManager: SceneManager;
  private cameraController: CameraController;
  private lightingSystem: LightingSystem;
  private timeSystem: TimeSystem;
  private hud: HUD;
  private navGraph: NavigationGraph;
  private movementSystem: MovementSystem;
  private fallbackBehavior: FallbackBehavior;
  private characterPanel: CharacterPanel;
  private aiDirector: AIDirector;
  private characters: Character[] = [];
  private animals: Animal[] = [];
  private lastTime = 0;

  constructor() {
    this.sceneManager = new SceneManager();
    this.cameraController = new CameraController(
      this.sceneManager.camera,
      this.sceneManager.renderer.domElement
    );
    this.lightingSystem = new LightingSystem(this.sceneManager.scene);
    this.timeSystem = new TimeSystem();
    this.hud = new HUD(this.timeSystem);
    this.navGraph = new NavigationGraph(navPoints);
    this.movementSystem = new MovementSystem();
    this.fallbackBehavior = new FallbackBehavior(this.navGraph);
    this.aiDirector = new AIDirector(this.navGraph);
    this.characterPanel = new CharacterPanel(
      this.sceneManager.camera,
      this.sceneManager.renderer.domElement
    );
  }

  init(): void {
    const worldBuilder = new WorldBuilder();
    const world = worldBuilder.build();
    this.sceneManager.scene.add(world);

    // Create characters and animals
    const factory = new CharacterFactory();
    this.characters = factory.createVillagers();
    this.animals = factory.createAnimals();

    for (const c of this.characters) {
      this.sceneManager.scene.add(c.group);
    }
    for (const a of this.animals) {
      this.sceneManager.scene.add(a.group);
    }

    this.characterPanel.setCharacters(this.characters);

    this.lastTime = performance.now();
    this.animate();
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Update systems
    this.timeSystem.update(delta);
    const gameHour = this.timeSystem.getHour() + this.timeSystem.getMinute() / 60;
    this.lightingSystem.update(gameHour);
    this.cameraController.update();
    this.hud.update();

    // AI decisions (async, non-blocking)
    this.aiDirector.update(this.characters, this.timeSystem);

    // Update character behaviors and movement
    for (const c of this.characters) {
      this.fallbackBehavior.update(c, this.timeSystem);
      this.movementSystem.update(c, delta);
      c.update(delta);
    }
    for (const a of this.animals) {
      this.fallbackBehavior.updateAnimal(a, this.timeSystem);
      this.movementSystem.updateAnimal(a, delta);
      a.update(delta);
    }

    this.characterPanel.update();
    this.sceneManager.render();
  };
}
