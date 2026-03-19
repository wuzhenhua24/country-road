type EventCallback = (...args: any[]) => void;

class EventBus {
  private listeners = new Map<string, Set<EventCallback>>();

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(cb => cb(...args));
  }
}

export const eventBus = new EventBus();

// Event types
export const Events = {
  TIME_UPDATED: 'time:updated',
  DAY_PHASE_CHANGED: 'time:phaseChanged',
  SPEED_CHANGED: 'time:speedChanged',
  CHARACTER_ARRIVED: 'character:arrived',
  CHARACTER_STATE_CHANGED: 'character:stateChanged',
  CHARACTER_SELECTED: 'character:selected',
  AI_DECISION: 'ai:decision',
  AI_ERROR: 'ai:error',
} as const;
