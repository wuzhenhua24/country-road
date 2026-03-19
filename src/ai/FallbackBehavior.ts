import { Character } from '../entities/Character';
import { Animal } from '../entities/Animal';
import { NavigationGraph } from '../systems/NavigationGraph';
import { TimeSystem, DayPhase } from '../systems/TimeSystem';

export class FallbackBehavior {
  constructor(private navGraph: NavigationGraph) {}

  update(character: Character, time: TimeSystem): void {
    // Don't interrupt active movement
    if (character.isMoving()) return;

    const phase = time.getDayPhase();
    const timeSinceStateChange = character.stateTimer;

    // Minimum time in current state before considering a change
    if (timeSinceStateChange < 3) return;

    switch (phase) {
      case 'dawn':
        this.handleDawn(character);
        break;
      case 'morning':
        this.handleMorning(character);
        break;
      case 'afternoon':
        this.handleAfternoon(character);
        break;
      case 'dusk':
        this.handleDusk(character);
        break;
      case 'night':
        this.handleNight(character);
        break;
    }
  }

  private handleDawn(c: Character): void {
    // Wake up, head to square
    if (c.state === 'sleeping') {
      this.moveTo(c, 'square');
      c.setState('walking');
    } else if (c.state === 'idle' && c.stateTimer > 5) {
      this.moveTo(c, c.workId);
      c.setState('walking');
    }
  }

  private handleMorning(c: Character): void {
    if (c.state !== 'working' && c.state !== 'walking') {
      if (c.currentLocationId === c.workId) {
        c.setState('working');
      } else {
        this.moveTo(c, c.workId);
        c.setState('walking');
      }
    } else if (c.state === 'working' && c.stateTimer > 15) {
      // Occasionally take a break
      if (Math.random() < 0.3) {
        this.moveTo(c, 'well');
        c.setState('walking');
      }
    }
  }

  private handleAfternoon(c: Character): void {
    if (c.state === 'walking') return;

    if (c.stateTimer > 10) {
      if (c.state === 'eating') {
        this.moveTo(c, c.workId);
        c.setState('walking');
      } else if (c.state === 'working' || c.state === 'idle') {
        // Lunch break or random movement
        if (Math.random() < 0.4) {
          this.moveTo(c, 'square');
          c.setState('walking');
        } else {
          c.setState('eating');
        }
      }
    }
  }

  private handleDusk(c: Character): void {
    if (c.state === 'walking') return;

    if (c.currentLocationId === 'square') {
      c.setState('socializing');
    } else if (c.stateTimer > 8) {
      this.moveTo(c, 'square');
      c.setState('walking');
    }
  }

  private handleNight(c: Character): void {
    if (c.state === 'sleeping') return;
    if (c.state === 'walking') return;

    if (c.currentLocationId === c.homeId) {
      c.setState('sleeping');
    } else {
      this.moveTo(c, c.homeId);
      c.setState('walking');
    }
  }

  private moveTo(c: Character, targetId: string): void {
    const currentId = c.currentLocationId;
    const path = this.navGraph.findPath(currentId, targetId);
    const positions = this.navGraph.getPositionsForPath(path);
    if (positions.length > 0) {
      c.setPath(positions);
      c.targetLocationId = targetId;
    }
  }

  // Animals: simple random wandering
  updateAnimal(animal: Animal, time: TimeSystem): void {
    if (animal.isMoving()) return;
    if (animal.stateTimer < 5) return;

    const phase = time.getDayPhase();

    if (phase === 'night') {
      animal.state = 'sleeping';
      return;
    }

    // Random behavior
    const r = Math.random();
    if (r < 0.3) {
      // Wander to a nearby point
      const nearby = this.getAnimalWanderTarget(animal);
      if (nearby) {
        const path = this.navGraph.findPath(animal.currentLocationId, nearby);
        const positions = this.navGraph.getPositionsForPath(path);
        if (positions.length > 0) {
          animal.setPath(positions);
          animal.targetLocationId = nearby;
          animal.state = 'walking';
          animal.stateTimer = 0;
        }
      }
    } else if (r < 0.6) {
      animal.state = 'grazing';
      animal.stateTimer = 0;
    } else {
      animal.state = 'idle';
      animal.stateTimer = 0;
    }
  }

  private getAnimalWanderTarget(animal: Animal): string | null {
    const current = this.navGraph.getPoint(animal.currentLocationId);
    if (!current || current.connections.length === 0) {
      return this.navGraph.getRandomPointId();
    }
    // Pick a random connected point
    const connections = current.connections;
    return connections[Math.floor(Math.random() * connections.length)];
  }
}
