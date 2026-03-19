import { GAME_MINUTES_PER_SECOND } from '../config';
import { eventBus, Events } from '../events';

export type DayPhase = 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';

export class TimeSystem {
  private gameMinutes = 6 * 60; // Start at 6:00 AM
  private speed = 1;
  private paused = false;

  update(deltaSeconds: number): void {
    if (this.paused) return;
    this.gameMinutes += deltaSeconds * GAME_MINUTES_PER_SECOND * this.speed;
    if (this.gameMinutes >= 24 * 60) {
      this.gameMinutes -= 24 * 60;
    }
    eventBus.emit(Events.TIME_UPDATED, this.getHour(), this.getMinute());
  }

  getHour(): number {
    return Math.floor(this.gameMinutes / 60);
  }

  getMinute(): number {
    return Math.floor(this.gameMinutes % 60);
  }

  getTotalMinutes(): number {
    return this.gameMinutes;
  }

  getTimeString(): string {
    const h = this.getHour().toString().padStart(2, '0');
    const m = this.getMinute().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  getDayPhase(): DayPhase {
    const h = this.getHour();
    if (h >= 5 && h < 7) return 'dawn';
    if (h >= 7 && h < 12) return 'morning';
    if (h >= 12 && h < 17) return 'afternoon';
    if (h >= 17 && h < 20) return 'dusk';
    return 'night';
  }

  setSpeed(speed: number): void {
    this.speed = speed;
    eventBus.emit(Events.SPEED_CHANGED, speed);
  }

  getSpeed(): number {
    return this.speed;
  }

  togglePause(): void {
    this.paused = !this.paused;
  }

  isPaused(): boolean {
    return this.paused;
  }
}
