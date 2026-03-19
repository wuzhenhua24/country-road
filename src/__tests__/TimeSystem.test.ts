import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock eventBus before importing TimeSystem
vi.mock('../events', () => ({
  eventBus: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
  Events: {
    TIME_UPDATED: 'time:updated',
    SPEED_CHANGED: 'time:speedChanged',
  },
}));

import { TimeSystem } from '../systems/TimeSystem';
import { GAME_MINUTES_PER_SECOND } from '../config';

describe('TimeSystem', () => {
  let time: TimeSystem;

  beforeEach(() => {
    time = new TimeSystem();
  });

  it('starts at 06:00', () => {
    expect(time.getHour()).toBe(6);
    expect(time.getMinute()).toBe(0);
    expect(time.getTimeString()).toBe('06:00');
  });

  it('advances time based on delta and speed', () => {
    // 1 real second = GAME_MINUTES_PER_SECOND game minutes
    time.update(1);
    expect(time.getTotalMinutes()).toBe(6 * 60 + GAME_MINUTES_PER_SECOND);
  });

  it('wraps past midnight', () => {
    // Advance enough to pass 24:00
    const minutesToMidnight = 24 * 60 - 6 * 60; // 18 hours = 1080 minutes
    const seconds = minutesToMidnight / GAME_MINUTES_PER_SECOND;
    time.update(seconds + 1); // just past midnight
    expect(time.getHour()).toBeLessThan(24);
    expect(time.getTotalMinutes()).toBeLessThan(24 * 60);
  });

  it('does not advance when paused', () => {
    time.togglePause();
    expect(time.isPaused()).toBe(true);
    time.update(100);
    expect(time.getTotalMinutes()).toBe(6 * 60);
  });

  it('resumes after unpause', () => {
    time.togglePause();
    time.togglePause();
    expect(time.isPaused()).toBe(false);
    time.update(1);
    expect(time.getTotalMinutes()).toBeGreaterThan(6 * 60);
  });

  it('speed multiplier affects advancement', () => {
    time.setSpeed(3);
    expect(time.getSpeed()).toBe(3);
    time.update(1);
    expect(time.getTotalMinutes()).toBe(6 * 60 + GAME_MINUTES_PER_SECOND * 3);
  });

  // ── getDayPhase ──────────────────────────────────────────────────────────

  describe('getDayPhase', () => {
    function setHour(ts: TimeSystem, hour: number): void {
      // Reset to midnight then advance to desired hour
      const minutesToMidnight = 24 * 60 - ts.getTotalMinutes();
      if (minutesToMidnight < 24 * 60) {
        ts.update(minutesToMidnight / GAME_MINUTES_PER_SECOND);
      }
      if (hour > 0) {
        ts.update((hour * 60) / GAME_MINUTES_PER_SECOND);
      }
    }

    it('night: 0-4', () => {
      setHour(time, 18); // wraps past midnight to ~0:xx
      // Easier: create fresh and advance to hour 3
      const t = new TimeSystem();
      // Advance from 6:00 to next day 3:00 = 21 hours
      t.update((21 * 60) / GAME_MINUTES_PER_SECOND);
      expect(t.getDayPhase()).toBe('night');
    });

    it('dawn: 5-6', () => {
      // TimeSystem starts at 6:00, advance to 5:30 next day
      const t = new TimeSystem();
      t.update((23 * 60 + 30) / GAME_MINUTES_PER_SECOND); // +23.5h → 05:30
      expect(t.getDayPhase()).toBe('dawn');
    });

    it('morning: 7-11', () => {
      const t = new TimeSystem();
      t.update((3 * 60) / GAME_MINUTES_PER_SECOND); // 6:00 + 3h = 9:00
      expect(t.getDayPhase()).toBe('morning');
    });

    it('afternoon: 12-16', () => {
      const t = new TimeSystem();
      t.update((8 * 60) / GAME_MINUTES_PER_SECOND); // 6:00 + 8h = 14:00
      expect(t.getDayPhase()).toBe('afternoon');
    });

    it('dusk: 17-19', () => {
      const t = new TimeSystem();
      t.update((12 * 60) / GAME_MINUTES_PER_SECOND); // 6:00 + 12h = 18:00
      expect(t.getDayPhase()).toBe('dusk');
    });
  });

  // ── getTimeString formatting ─────────────────────────────────────────────

  it('pads single-digit hours and minutes', () => {
    // At start: 06:00 — already padded
    expect(time.getTimeString()).toMatch(/^\d{2}:\d{2}$/);
  });
});
