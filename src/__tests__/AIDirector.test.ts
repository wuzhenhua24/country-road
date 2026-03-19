import { describe, it, expect } from 'vitest';

/**
 * Test the AI decision validation and parsing logic.
 * We extract and test the validation rules directly since
 * validateDecision is private — we replicate the same logic here.
 */

const VALID_ACTIONS = new Set([
  'idle', 'walking', 'working', 'eating', 'sleeping', 'socializing',
]);

function validateDecision(d: unknown): boolean {
  if (typeof d !== 'object' || d === null) return false;
  const obj = d as Record<string, unknown>;
  return (
    typeof obj.name === 'string' &&
    typeof obj.action === 'string' &&
    VALID_ACTIONS.has(obj.action) &&
    (obj.targetLocation === null || typeof obj.targetLocation === 'string') &&
    typeof obj.reason === 'string'
  );
}

function parseDecisions(responseText: string): unknown[] {
  const parsed = JSON.parse(responseText);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(validateDecision);
}

describe('AI Decision Validation', () => {
  it('accepts a valid decision', () => {
    expect(validateDecision({
      name: 'Farmer Liu',
      action: 'working',
      targetLocation: 'field_north',
      reason: 'Morning work time',
    })).toBe(true);
  });

  it('accepts null targetLocation', () => {
    expect(validateDecision({
      name: 'Elder Wang',
      action: 'idle',
      targetLocation: null,
      reason: 'Resting',
    })).toBe(true);
  });

  it('rejects unknown action', () => {
    expect(validateDecision({
      name: 'Test',
      action: 'dancing',
      targetLocation: null,
      reason: 'Fun',
    })).toBe(false);
  });

  it('rejects missing name', () => {
    expect(validateDecision({
      action: 'idle',
      targetLocation: null,
      reason: 'ok',
    })).toBe(false);
  });

  it('rejects missing reason', () => {
    expect(validateDecision({
      name: 'Test',
      action: 'idle',
      targetLocation: null,
    })).toBe(false);
  });

  it('rejects non-object input', () => {
    expect(validateDecision(null)).toBe(false);
    expect(validateDecision('string')).toBe(false);
    expect(validateDecision(42)).toBe(false);
  });

  it('rejects numeric targetLocation', () => {
    expect(validateDecision({
      name: 'Test',
      action: 'idle',
      targetLocation: 123,
      reason: 'ok',
    })).toBe(false);
  });
});

describe('AI Decision Parsing', () => {
  it('parses a valid JSON array response', () => {
    const response = JSON.stringify([
      { name: 'A', action: 'working', targetLocation: 'barn', reason: 'work' },
      { name: 'B', action: 'eating', targetLocation: 'square', reason: 'lunch' },
    ]);
    expect(parseDecisions(response)).toHaveLength(2);
  });

  it('filters out invalid entries from response', () => {
    const response = JSON.stringify([
      { name: 'A', action: 'working', targetLocation: 'barn', reason: 'work' },
      { name: 'B', action: 'INVALID', targetLocation: null, reason: 'bad' },
      { garbage: true },
    ]);
    expect(parseDecisions(response)).toHaveLength(1);
  });

  it('returns empty array for non-array JSON', () => {
    expect(parseDecisions('{"not": "array"}')).toEqual([]);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseDecisions('not json at all')).toThrow();
  });

  it('handles empty array', () => {
    expect(parseDecisions('[]')).toEqual([]);
  });

  it('handles all valid actions', () => {
    const actions = ['idle', 'walking', 'working', 'eating', 'sleeping', 'socializing'];
    const decisions = actions.map(action => ({
      name: `NPC_${action}`,
      action,
      targetLocation: null,
      reason: 'test',
    }));
    expect(parseDecisions(JSON.stringify(decisions))).toHaveLength(6);
  });
});
