import { GEMINI_RPM_LIMIT } from '../config';
import { Logger } from '../utils/Logger';

const TAG = 'Gemini';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

export class GeminiClient {
  private apiKey: string;
  private requestTimestamps: number[] = [];
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!this.isAvailable()) {
      Logger.warn(TAG, 'No VITE_GEMINI_API_KEY found in environment. AI features will be disabled.');
    }
  }

  isAvailable(): boolean {
    return this.apiKey.length > 0;
  }

  async generate(prompt: string): Promise<string | null> {
    if (!this.isAvailable()) return null;

    if (!this.canMakeRequest()) {
      Logger.debug(TAG, 'Rate limited, skipping request');
      return null;
    }

    try {
      this.requestTimestamps.push(Date.now());

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        Logger.warn(TAG, `API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data: GeminiResponse = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch (err) {
      Logger.warn(TAG, 'Request failed:', err);
      return null;
    }
  }

  private canMakeRequest(): boolean {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(t => now - t < 60000);
    return this.requestTimestamps.length < GEMINI_RPM_LIMIT;
  }
}
