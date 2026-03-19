import { Character, CharacterState } from '../entities/Character';
import { GeminiClient } from './GeminiClient';
import { PromptBuilder } from './PromptBuilder';
import { DecisionCache } from './DecisionCache';
import { NavigationGraph } from '../systems/NavigationGraph';
import { TimeSystem } from '../systems/TimeSystem';
import { AI_BATCH_INTERVAL, AI_BATCH_SIZE } from '../config';

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
    console.log(`[AI] Director initialized. Gemini API ${this.client.isAvailable() ? 'AVAILABLE' : 'NOT AVAILABLE (no key)'}`);
  }

  isAvailable(): boolean {
    return this.client.isAvailable();
  }

  async update(characters: Character[], time: TimeSystem): Promise<void> {
    if (!this.isAvailable() || this.pending) return;

    const now = Date.now();
    if (now - this.lastRequestTime < AI_BATCH_INTERVAL) return;

    // Pick a batch of characters to get decisions for
    const batch = this.selectBatch(characters);
    if (batch.length === 0) return;

    this.pending = true;
    this.lastRequestTime = now;

    try {
      console.log(`[AI] Requesting decisions for: ${batch.map(c => c.name).join(', ')}`);
      const prompt = this.promptBuilder.buildBatchPrompt(batch, time);
      const response = await this.client.generate(prompt);
      if (response) {
        console.log('[AI] Response received:', response);
        this.applyDecisions(response, characters);
      } else {
        console.warn('[AI] No response from Gemini');
      }
    } catch (err) {
      console.warn('[AI] Director error:', err);
    } finally {
      this.pending = false;
    }
  }

  private selectBatch(characters: Character[]): Character[] {
    // Prioritize characters that have been idle longest
    const sorted = [...characters].sort((a, b) => b.stateTimer - a.stateTimer);
    return sorted.slice(0, AI_BATCH_SIZE);
  }

  private applyDecisions(responseText: string, characters: Character[]): void {
    try {
      const decisions: AIDecision[] = JSON.parse(responseText);
      const charMap = new Map(characters.map(c => [c.name, c]));

      for (const decision of decisions) {
        const character = charMap.get(decision.name);
        if (!character) continue;

        console.log(`[AI] ${decision.name}: ${decision.action} → ${decision.targetLocation ?? 'stay'} (${decision.reason})`);
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

        // Cache the decision
        const key = this.cache.buildKey(
          character.role,
          character.state,
          character.currentLocationId,
          ''
        );
        this.cache.set(key, JSON.stringify(decision));
      }
    } catch (err) {
      console.warn('Failed to parse AI decisions:', err);
    }
  }
}
