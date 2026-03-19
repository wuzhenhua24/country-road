import { Character, CharacterState } from '../entities/Character';
import { GeminiClient } from './GeminiClient';
import { PromptBuilder } from './PromptBuilder';
import { DecisionCache } from './DecisionCache';
import { NavigationGraph } from '../systems/NavigationGraph';
import { TimeSystem } from '../systems/TimeSystem';
import { AI_BATCH_INTERVAL, AI_BATCH_SIZE } from '../config';
import { Logger } from '../utils/Logger';

const TAG = 'AI';

const VALID_ACTIONS: Set<string> = new Set([
  'idle', 'walking', 'working', 'eating', 'sleeping', 'socializing',
]);

interface AIDecision {
  name: string;
  action: CharacterState;
  targetLocation: string | null;
  reason: string;
}

export class AIDirector {
  private client: GeminiClient;
  private promptBuilder: PromptBuilder;
  private cache: DecisionCache;
  private navGraph: NavigationGraph;
  private lastRequestTime = 0;
  private pending = false;

  constructor(navGraph: NavigationGraph) {
    this.client = new GeminiClient();
    this.promptBuilder = new PromptBuilder();
    this.cache = new DecisionCache();
    this.navGraph = navGraph;
    Logger.info(TAG, `Director initialized. Gemini API ${this.client.isAvailable() ? 'AVAILABLE' : 'NOT AVAILABLE (no key)'}`);
  }

  isAvailable(): boolean {
    return this.client.isAvailable();
  }

  async update(characters: Character[], time: TimeSystem): Promise<void> {
    if (!this.isAvailable() || this.pending) return;

    const now = Date.now();
    if (now - this.lastRequestTime < AI_BATCH_INTERVAL) return;

    const dayPhase = time.getDayPhase();
    const batch = this.selectBatch(characters);
    if (batch.length === 0) return;

    // Try cache first for each character
    const uncached: Character[] = [];
    const charMap = new Map(characters.map(c => [c.name, c]));

    for (const c of batch) {
      const key = this.cache.buildKey(c.role, c.state, c.currentLocationId, dayPhase);
      const cached = this.cache.get(key);
      if (cached) {
        try {
          const decision: AIDecision = JSON.parse(cached);
          this.applyDecision(decision, charMap);
          Logger.debug(TAG, `Cache hit for ${c.name}`);
        } catch {
          uncached.push(c);
        }
      } else {
        uncached.push(c);
      }
    }

    if (uncached.length === 0) return;

    this.pending = true;
    this.lastRequestTime = now;

    try {
      Logger.info(TAG, `Requesting decisions for: ${uncached.map(c => c.name).join(', ')}`);
      const prompt = this.promptBuilder.buildBatchPrompt(uncached, time);
      const response = await this.client.generate(prompt);
      if (response) {
        this.applyDecisions(response, characters, dayPhase);
      } else {
        Logger.warn(TAG, 'No response from Gemini');
      }
    } catch (err) {
      Logger.warn(TAG, 'Director error:', err);
    } finally {
      this.pending = false;
    }
  }

  private selectBatch(characters: Character[]): Character[] {
    const sorted = [...characters].sort((a, b) => b.stateTimer - a.stateTimer);
    return sorted.slice(0, AI_BATCH_SIZE);
  }

  private validateDecision(d: unknown): d is AIDecision {
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

  private applyDecision(decision: AIDecision, charMap: Map<string, Character>): void {
    const character = charMap.get(decision.name);
    if (!character) return;

    Logger.debug(TAG, `${decision.name}: ${decision.action} → ${decision.targetLocation ?? 'stay'} (${decision.reason})`);
    character.aiDecisionReason = decision.reason;

    if (decision.targetLocation && decision.targetLocation !== character.currentLocationId) {
      const path = this.navGraph.findPath(character.currentLocationId, decision.targetLocation);
      const positions = this.navGraph.getPositionsForPath(path);
      if (positions.length > 0) {
        character.setPath(positions);
        character.targetLocationId = decision.targetLocation;
        character.setState('walking');
      }
    } else if (decision.action !== 'walking') {
      character.setState(decision.action);
    }
  }

  private applyDecisions(responseText: string, characters: Character[], dayPhase: string): void {
    try {
      const parsed = JSON.parse(responseText);
      if (!Array.isArray(parsed)) {
        Logger.warn(TAG, 'Expected JSON array from AI, got:', typeof parsed);
        return;
      }

      const charMap = new Map(characters.map(c => [c.name, c]));

      for (const raw of parsed) {
        if (!this.validateDecision(raw)) {
          Logger.warn(TAG, 'Skipping invalid decision:', raw);
          continue;
        }

        this.applyDecision(raw, charMap);

        // Cache the decision
        const character = charMap.get(raw.name);
        if (character) {
          const key = this.cache.buildKey(
            character.role,
            character.state,
            character.currentLocationId,
            dayPhase,
          );
          this.cache.set(key, JSON.stringify(raw));
        }
      }
    } catch (err) {
      Logger.warn(TAG, 'Failed to parse AI decisions:', err);
    }
  }
}
